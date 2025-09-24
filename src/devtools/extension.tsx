import { useCallback, useEffect, useState } from 'react';
import {
  PINNED_REQUESTS_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  SETTINGS_VERSION,
} from '../constants';
import type { CubeQuery, CubeRequest, CubeResponse, Settings } from '../types';
import { EmptyState } from './components/empty-state';
import { RequestDetails } from './components/RequestDetails/request-details';
import { Sidebar } from './components/Sidebar/sidebar';

export default function Extension() {
  const [requests, setRequests] = useState<CubeRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<CubeRequest | null>(
    null,
  );
  const [settings, setSettings] = useState<Settings | null>(null);
  const [filter, setFilter] = useState('');
  const [pinned, setPinned] = useState<CubeRequest[]>([]);

  useEffect(() => {
    // Load settings with defaults
    chrome.storage.sync.get([SETTINGS_STORAGE_KEY], async (result) => {
      const defaultSettings: Settings = {
        urls: ['http://localhost:4000/cubejs-api/v1'],
        autoCapture: true,
        version: SETTINGS_VERSION,
      };

      // TODO: Migrations
      const settings = {
        ...defaultSettings,
        ...result[SETTINGS_STORAGE_KEY],
      };

      setSettings(settings);
    });

    // Load pinned requests
    chrome.storage.sync.get([PINNED_REQUESTS_STORAGE_KEY], (result) => {
      setPinned(result[PINNED_REQUESTS_STORAGE_KEY] || []);
    });

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes) => {
      if (changes[SETTINGS_STORAGE_KEY]) {
        setSettings(changes[SETTINGS_STORAGE_KEY].newValue);
      }
      if (changes[PINNED_REQUESTS_STORAGE_KEY]) {
        setPinned(changes[PINNED_REQUESTS_STORAGE_KEY].newValue || []);
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
        return (
          requestUrl.startsWith(monitoredUrl) && request.response.status === 200
        );
      });

      if (matchesUrl) {
        request.getContent((content: string) => {
          try {
            const url = new URL(request.request.url);
            const query = JSON.parse(
              request.request.postData?.text ||
                url.searchParams.get('query') ||
                '{}',
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

  const savePinned = useCallback((next: CubeRequest[]) => {
    setPinned(next);
    chrome.storage.sync.set({ [PINNED_REQUESTS_STORAGE_KEY]: next });
  }, []);

  const togglePin = useCallback(
    (req: CubeRequest) => {
      const exists = pinned.some((r) => r.id === req.id);
      if (exists) {
        savePinned(pinned.filter((r) => r.id !== req.id));
      } else {
        savePinned([req, ...pinned]);
      }
    },
    [pinned, savePinned],
  );

  // Combine requests with pinned first, no duplicates
  const sidebarRequests = [
    ...pinned,
    ...requests.filter((r) => !pinned.some((p) => p.id === r.id)),
  ];

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
        pinned={pinned}
        requests={sidebarRequests}
        selectedRequest={selectedRequest}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {selectedRequest ? (
          <RequestDetails
            isPinned={pinned.some((r) => r.id === selectedRequest.id)}
            onTogglePin={togglePin}
            request={selectedRequest}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
