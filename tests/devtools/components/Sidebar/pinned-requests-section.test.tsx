import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PinnedRequestsSection } from '@/devtools/components/Sidebar/pinned-requests-section';
import type { CubeRequest, CubeResponse } from '@/types';

// Helper to create a valid CubeResponse
const createMockResponse = (): CubeResponse<unknown> => ({
  data: [],
  annotation: {
    measures: {},
    dimensions: {},
    segments: {},
    timeDimensions: {},
  },
  lastRefreshTime: new Date().toISOString(),
  refreshKeyValues: [],
  usedPreAggregations: {},
  transformedQuery: {},
  requestId: 'test-request-id',
  queryType: 'regularQuery',
  external: false,
  dbType: 'postgres',
  extDbType: 'postgres',
  slowQuery: false,
  results: [],
  pivotQuery: undefined,
});

// Mock request helper
const createMockRequest = (
  overrides: Partial<CubeRequest> = {}
): CubeRequest => ({
  id: '1',
  url: 'https://localhost:4000/cubejs-api/v1/load',
  query: {
    measures: ['Orders.count'],
    dimensions: ['Orders.status'],
  },
  response: createMockResponse(),
  timestamp: Date.now(),
  duration: 123,
  status: 200,
  domain: 'localhost:4000',
  ...overrides,
});

describe('PinnedRequestsSection', () => {
  const defaultProps = {
    pinnedRequests: [],
    selectedRequest: null,
    filter: '',
    onRequestSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the pinned section header with count', () => {
    const props = {
      ...defaultProps,
      pinnedRequests: [createMockRequest(), createMockRequest({ id: '2' })],
    };

    render(<PinnedRequestsSection {...props} />);

    expect(screen.getByText('Pinned (2)')).toBeInTheDocument();
  });

  it('shows empty state when no pinned requests', () => {
    render(<PinnedRequestsSection {...defaultProps} />);

    expect(screen.getByText('Pinned (0)')).toBeInTheDocument();
    expect(screen.getByText('No pinned queries')).toBeInTheDocument();
    expect(
      screen.getByText(/Click the pin button next to "Request Details"/)
    ).toBeInTheDocument();
  });

  it('renders pinned requests when present', () => {
    const mockRequest = createMockRequest({
      query: { measures: ['Users.count'] },
    });
    const props = {
      ...defaultProps,
      pinnedRequests: [mockRequest],
    };

    render(<PinnedRequestsSection {...props} />);

    // Should show the request
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('123ms')).toBeInTheDocument();

    // Should not show empty state
    expect(screen.queryByText('No pinned queries')).not.toBeInTheDocument();
  });

  it('filters pinned requests based on filter prop', () => {
    const mockRequest1 = createMockRequest({
      id: '1',
      query: { measures: ['Orders.count'] },
    });
    const mockRequest2 = createMockRequest({
      id: '2',
      query: { measures: ['Users.count'] },
    });
    const props = {
      ...defaultProps,
      pinnedRequests: [mockRequest1, mockRequest2],
      filter: 'Orders',
    };

    render(<PinnedRequestsSection {...props} />);

    // Should show count of filtered requests
    expect(screen.getByText('Pinned (1)')).toBeInTheDocument();

    // Should show only the Orders request
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
  });

  it('calls onRequestSelect when a pinned request is clicked', () => {
    const mockRequest = createMockRequest();
    const props = {
      ...defaultProps,
      pinnedRequests: [mockRequest],
    };

    render(<PinnedRequestsSection {...props} />);

    const requestElement = screen.getByText('Orders');
    fireEvent.click(requestElement.closest('button')!);

    expect(props.onRequestSelect).toHaveBeenCalledWith(mockRequest);
  });

  it('can be collapsed and expanded', async () => {
    const mockRequest = createMockRequest();
    const props = {
      ...defaultProps,
      pinnedRequests: [mockRequest],
    };

    render(<PinnedRequestsSection {...props} />);

    // Initially expanded (defaultOpen={true}), should see the request
    expect(screen.getByText('Orders')).toBeInTheDocument();

    // Find the trigger button
    const collapseButton = screen.getByText('Pinned (1)');

    // Click to collapse
    fireEvent.click(collapseButton);

    // Wait for the collapse animation and check if content is removed from DOM
    await waitFor(() => {
      expect(screen.queryByText('Orders')).not.toBeInTheDocument();
    });

    // Click to expand again
    fireEvent.click(collapseButton);

    // Wait for the expand animation and check if content is back in DOM
    await waitFor(() => {
      expect(screen.getByText('Orders')).toBeInTheDocument();
    });
  });

  it('shows filtered empty state when filter excludes all pinned requests', () => {
    const mockRequest = createMockRequest({
      query: { measures: ['Orders.count'] },
    });
    const props = {
      ...defaultProps,
      pinnedRequests: [mockRequest],
      filter: 'Users', // Won't match Orders
    };

    render(<PinnedRequestsSection {...props} />);

    expect(screen.getByText('Pinned (0)')).toBeInTheDocument();
    expect(screen.getByText('No pinned queries')).toBeInTheDocument();
  });
});
