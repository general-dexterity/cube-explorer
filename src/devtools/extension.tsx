import { useEffect, useState } from 'react';
import { SETTINGS_STORAGE_KEY, SETTINGS_VERSION } from '../constants';
import type { CubeQuery, CubeRequest, CubeResponse, Settings } from '../types';
import { EmptyState } from './components/empty-state';
import { RequestDetails } from './components/RequestDetails/request-details';
import { Sidebar } from './components/Sidebar/sidebar';

export default function Extension() {
  const [requests, setRequests] = useState<CubeRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<CubeRequest | null>(
    null
  );
  const [settings, setSettings] = useState<Settings | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    // Load settings with defaults
    chrome.storage.sync.get([SETTINGS_STORAGE_KEY], (result) => {
      const defaultSettings: Settings = {
        urls: ['http://localhost:4000/cubejs-api/v1'],
        autoCapture: true,
        version: SETTINGS_VERSION,
      };
      setSettings(result[SETTINGS_STORAGE_KEY] || defaultSettings);
    });

    // Listen for settings changes
    chrome.storage.onChanged.addListener((changes) => {
      if (changes[SETTINGS_STORAGE_KEY]) {
        setSettings(changes[SETTINGS_STORAGE_KEY].newValue);
      }
    });
  }, []);

  useEffect(() => {
    if (!settings) {
      return;
    }

    const handleRequest = (request: chrome.devtools.network.Request) => {
      const requestUrl = request.request.url;

      // Check if this request matches any of our monitored URLs
      const matchesUrl = settings.urls.some((monitoredUrl) => {
        try {
          const monitored = new URL(monitoredUrl);

          // Match if the request URL starts with the monitored URL
          return requestUrl.startsWith(monitored.origin + monitored.pathname);
        } catch {
          return false;
        }
      });

      if (matchesUrl) {
        request.getContent((content: string) => {
          try {
            const url = new URL(request.request.url);
            const query = JSON.parse(
              request.request.postData?.text ||
                url.searchParams.get('query') ||
                '{}'
            ) as CubeQuery;

            const response = JSON.parse(content) as CubeResponse<unknown>;

            const domain = `${url.hostname}:${url.port || (url.protocol === 'https:' ? '443' : '80')}`;
            const cubeRequest: CubeRequest = {
              id: `${Date.now()}-${Math.random()}`,
              url: request.request.url,
              query,
              response,
              timestamp: Date.now(),
              duration: request.time,
              status: request.response.status,
              domain,
            };

            setRequests((prev) => [cubeRequest, ...prev.slice(0, 99)]); // Keep last 100
          } catch (e) {
            console.error('Failed to parse Cube request:', e);
          }
        });
      }
    };

    chrome.devtools.network.onRequestFinished.addListener(handleRequest);

    return () => {
      chrome.devtools.network.onRequestFinished.removeListener(handleRequest);
    };
  }, [settings]);

  const clearRequests = () => {
    setRequests([]);
    setSelectedRequest(null);
  };

  return (
    <div className="flex h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <Sidebar
        filter={filter}
        onClearRequests={clearRequests}
        onFilterChange={setFilter}
        onRequestSelect={setSelectedRequest}
        requests={requests}
        selectedRequest={selectedRequest}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {selectedRequest ? (
          <RequestDetails request={selectedRequest} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
