import { Collapsible } from '@ark-ui/react/collapsible';
import { CaretDownIcon, PushPinIcon } from '@phosphor-icons/react';
import { cn } from '@/devtools/utils/styles';
import type { CubeRequest } from '../../../types';
import { RequestItem } from './request-item';

interface PinnedRequestsSectionProps {
  pinnedRequests: CubeRequest[];
  selectedRequest: CubeRequest | null;
  filter: string;
  onRequestSelect: (request: CubeRequest) => void;
}

export function PinnedRequestsSection({
  pinnedRequests,
  selectedRequest,
  filter,
  onRequestSelect,
}: PinnedRequestsSectionProps) {
  const filteredPinned = pinnedRequests.filter((req) =>
    JSON.stringify(req.query).toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Collapsible.Root defaultOpen={true} unmountOnExit={true}>
      <div
        className={cn([
          'data-[state=open]:mb-4',
          'data-[state=open]:border-b data-[state=open]:border-gray-100 data-[state=open]:dark:border-gray-700',
        ])}
      >
        <Collapsible.Trigger className="flex w-full items-center justify-between px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
          <span>Pinned ({filteredPinned.length})</span>
          <CaretDownIcon className="h-3 w-3 transition-transform duration-200 data-[state=open]:rotate-180" />
        </Collapsible.Trigger>

        <Collapsible.Content>
          {filteredPinned.length === 0 ? (
            <div className="px-4 py-3 text-center text-gray-500 text-xs dark:text-gray-400">
              <div className="mb-2">
                <PushPinIcon className="mx-auto h-6 w-6 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="mb-1 font-medium">No pinned queries</p>
              <p className="text-gray-400 dark:text-gray-500">
                Click the pin button next to "Request Details" to pin a query
                for quick access
              </p>
            </div>
          ) : (
            filteredPinned.map((request) => (
              <RequestItem
                isPinned={true}
                isSelected={selectedRequest?.id === request.id}
                key={request.id}
                onClick={() => onRequestSelect(request)}
                request={request}
              />
            ))
          )}
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  );
}
