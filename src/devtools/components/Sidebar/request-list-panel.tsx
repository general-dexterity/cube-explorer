import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import type { CubeRequest } from '../../../types';
import { PinnedRequestsSection } from './pinned-requests-section';
import { RequestItem } from './request-item';

interface RequestListPanelProps {
  requests: CubeRequest[];
  pinned: CubeRequest[];
  selectedRequest: CubeRequest | null;
  filter: string;
  onFilterChange: (filter: string) => void;
  onRequestSelect: (request: CubeRequest) => void;
  showSearch: boolean;
}

export function RequestListPanel({
  requests,
  pinned,
  selectedRequest,
  filter,
  onFilterChange,
  onRequestSelect,
  showSearch,
}: RequestListPanelProps) {
  const filteredPinned = pinned.filter((req) =>
    JSON.stringify(req.query).toLowerCase().includes(filter.toLowerCase())
  );

  const filteredRequests = requests.filter((req) => {
    const matchesFilter = JSON.stringify(req.query)
      .toLowerCase()
      .includes(filter.toLowerCase());
    // Exclude pinned requests from regular list to avoid duplicates
    const notPinned = !pinned.some((p) => p.id === req.id);
    return matchesFilter && notPinned;
  });

  return (
    <>
      {showSearch && (
        <div className="border-gray-200 border-b bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="relative">
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 pr-8 text-xs focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
              onChange={(e) => onFilterChange(e.target.value)}
              placeholder="Filter requests..."
              type="text"
              value={filter}
            />
            <MagnifyingGlassIcon className="absolute top-1.5 right-2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
          {filter && (
            <div className="mt-2 text-center text-gray-500 text-xs dark:text-gray-400">
              {filteredPinned.length + filteredRequests.length} of{' '}
              {requests.length} requests
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-auto dark:bg-gray-800">
        {/* Pinned Section - Always displayed */}
        <PinnedRequestsSection
          filter={filter}
          onRequestSelect={onRequestSelect}
          pinnedRequests={pinned}
          selectedRequest={selectedRequest}
        />

        {/* Separator - only show if there are both pinned and regular requests */}
        {filteredPinned.length > 0 && filteredRequests.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700" />
        )}

        {/* Regular Requests */}
        {filteredRequests.length === 0 && requests.length > 0 ? (
          <div className="p-4 text-center text-gray-500 text-xs dark:text-gray-400">
            No requests match your filter
          </div>
        ) : requests.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-xs dark:text-gray-400">
            Listening for Cube Explorer requests...
          </div>
        ) : (
          filteredRequests.map((request) => (
            <RequestItem
              isPinned={false}
              isSelected={selectedRequest?.id === request.id}
              key={request.id}
              onClick={() => onRequestSelect(request)}
              request={request}
            />
          ))
        )}
      </div>
    </>
  );
}
