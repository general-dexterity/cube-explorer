import type { CubeRequest } from '../../../types';

interface RequestItemProps {
  request: CubeRequest;
  isSelected: boolean;
  onClick: () => void;
}

export function RequestItem({
  request,
  isSelected,
  onClick,
}: RequestItemProps) {
  const statusColor = request.status >= 400 ? 'text-red-600' : 'text-green-600';

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

  return (
    <button
      className={`cursor-pointer border-gray-100 border-b p-3 transition-colors hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-gray-700 ${isSelected ? 'border-blue-300 bg-blue-100 dark:border-blue-600 dark:bg-gray-700' : ''}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      type="button"
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="font-medium text-gray-900 text-xs dark:text-gray-100">
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

      <div className="mb-1 flex flex-wrap gap-1 text-gray-600 text-xs dark:text-gray-400">
        {cubeNames.length > 0 && (
          <span className="inline-flex items-center rounded bg-purple-100 px-1.5 py-0.5 font-medium text-purple-800 text-xs dark:bg-purple-900 dark:text-purple-200">
            {cubeNames.length} cube{cubeNames.length !== 1 ? 's' : ''}:{' '}
            {cubeNames.join(', ')}
          </span>
        )}
        {request.query.measures?.length ? (
          <span className="inline-flex items-center rounded bg-blue-100 px-1.5 py-0.5 font-medium text-blue-800 text-xs dark:bg-blue-900 dark:text-blue-200">
            {request.query.measures.length} measure
            {request.query.measures.length !== 1 ? 's' : ''}
          </span>
        ) : null}
        {request.query.dimensions?.length ? (
          <span className="inline-flex items-center rounded bg-green-100 px-1.5 py-0.5 font-medium text-green-800 text-xs dark:bg-green-900 dark:text-green-200">
            {request.query.dimensions.length} dimension
            {request.query.dimensions.length !== 1 ? 's' : ''}
          </span>
        ) : null}
        {request.query.filters?.length ? (
          <span className="inline-flex items-center rounded bg-yellow-100 px-1.5 py-0.5 font-medium text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            {request.query.filters.length} filter
            {request.query.filters.length !== 1 ? 's' : ''}
          </span>
        ) : null}
      </div>

      <div className="truncate text-gray-500 text-xs dark:text-gray-400">
        {request.domain} • {request.url.split('/').pop()}
      </div>
    </button>
  );
}
