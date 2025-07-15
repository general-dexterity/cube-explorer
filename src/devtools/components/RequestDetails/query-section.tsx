interface QuerySectionProps {
  title: string;
  items?: string[];
  color: 'blue' | 'green' | 'yellow';
}

export function QuerySection({ title, items, color }: QuerySectionProps) {
  if (!items?.length) {
    return null;
  }

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  };

  return (
    <div>
      <h4 className="mb-2 font-medium text-gray-900 text-sm dark:text-gray-100">
        {title}
      </h4>
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
          <span
            className={`inline-flex items-center rounded-md border px-2 py-1 font-medium text-xs ${colorClasses[color]}`}
            key={item}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
