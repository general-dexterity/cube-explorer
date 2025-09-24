import { PushPinIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import type { CubeRequest } from '../../../types';
import { HeadersTab, QueryTab, ResponseTab } from './tabs';

interface RequestDetailsProps {
  request: CubeRequest;
  isPinned: boolean;
  onTogglePin: (request: CubeRequest) => void;
}

export function RequestDetails({
  request,
  isPinned,
  onTogglePin,
}: RequestDetailsProps) {
  const [activeTab, setActiveTab] = useState<'query' | 'response' | 'headers'>(
    'query',
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-gray-200 border-b bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-sm dark:text-gray-100">
              Request Details
            </h3>
            <button
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={() => onTogglePin(request)}
              title={isPinned ? 'Unpin request' : 'Pin request'}
            >
              <PushPinIcon
                className="h-4 w-4"
                weight={isPinned ? 'fill' : 'regular'}
              />
            </button>
          </div>
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
              className="border-transparent border-b-2 px-1 py-2 font-medium text-gray-500 text-xs capitalize transition-colors hover:border-gray-300 hover:text-gray-700 data-active:border-blue-500 data-active:text-blue-600 dark:text-gray-400 data-active:dark:text-blue-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
              data-active={activeTab === tab || undefined}
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
        {activeTab === 'query' && <QueryTab request={request} />}
        {activeTab === 'response' && <ResponseTab request={request} />}
        {activeTab === 'headers' && <HeadersTab request={request} />}
      </div>
    </div>
  );
}
