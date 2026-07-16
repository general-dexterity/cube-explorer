import type { Filter } from '../../../types';
import { FilterBadge } from './filter-badge';

interface FilterSectionProps {
  filters: Filter[];
}

export function FilterSection({ filters }: FilterSectionProps) {
  return (
    <div>
      <h4 className="mb-2 font-medium text-gray-900 text-sm dark:text-gray-100">
        Filters
      </h4>
      <div className="flex flex-wrap gap-1">
        {filters.map((filter) => (
          <FilterBadge filter={filter} key={JSON.stringify(filter)} />
        ))}
      </div>
    </div>
  );
}
