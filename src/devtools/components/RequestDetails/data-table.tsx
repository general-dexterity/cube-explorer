import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo } from 'react';
import type { QueryAnnotations } from '../../../types';

interface DataTableProps {
  data: Array<Record<string, unknown>>;
  annotations?: QueryAnnotations;
  pageIndex: number;
  pageSize: number;
  onPageIndexChange: (pageIndex: number) => void;
}

export function DataTable({
  data,
  annotations,
  pageIndex,
  pageSize,
  onPageIndexChange,
}: DataTableProps) {
  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
    if (!data.length) return [];

    const firstRow = data[0];
    return Object.keys(firstRow).map((key) => ({
      id: key,
      accessorFn: (row) => row[key],
      header: () => {
        // Try to get shortTitle from annotations
        const dimensionMeta = annotations?.dimensions?.[key];
        const measureMeta = annotations?.measures?.[key];
        const meta = dimensionMeta || measureMeta;

        if (meta?.shortTitle) {
          return meta.shortTitle;
        }

        // Fallback to key without table prefix
        const parts = key.split('.');
        return parts[parts.length - 1]
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      },
      cell: ({ getValue }) => {
        const value = getValue();

        if (value === null || value === undefined) {
          return <span className="text-gray-400 dark:text-gray-500">—</span>;
        }

        return String(value);
      },
    }));
  }, [data, annotations]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: Math.ceil(data.length / pageSize),
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex, pageSize });
        onPageIndexChange(newState.pageIndex);
      }
    },
    manualPagination: false,
  });

  if (!data.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-950">
        <p className="text-gray-500 text-sm dark:text-gray-400">
          No data available
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-950">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                className="border-b border-gray-200 dark:border-gray-700"
                key={headerGroup.id}
              >
                {headerGroup.headers.map((header, colIndex) => (
                  <th
                    className={`px-3 py-1.5 text-left font-medium text-xs ${
                      colIndex % 2 === 0
                        ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300'
                        : 'bg-white text-gray-700 dark:bg-gray-950 dark:text-gray-300'
                    }`}
                    key={header.id}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50"
                key={row.id}
              >
                {row.getVisibleCells().map((cell, colIndex) => (
                  <td
                    className={`px-3 py-1.5 text-xs ${
                      colIndex % 2 === 0
                        ? 'bg-gray-50 text-gray-900 dark:bg-gray-900/40 dark:text-gray-100'
                        : 'bg-white text-gray-900 dark:bg-transparent dark:text-gray-100'
                    }`}
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
