import {
  ArrowLeftIcon,
  GearSixIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { useState } from 'react';
import { type CubeRequest, SidebarPanel } from '../../../types';
import { RequestListPanel } from './request-list-panel';
import { SettingsPanel } from './settings-panel';

interface SidebarProps {
  requests: CubeRequest[];
  pinned: CubeRequest[];
  selectedRequest: CubeRequest | null;
  filter: string;
  onFilterChange: (filter: string) => void;
  onRequestSelect: (request: CubeRequest) => void;
  onClearRequests: () => void;
}

export function Sidebar({
  requests,
  pinned,
  selectedRequest,
  filter,
  onFilterChange,
  onRequestSelect,
  onClearRequests,
}: SidebarProps) {
  const [activePanel, setActivePanel] = useState<SidebarPanel>(
    SidebarPanel.Requests,
  );
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="flex w-80 flex-col border-gray-200 border-r dark:border-gray-700">
      {/* Header */}
      <div className="border-gray-200 border-b bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={() =>
                setActivePanel(
                  activePanel === SidebarPanel.Settings
                    ? SidebarPanel.Requests
                    : SidebarPanel.Settings,
                )
              }
              title={
                activePanel === SidebarPanel.Settings ? 'Requests' : 'Settings'
              }
              type="button"
            >
              {activePanel === SidebarPanel.Settings ? (
                <ArrowLeftIcon className="h-4 w-4" />
              ) : (
                <GearSixIcon className="h-4 w-4" />
              )}
            </button>
            <h2 className="font-semibold text-gray-900 text-sm dark:text-gray-100">
              {activePanel === SidebarPanel.Settings ? 'Settings' : 'Requests'}
            </h2>
          </div>
          <div className="flex gap-1">
            {activePanel === SidebarPanel.Requests && (
              <>
                <button
                  className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  onClick={() => setShowSearch(!showSearch)}
                  title={showSearch ? 'Hide search' : 'Show search'}
                  type="button"
                >
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </button>
                <button
                  className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  onClick={onClearRequests}
                  title="Clear requests"
                  type="button"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {activePanel === SidebarPanel.Settings ? (
        <SettingsPanel />
      ) : (
        <RequestListPanel
          filter={filter}
          onFilterChange={onFilterChange}
          onRequestSelect={onRequestSelect}
          pinned={pinned}
          requests={requests}
          selectedRequest={selectedRequest}
          showSearch={showSearch}
        />
      )}
    </div>
  );
}
