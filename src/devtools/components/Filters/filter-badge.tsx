import type {
  BinaryFilter,
  Filter,
  LogicalAndFilter,
  LogicalOrFilter,
  UnaryFilter,
} from '../../../types';
import { BinaryFilterDisplay } from './binary-filter-display';
import { LogicalFilter } from './logical-filter';
import { UnaryFilterDisplay } from './unary-filter-display';

interface FilterBadgeProps {
  filter: Filter;
}

function SimpleFilter({ filter }: { filter: BinaryFilter | UnaryFilter }) {
  const operator = filter.operator;

  if (operator === 'set' || operator === 'notSet') {
    return <UnaryFilterDisplay filter={filter as UnaryFilter} />;
  }

  return <BinaryFilterDisplay filter={filter as BinaryFilter} />;
}

export function FilterBadge({ filter }: FilterBadgeProps) {
  if ('and' in filter) {
    return (
      <span className="inline-flex items-center rounded-md border border-yellow-200 bg-yellow-50 px-2 py-1 text-xs dark:border-yellow-800 dark:bg-yellow-900">
        <LogicalFilter filters={(filter as LogicalAndFilter).and} type="and" />
      </span>
    );
  }

  if ('or' in filter) {
    return (
      <span className="inline-flex items-center rounded-md border border-yellow-200 bg-yellow-50 px-2 py-1 text-xs dark:border-yellow-800 dark:bg-yellow-900">
        <LogicalFilter filters={(filter as LogicalOrFilter).or} type="or" />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-md border border-yellow-200 bg-yellow-50 px-2 py-1 text-xs dark:border-yellow-800 dark:bg-yellow-900">
      <SimpleFilter filter={filter as BinaryFilter | UnaryFilter} />
    </span>
  );
}
