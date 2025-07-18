import {
  GearSixIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { useState } from 'react';
import type { CubeRequest, Settings } from '../../../types';
import { RequestItem } from './request-item';
import { SettingsPanel } from './settings-panel';

interface SidebarProps {
  requests: CubeRequest[];
  selectedRequest: CubeRequest | null;
  settings: Settings | null;
  filter: string;
  onFilterChange: (filter: string) => void;
  onRequestSelect: (request: CubeRequest) => void;
  onClearRequests: () => void;
}

export function Sidebar({
  requests,
  selectedRequest,
  settings,
  filter,
  onFilterChange,
  onRequestSelect,
  onClearRequests,
}: SidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const filteredRequests = requests.filter((req) =>
    JSON.stringify(req.query).toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex w-80 flex-col border-gray-200 border-r dark:border-gray-700">
      {/* Header */}
      <div className="border-gray-200 border-b bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-sm dark:text-gray-100">
            Cube Explorer Requests
          </h2>
          <div className="flex gap-1">
            <button
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={onClearRequests}
              title="Clear requests"
              type="button"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
            <button
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              title="Settings"
              type="button"
            >
              <GearSixIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="relative">
          <input
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
            onChange={(e) => onFilterChange(e.target.value)}
            placeholder="Filter requests..."
            type="text"
            value={filter}
          />
          <MagnifyingGlassIcon className="absolute top-1.5 right-2 h-4 w-4 text-gray-400" />
        </div>
        {filter && (
          <div className="mt-2 text-center text-gray-500 text-xs dark:text-gray-400">
            {filteredRequests.length} of {requests.length} requests
          </div>
        )}
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Request List */}
      <div className="flex-1 overflow-auto dark:bg-gray-800">
        {filteredRequests.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-xs">
            {requests.length === 0 ? (
              <>
                Listening for Cube Explorer requests...
                <br />
                <span className="text-gray-400 dark:text-gray-500">
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
              onClick={() => onRequestSelect(request)}
              request={request}
            />
          ))
        )}
      </div>
    </div>
  );
}
