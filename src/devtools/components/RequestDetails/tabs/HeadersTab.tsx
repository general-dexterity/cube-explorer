import type { CubeRequest } from '../../../../types';

interface HeadersTabProps {
  request: CubeRequest;
}

export function HeadersTab({ request }: HeadersTabProps) {
  return (
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
  );
}
