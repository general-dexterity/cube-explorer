interface QuerySectionProps {
  title: string;
  items?: string[];
  color: 'blue' | 'green' | 'yellow';
}

export function QuerySection({ title, items, color }: QuerySectionProps) {
  if (!items?.length) {
    return null;
  }

  return (
    <div>
      <h4 className="mb-2 font-medium text-gray-900 text-sm dark:text-gray-100">
        {title}
      </h4>
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
          <span
            className="inline-flex items-center rounded-md border px-2 py-1 font-medium text-xs data-blue:border-blue-200 data-green:border-green-200 data-yellow:border-yellow-200 data-blue:bg-blue-50 data-green:bg-green-50 data-yellow:bg-yellow-50 data-blue:text-blue-700 data-green:text-green-700 data-yellow:text-yellow-700"
            data-blue={color === 'blue' || undefined}
            data-green={color === 'green' || undefined}
            data-yellow={color === 'yellow' || undefined}
            key={item}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
