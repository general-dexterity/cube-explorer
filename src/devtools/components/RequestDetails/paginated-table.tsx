import { Pagination } from '@ark-ui/react/pagination';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { useState } from 'react';
import type { QueryAnnotations } from '../../../types';
import { DataTable } from './data-table';

interface PaginatedTableProps {
  data: Array<Record<string, unknown>>;
  annotations?: QueryAnnotations;
}

const ITEMS_PER_PAGE = 15;

export function PaginatedTable({ data, annotations }: PaginatedTableProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const pageCount = Math.ceil(data.length / ITEMS_PER_PAGE);

  const startIndex = pageIndex * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, data.length);

  const canGoPrevious = pageIndex > 0;
  const canGoNext = pageIndex < pageCount - 1;

  return (
    <div className="space-y-4">
      {pageCount > 1 && (
        <div className="flex items-center justify-between px-2">
          <span className="text-gray-600 text-xs dark:text-gray-400">
            Showing {startIndex + 1}-{endIndex} of {data.length} results
          </span>
          <div className="flex gap-1">
            <button
              className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              disabled={!canGoPrevious}
              onClick={() => setPageIndex(pageIndex - 1)}
              type="button"
            >
              <CaretLeft size={14} />
            </button>
            <button
              className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              disabled={!canGoNext}
              onClick={() => setPageIndex(pageIndex + 1)}
              type="button"
            >
              <CaretRight size={14} />
            </button>
          </div>
        </div>
      )}

      <DataTable
        annotations={annotations}
        data={data}
        onPageIndexChange={setPageIndex}
        pageIndex={pageIndex}
        pageSize={ITEMS_PER_PAGE}
      />

      {pageCount > 1 && (
        <Pagination.Root
          className="flex items-center justify-center gap-2"
          count={data.length}
          onPageChange={(details) => setPageIndex(details.page - 1)}
          page={pageIndex + 1}
          pageSize={ITEMS_PER_PAGE}
        >
          <Pagination.PrevTrigger className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800">
            <CaretLeft size={16} />
          </Pagination.PrevTrigger>

          <Pagination.Context>
            {(pagination) => (
              <>
                {pagination.pages.map((page, index) =>
                  page.type === 'page' ? (
                    <Pagination.Item
                      key={index}
                      {...page}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-gray-300 bg-white text-gray-600 text-xs transition-colors hover:bg-gray-100 data-[selected]:border-blue-500 data-[selected]:bg-blue-100 data-[selected]:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 data-[selected]:dark:bg-blue-500/20 data-[selected]:dark:text-blue-400"
                    >
                      {page.value}
                    </Pagination.Item>
                  ) : (
                    <Pagination.Ellipsis
                      className="flex h-8 w-8 items-center justify-center text-gray-400 dark:text-gray-500"
                      index={index}
                      key={index}
                    >
                      ···
                    </Pagination.Ellipsis>
                  ),
                )}
              </>
            )}
          </Pagination.Context>

          <Pagination.NextTrigger className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800">
            <CaretRight size={16} />
          </Pagination.NextTrigger>
        </Pagination.Root>
      )}
    </div>
  );
}
