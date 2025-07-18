import type { CubeRequest } from '../../../types';

interface RequestItemProps {
  request: CubeRequest;
  isSelected: boolean;
  onClick: () => void;
}

function RequestTag({
  count,
  type,
  color,
}: {
  count: number;
  type: string;
  color: 'blue' | 'green' | 'yellow';
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    yellow:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  return (
    <span
      className={`inline-flex flex-shrink-0 items-center rounded px-1.5 py-0.5 font-medium text-xs ${colorClasses[color]}`}
    >
      {count} {type}
      {count !== 1 ? 's' : ''}
    </span>
  );
}

export function RequestItem({
  request,
  isSelected,
  onClick,
}: RequestItemProps) {
  // Extract cube names from measures and dimensions
  const getCubeNames = (): string[] => {
    const cubes = new Set<string>();
    for (const item of [
      ...(request.query.measures || []),
      ...(request.query.dimensions || []),
    ]) {
      const [cube] = item.split('.');
      if (cube) {
        cubes.add(cube);
      }
    }
    return Array.from(cubes);
  };

  const cubeNames = getCubeNames();

  const isError = request.status >= 400;

  return (
    <button
      className="w-full cursor-pointer border-gray-100 border-b p-3 text-left transition-colors hover:bg-blue-50 data-selected:border-blue-300 data-error:bg-red-50 data-selected:bg-blue-100 dark:border-gray-700 data-selected:dark:border-blue-600 data-error:dark:bg-red-950 data-selected:dark:bg-gray-700 dark:hover:bg-gray-700"
      data-error={isError || undefined}
      data-selected={isSelected || undefined}
      onClick={onClick}
      tabIndex={0}
      type="button"
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="font-medium text-gray-900 text-xs dark:text-gray-100">
          {new Date(request.timestamp).toLocaleTimeString()}
        </span>
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-xs data-error:text-red-600 data-success:text-green-600"
            data-error={request.status >= 400 || undefined}
            data-success={request.status < 400 || undefined}
          >
            {request.status}
          </span>
          {request.duration && (
            <span className="text-gray-500 text-xs">
              {Math.round(request.duration)}ms
            </span>
          )}
        </div>
      </div>

      {/* Cube name display */}
      {cubeNames.length > 0 && (
        <div className="mb-1 flex items-center gap-1 overflow-hidden">
          <span className="truncate font-medium font-mono text-gray-900 text-sm dark:text-gray-100">
            {cubeNames[0]}
          </span>
          {cubeNames.length > 1 && (
            <span className="flex-shrink-0 rounded bg-gray-200 px-1.5 py-0.5 font-medium text-gray-600 text-xs dark:bg-gray-700 dark:text-gray-300">
              +{cubeNames.length - 1}
            </span>
          )}
        </div>
      )}

      <div className="overflow-hidden">
        <div className="flex gap-1 text-gray-600 text-xs dark:text-gray-400">
          {request.query.measures?.length ? (
            <RequestTag
              color="blue"
              count={request.query.measures.length}
              type="measure"
            />
          ) : null}
          {request.query.dimensions?.length ? (
            <RequestTag
              color="green"
              count={request.query.dimensions.length}
              type="dimension"
            />
          ) : null}
          {request.query.filters?.length ? (
            <RequestTag
              color="yellow"
              count={request.query.filters.length}
              type="filter"
            />
          ) : null}
        </div>
      </div>
    </button>
  );
}
