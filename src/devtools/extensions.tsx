import { useEffect, useState } from 'react';
import type { CubeQuery, CubeRequest, CubeResponse, Settings } from '../types';
import { EmptyState } from './components/empty-state';
import { RequestDetails } from './components/RequestDetails/request-details';
import { Sidebar } from './components/Sidebar/sidebar';

export default function Extensions() {
  const [requests, setRequests] = useState<CubeRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<CubeRequest | null>(
    null
  );
  const [settings, setSettings] = useState<Settings | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    // Load settings with defaults
    chrome.storage.sync.get(['cubeExplorerSettings'], (result) => {
      const defaultSettings: Settings = {
        domains: ['localhost:4000'],
        endpoints: ['/cubejs-api/v1/load'],
        jwtTokens: {},
        autoCapture: true,
      };
      setSettings(result.cubeExplorerSettings || defaultSettings);
    });

    // Listen for settings changes
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.cubeExplorerSettings) {
        setSettings(changes.cubeExplorerSettings.newValue);
      }
    });
  }, []);

  useEffect(() => {
    if (!settings) {
      return;
    }

    const handleRequest = (request: chrome.devtools.network.Request) => {
      const url = new URL(request.request.url);
      const domain = `${url.hostname}:${url.port || (url.protocol === 'https:' ? '443' : '80')}`;

      // Check if this request matches our filter criteria
      const matchesDomain = settings.domains.some((d) => domain.includes(d));
      const matchesEndpoint = settings.endpoints.some((e) =>
        url.pathname.includes(e)
      );

      if (matchesDomain && matchesEndpoint) {
        request.getContent((content: string) => {
          try {
            const query = JSON.parse(
              request.request.postData?.text ||
                url.searchParams.get('query') ||
                '{}'
            ) as CubeQuery;

            const response = JSON.parse(content) as CubeResponse<unknown>;

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
        settings={settings}
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
