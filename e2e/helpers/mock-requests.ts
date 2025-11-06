import type { Page } from '@playwright/test';
import type { CubeRequest } from '../../src/types';

/**
 * Generate a mock Cube API request
 */
export function createMockRequest(overrides: Partial<CubeRequest> = {}): CubeRequest {
  const id = overrides.id || `request-${Date.now()}`;
  const timestamp = overrides.timestamp || Date.now();

  return {
    id,
    url: overrides.url || 'https://api.example.com/cubejs-api/v1/load',
    query: overrides.query || {
      measures: ['Orders.count'],
      dimensions: ['Orders.status'],
    },
    response: overrides.response || {
      data: [
        { 'Orders.status': 'completed', 'Orders.count': 150 },
        { 'Orders.status': 'pending', 'Orders.count': 45 },
      ],
    },
    timestamp,
    duration: overrides.duration || 234,
    status: overrides.status || 200,
    domain: overrides.domain || 'api.example.com',
    ...overrides,
  };
}

/**
 * Simulate a network event being received by the extension
 */
export async function simulateNetworkEvent(page: Page, request: CubeRequest) {
  await page.evaluate((req) => {
    // Dispatch custom event that extension listens for
    window.postMessage(
      {
        type: 'cube-request',
        data: req,
      },
      '*'
    );
  }, request);
}

/**
 * Create a mock request with SQL data
 */
export function createMockRequestWithSQL(overrides: Partial<CubeRequest> = {}): CubeRequest {
  return createMockRequest({
    url: 'https://api.example.com/cubejs-api/v1/sql',
    query: {
      measures: ['Orders.count'],
      dimensions: ['Orders.status'],
    },
    response: {
      sql: {
        sql: ['SELECT COUNT(*) as count, status FROM orders GROUP BY status'],
        params: [],
      },
    },
    ...overrides,
  });
}

/**
 * Create a mock request with error response
 */
export function createMockRequestWithError(overrides: Partial<CubeRequest> = {}): CubeRequest {
  return createMockRequest({
    status: 400,
    response: {
      error: 'Invalid query',
    },
    ...overrides,
  });
}
