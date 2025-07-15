import type { BinaryFilter } from '../../../types';
import { formatFilterValues, operatorDisplayMap } from './utils';

interface BinaryFilterDisplayProps {
  filter: BinaryFilter;
}

export function BinaryFilterDisplay({ filter }: BinaryFilterDisplayProps) {
  const member = filter.member || filter.dimension || '';
  const operator = filter.operator;
  const values = filter.values || [];
  const op = operatorDisplayMap[operator] || operator;
  const valueDisplay = formatFilterValues(values);

  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-medium text-yellow-800 dark:text-yellow-200">
        {member}
      </span>
      <span className="text-yellow-600 dark:text-yellow-400">{op}</span>
      <span className="text-yellow-700 dark:text-yellow-300">
        {valueDisplay}
      </span>
    </span>
  );
}
