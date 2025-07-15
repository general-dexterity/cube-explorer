interface CodeBlockProps {
  data: unknown;
}

export function CodeBlock({ data }: CodeBlockProps) {
  return (
    <pre className="max-h-96 overflow-auto rounded-lg border bg-gray-900 p-3 font-mono text-gray-100 text-xs dark:border-gray-700 dark:bg-gray-950">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
