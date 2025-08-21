import type { QueryAnnotations } from '../../../types';
import { PaginatedTable } from './paginated-table';

interface CodeBlockProps {
  data: unknown;
  annotations?: QueryAnnotations;
}

function isTableData(data: unknown): data is Array<Record<string, unknown>> {
  return (
    Array.isArray(data) &&
    data.length >= 0 && // Allow empty arrays
    (data.length === 0 || (typeof data[0] === 'object' && data[0] !== null))
  );
}

export function CodeBlock({ data, annotations }: CodeBlockProps) {
  // Check if data is suitable for table display
  if (isTableData(data)) {
    return <PaginatedTable annotations={annotations} data={data} />;
  }

  // Fallback to JSON display for non-tabular data
  return (
    <pre className="max-h-96 overflow-auto rounded-lg border bg-gray-900 p-3 font-mono text-gray-100 text-xs dark:border-gray-700 dark:bg-gray-950">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
