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
  overrides: Partial<CubeRequest> = {},
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
      screen.getByText(/Click the pin button next to "Request Details"/),
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

    const { container } = render(<PinnedRequestsSection {...props} />);

    // Find the trigger button
    const collapseButton = screen.getByText('Pinned (1)');

    // Initially collapsed (defaultOpen={false})
    // Check that the collapsible root has closed state
    const collapsibleRoot = container.querySelector(
      '[data-scope="collapsible"]',
    );
    expect(collapsibleRoot).toHaveAttribute('data-state', 'closed');

    // Click to expand
    fireEvent.click(collapseButton);

    // Wait for the state to change to open and content to appear
    await waitFor(() => {
      expect(collapsibleRoot).toHaveAttribute('data-state', 'open');
      expect(screen.getByText('Orders')).toBeInTheDocument();
    });

    // Click to collapse again
    fireEvent.click(collapseButton);

    // Wait for the state to change to closed
    await waitFor(() => {
      expect(collapsibleRoot).toHaveAttribute('data-state', 'closed');
    });

    // After collapse animation, content should be unmounted
    await waitFor(
      () => {
        expect(screen.queryByText('Orders')).not.toBeInTheDocument();
      },
      { timeout: 1000 },
    );
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
