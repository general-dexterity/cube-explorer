import type { CubeRequest } from '../../../../types';
import { FilterSection } from '../../Filters/filter-section';
import { CodeBlock } from '../code-block';
import { QuerySection } from '../query-section';

interface QueryTabProps {
  request: CubeRequest;
}

export function QueryTab({ request }: QueryTabProps) {
  return (
    <div className="space-y-4">
      <QuerySection
        color="blue"
        items={request.query.measures}
        title="Measures"
      />
      <QuerySection
        color="green"
        items={request.query.dimensions}
        title="Dimensions"
      />
      {request.query.filters && request.query.filters.length > 0 && (
        <FilterSection filters={request.query.filters} />
      )}
      {request.query.timeDimensions &&
        request.query.timeDimensions.length > 0 && (
          <div>
            <h4 className="mb-2 font-medium text-gray-900 text-sm dark:text-gray-100">
              Time Dimensions
            </h4>
            <CodeBlock data={request.query.timeDimensions} />
          </div>
        )}
      <div>
        <h4 className="mb-2 font-medium text-gray-900 text-sm dark:text-gray-100">
          Full Query
        </h4>
        <CodeBlock data={request.query} />
      </div>
    </div>
  );
}
