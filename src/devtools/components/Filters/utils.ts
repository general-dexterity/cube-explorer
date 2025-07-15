export const operatorDisplayMap: Record<string, string> = {
  equals: '=',
  notEquals: '≠',
  contains: '∋',
  notContains: '∌',
  startsWith: '^=',
  notStartsWith: '^≠',
  endsWith: '$=',
  notEndsWith: '$≠',
  gt: '>',
  gte: '≥',
  lt: '<',
  lte: '≤',
  inDateRange: '∈',
  notInDateRange: '∉',
  beforeDate: '<',
  beforeOrOnDate: '≤',
  afterDate: '>',
  afterOrOnDate: '≥',
};

export function formatFilterValues(values: string[]): string {
  if (values.length === 0) {
    return 'empty';
  }
  if (values.length === 1) {
    return values[0];
  }
  if (values.length <= 3) {
    return values.join(', ');
  }
  return `${values.slice(0, 3).join(', ')}... +${values.length - 3}`;
}
