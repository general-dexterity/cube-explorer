import { useState } from 'react';
import type { CubeRequest } from '../../../types';
import { FilterSection } from '../Filters/filter-section';
import { CodeBlock } from './code-block';
import { QuerySection } from './query-section';

interface RequestDetailsProps {
  request: CubeRequest;
}

export function RequestDetails({ request }: RequestDetailsProps) {
  const [activeTab, setActiveTab] = useState<'query' | 'response' | 'headers'>(
    'query'
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-gray-200 border-b bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm dark:text-gray-100">
            Request Details
          </h3>
          <div className="flex items-center gap-2 text-gray-500 text-xs dark:text-gray-400">
            <span>{new Date(request.timestamp).toLocaleString()}</span>
            {request.duration && (
              <span>• {Math.round(request.duration)}ms</span>
            )}
            <span>• {request.status}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-gray-200 border-b dark:border-gray-700">
        <nav className="flex space-x-8 px-4">
          {(['query', 'response', 'headers'] as const).map((tab) => (
            <button
              className={`border-b-2 px-1 py-2 font-medium text-xs capitalize transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
              }`}
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-4 dark:bg-gray-900">
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
            {request.query.filters && request.query.filters.length > 0 && (
              <FilterSection filters={request.query.filters} />
            )}
            {request.query.timeDimensions &&
              request.query.timeDimensions.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium text-gray-900 text-sm dark:text-gray-100">
                    Time Dimensions
                  </h4>
                  <CodeBlock data={request.query.timeDimensions} />
                </div>
              )}
            <div>
              <h4 className="mb-2 font-medium text-gray-900 text-sm dark:text-gray-100">
                Full Query
              </h4>
              <CodeBlock data={request.query} />
            </div>
          </div>
        )}

        {activeTab === 'response' && (
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium text-gray-900 text-sm dark:text-gray-100">
                Data
              </h4>
              <CodeBlock data={request.response?.results?.[0]?.data} />
            </div>
            {!!request.response?.results?.[0].annotation && (
              <div>
                <h4 className="mb-2 font-medium text-gray-900 text-sm dark:text-gray-100">
                  Annotation
                </h4>
                <CodeBlock data={request.response?.results?.[0].annotation} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'headers' && (
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium text-gray-900 text-sm dark:text-gray-100">
                Request URL
              </h4>
              <div className="break-all rounded border bg-gray-100 p-2 font-mono text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                {request.url}
              </div>
            </div>
            <div>
              <h4 className="mb-2 font-medium text-gray-900 text-sm dark:text-gray-100">
                Domain
              </h4>
              <div className="rounded border bg-gray-100 p-2 font-mono text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                {request.domain}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
