import { useEffect, useState } from 'react';
import type { CubeRequest, CubeQuery, CubeResponse, Settings } from '../types';

export default function App() {
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
            const query = JSON.parse(request.request.postData?.text || '{}') as CubeQuery;
            const response = JSON.parse(content) as CubeResponse;

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

  const filteredRequests = requests.filter((req) =>
    JSON.stringify(req.query).toLowerCase().includes(filter.toLowerCase())
  );

  const openSettings = () => {
    chrome.runtime.openOptionsPage();
  };

  const clearRequests = () => {
    setRequests([]);
    setSelectedRequest(null);
  };

  return (
    <div className="flex h-screen bg-white text-gray-900">
      {/* Sidebar */}
      <div className="flex w-80 flex-col border-gray-200 border-r">
        {/* Header */}
        <div className="border-gray-200 border-b bg-gray-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">
              Cube Explorer Requests
            </h2>
            <div className="flex gap-1">
              <button
                className="p-1 text-gray-500 hover:text-gray-700"
                onClick={clearRequests}
                title="Clear requests"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>
              <button
                className="p-1 text-gray-500 hover:text-gray-700"
                onClick={openSettings}
                title="Settings"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                  <path
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="relative">
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter requests..."
              type="text"
              value={filter}
            />
            <svg
              className="absolute top-1.5 right-2 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
        </div>

        {/* Request List */}
        <div className="flex-1 overflow-auto">
          {filteredRequests.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-xs">
              {requests.length === 0 ? (
                <>
                  Listening for Cube Explorer requests...
                  <br />
                  <span className="text-gray-400">
                    {settings?.domains.join(', ')}
                  </span>
                </>
              ) : (
                'No requests match your filter'
              )}
            </div>
          ) : (
            filteredRequests.map((request) => (
              <RequestItem
                isSelected={selectedRequest?.id === request.id}
                key={request.id}
                onClick={() => setSelectedRequest(request)}
                request={request}
              />
            ))
          )}
        </div>
      </div>

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

function RequestItem({
  request,
  isSelected,
  onClick,
}: {
  request: CubeRequest;
  isSelected: boolean;
  onClick: () => void;
}) {
  const statusColor = request.status >= 400 ? 'text-red-600' : 'text-green-600';

  return (
    <div
      className={`cursor-pointer border-gray-100 border-b p-3 transition-colors hover:bg-blue-50 ${isSelected ? 'border-blue-300 bg-blue-100' : ''}`}
      onClick={onClick}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="font-medium text-gray-900 text-xs">
          {new Date(request.timestamp).toLocaleTimeString()}
        </span>
        <div className="flex items-center gap-2">
          <span className={`font-mono text-xs ${statusColor}`}>
            {request.status}
          </span>
          {request.duration && (
            <span className="text-gray-500 text-xs">
              {Math.round(request.duration)}ms
            </span>
          )}
        </div>
      </div>

      <div className="mb-1 flex flex-wrap gap-1 text-gray-600 text-xs">
        {request.query.measures?.length ? (
          <span className="inline-flex items-center rounded bg-blue-100 px-1.5 py-0.5 font-medium text-blue-800 text-xs">
            {request.query.measures.length} measure
            {request.query.measures.length !== 1 ? 's' : ''}
          </span>
        ) : null}
        {request.query.dimensions?.length ? (
          <span className="inline-flex items-center rounded bg-green-100 px-1.5 py-0.5 font-medium text-green-800 text-xs">
            {request.query.dimensions.length} dimension
            {request.query.dimensions.length !== 1 ? 's' : ''}
          </span>
        ) : null}
        {request.query.filters?.length ? (
          <span className="inline-flex items-center rounded bg-yellow-100 px-1.5 py-0.5 font-medium text-xs text-yellow-800">
            {request.query.filters.length} filter
            {request.query.filters.length !== 1 ? 's' : ''}
          </span>
        ) : null}
      </div>

      <div className="truncate text-gray-500 text-xs">
        {request.domain} • {request.url.split('/').pop()}
      </div>
    </div>
  );
}

function RequestDetails({ request }: { request: CubeRequest }) {
  const [activeTab, setActiveTab] = useState<'query' | 'response' | 'headers'>(
    'query'
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-gray-200 border-b bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">
            Request Details
          </h3>
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <span>{new Date(request.timestamp).toLocaleString()}</span>
            {request.duration && (
              <span>• {Math.round(request.duration)}ms</span>
            )}
            <span>• {request.status}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-gray-200 border-b">
        <nav className="flex space-x-8 px-4">
          {(['query', 'response', 'headers'] as const).map((tab) => (
            <button
              className={`border-b-2 px-1 py-2 font-medium text-xs capitalize transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
              key={tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'query' && (
          <div className="space-y-4">
            <QuerySection
              color="blue"
              items={request.query.measures}
              title="Measures"
            />
            <QuerySection
              color="green"
              items={request.query.dimensions}
              title="Dimensions"
            />
            <QuerySection
              color="yellow"
              items={request.query.filters as string[] | undefined}
              title="Filters"
            />
            {request.query.timeDimensions && request.query.timeDimensions.length > 0 && (
              <div>
                <h4 className="mb-2 font-medium text-gray-900 text-sm">
                  Time Dimensions
                </h4>
                <CodeBlock data={request.query.timeDimensions} />
              </div>
            )}
            <div>
              <h4 className="mb-2 font-medium text-gray-900 text-sm">
                Full Query
              </h4>
              <CodeBlock data={request.query} />
            </div>
          </div>
        )}

        {activeTab === 'response' && (
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium text-gray-900 text-sm">Data</h4>
              <CodeBlock data={request.response.data} />
            </div>
            {request.response.annotation != null && (
              <div>
                <h4 className="mb-2 font-medium text-gray-900 text-sm">
                  Annotation
                </h4>
                <CodeBlock data={request.response.annotation} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'headers' && (
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium text-gray-900 text-sm">
                Request URL
              </h4>
              <div className="break-all rounded border bg-gray-100 p-2 font-mono text-xs">
                {request.url}
              </div>
            </div>
            <div>
              <h4 className="mb-2 font-medium text-gray-900 text-sm">Domain</h4>
              <div className="rounded border bg-gray-100 p-2 font-mono text-xs">
                {request.domain}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuerySection({
  title,
  items,
  color,
}: {
  title: string;
  items?: string[];
  color: 'blue' | 'green' | 'yellow';
}) {
  if (!items?.length) return null;

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  };

  return (
    <div>
      <h4 className="mb-2 font-medium text-gray-900 text-sm">{title}</h4>
      <div className="flex flex-wrap gap-1">
        {items.map((item, index) => (
          <span
            className={`inline-flex items-center rounded-md border px-2 py-1 font-medium text-xs ${colorClasses[color]}`}
            key={index}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function CodeBlock({ data }: { data: unknown }) {
  return (
    <pre className="max-h-96 overflow-auto rounded-lg border bg-gray-900 p-3 font-mono text-gray-100 text-xs">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center text-gray-500">
      <div className="text-center">
        <svg
          className="mx-auto mb-4 h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
          />
        </svg>
        <h3 className="mb-1 font-medium text-gray-900 text-sm">
          No request selected
        </h3>
        <p className="text-gray-500 text-xs">
          Choose a Cube request from the sidebar to view details
        </p>
      </div>
    </div>
  );
}
