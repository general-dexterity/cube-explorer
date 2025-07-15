import React from 'react';
import type { Filter } from '../../../types';
import { FilterBadge } from './filter-badge';

interface LogicalFilterProps {
  type: 'and' | 'or';
  filters: Filter[];
}

export function LogicalFilter({ type, filters }: LogicalFilterProps) {
  const separator = type === 'and' ? '&' : '|';
  const label = type === 'and' ? 'AND' : 'OR';

  return (
    <span className="flex items-center gap-1">
      <span className="text-xs text-yellow-600 dark:text-yellow-400">
        {label}
      </span>
      <span className="text-yellow-600 dark:text-yellow-400">(</span>
      {filters.map((subFilter, i) => (
        <React.Fragment key={`${type}-${i}-${JSON.stringify(subFilter)}`}>
          {i > 0 && (
            <span className="text-xs text-yellow-600 dark:text-yellow-400">
              {separator}
            </span>
          )}
          <FilterBadge filter={subFilter} />
        </React.Fragment>
      ))}
      <span className="text-yellow-600 dark:text-yellow-400">)</span>
    </span>
  );
}
