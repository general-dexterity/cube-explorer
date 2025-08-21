import { Accordion } from '@ark-ui/react/accordion';
import { CaretDownIcon, ClockIcon } from '@phosphor-icons/react';
import type { CubeRequest } from '../../../../types';
import { CodeBlock } from '../code-block';

interface ResponseTabProps {
  request: CubeRequest;
}

export function ResponseTab({ request }: ResponseTabProps) {
  if (request.response?.error) {
    return (
      <div className="space-y-4">
        {/* Check if error is "Continue wait" */}
        {request.response.error === 'Continue wait' ? (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <div className="flex items-start gap-3">
              <ClockIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                  Query Still Processing
                </h4>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  The Cube.js API returned a "Continue wait" response. This
                  means your query is still being processed. Please retry the
                  request to get the results.
                </p>
                {request.response.requestId && (
                  <p className="mt-2 font-mono text-xs text-yellow-600 dark:text-yellow-400">
                    Request ID: {request.response.requestId}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h4 className="mb-2 font-medium text-gray-900 text-sm dark:text-gray-100">
              Error message
            </h4>
            <CodeBlock data={request.response.error} />
          </div>
        )}
      </div>
    );
  }

  if (request.response.error === undefined) {
    return (
      <div className="space-y-4">
        <div>
          <h4 className="mb-2 font-medium text-gray-900 text-sm dark:text-gray-100">
            Data
          </h4>
          <CodeBlock
            annotations={request.response?.results?.[0]?.annotation}
            data={request.response?.results?.[0]?.data}
          />
        </div>
        {!!request.response?.results?.[0].annotation && (
          <Accordion.Root collapsible defaultValue={[]}>
            <Accordion.Item value="annotation">
              <Accordion.ItemTrigger className="flex w-full items-center justify-between rounded-lg bg-gray-100 px-3 py-2 text-left text-gray-900 text-sm transition-colors hover:bg-gray-200 dark:bg-gray-900/50 dark:text-gray-100 dark:hover:bg-gray-900/70">
                <span className="font-medium">Annotation</span>
                <Accordion.ItemIndicator>
                  <CaretDownIcon className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                </Accordion.ItemIndicator>
              </Accordion.ItemTrigger>
              <Accordion.ItemContent className="mt-2">
                <CodeBlock data={request.response?.results?.[0].annotation} />
              </Accordion.ItemContent>
            </Accordion.Item>
          </Accordion.Root>
        )}
      </div>
    );
  }

  return null;
}
