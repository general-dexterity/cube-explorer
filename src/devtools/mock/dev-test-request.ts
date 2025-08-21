import type { CubeRequest } from '../../types';

export const DEV_TEST_REQUEST = {
  domain: 'localhost:4000',
  id: '15c618f8-2a29-448b-a00d-bf468cc0096c',
  status: 200,
  timestamp: 1_734_840_545_259,
  url: 'http://localhost:4000/cubejs-api/v1/load',
  duration: 1234,
  query: {
    measures: ['orders.count', 'orders.shipping_cost', 'orders.total_amount'],
    dimensions: ['orders.shipping_country'],
    timeDimensions: [
      {
        dimension: 'orders.order_date',
        granularity: 'month',
      },
    ],
    limit: 10_000,
    timezone: 'UTC',
    filters: [],
    rowLimit: 10_000,
  },
  response: {
    queryType: 'regularQuery',
    results: [
      {
        query: {
          measures: [
            'orders.count',
            'orders.shipping_cost',
            'orders.total_amount',
          ],
          dimensions: ['orders.shipping_country'],
          timeDimensions: [
            {
              dimension: 'orders.order_date',
              granularity: 'month',
            },
          ],
          limit: 10_000,
          timezone: 'UTC',
          filters: [],
          rowLimit: 10_000,
        },
        data: [
          {
            'orders.order_date.month': '2024-01-01T00:00:00.000',
            'orders.shipping_cost': '19.98',
            'orders.shipping_country': 'USA',
            'orders.total_amount': '379.96000000000004',
            'orders.count': '2',
            'orders.order_date': '2024-01-01T00:00:00.000',
          },
          {
            'orders.shipping_cost': '9.99',
            'orders.count': '1',
            'orders.order_date': '2024-01-01T00:00:00.000',
            'orders.order_date.month': '2024-01-01T00:00:00.000',
            'orders.shipping_country': 'UK',
            'orders.total_amount': '179.98',
          },
          {
            'orders.order_date.month': '2024-01-01T00:00:00.000',
            'orders.order_date': '2024-01-01T00:00:00.000',
            'orders.count': '1',
            'orders.shipping_cost': '19.99',
            'orders.shipping_country': 'Germany',
            'orders.total_amount': '599.97',
          },
        ],
      },
    ],
    pivotQuery: {
      measures: ['orders.count', 'orders.shipping_cost', 'orders.total_amount'],
      dimensions: ['orders.shipping_country'],
      timeDimensions: [
        {
          dimension: 'orders.order_date',
          granularity: 'month',
        },
      ],
      limit: 10_000,
      timezone: 'UTC',
      filters: [],
      rowLimit: 10_000,
      queryType: 'regularQuery',
    },
    slowQuery: false,
  },
} as unknown as CubeRequest;
