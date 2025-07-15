import type { UnaryFilter } from '../../../types';

interface UnaryFilterDisplayProps {
  filter: UnaryFilter;
}

export function UnaryFilterDisplay({ filter }: UnaryFilterDisplayProps) {
  const member = filter.member || filter.dimension || '';
  const operator = filter.operator;

  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-medium text-yellow-800 dark:text-yellow-200">
        {member}
      </span>
      <span className="text-yellow-600 dark:text-yellow-400">•</span>
      <span className="text-yellow-700 dark:text-yellow-300">
        {operator === 'set' ? 'is set' : 'is not set'}
      </span>
    </span>
  );
}
