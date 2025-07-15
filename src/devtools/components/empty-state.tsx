import { ChartBarIcon } from '@phosphor-icons/react';

export function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center text-gray-500">
      <div className="text-center">
        <ChartBarIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-1 font-medium text-gray-900 text-sm dark:text-gray-100">
          No request selected
        </h3>
        <p className="text-gray-500 text-xs dark:text-gray-400">
          Choose a Cube request from the sidebar to view details
        </p>
      </div>
    </div>
  );
}
