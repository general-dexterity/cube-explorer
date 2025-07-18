import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Sidebar } from '@/devtools/components/Sidebar/sidebar';
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

describe('Sidebar', () => {
  const defaultProps = {
    requests: [],
    selectedRequest: null,
    filter: '',
    onFilterChange: vi.fn(),
    onRequestSelect: vi.fn(),
    onClearRequests: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays the settings panel when settings icon is clicked', () => {
    render(<Sidebar {...defaultProps} />);

    // Find and click the settings button
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    // Settings panel should be visible
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('URLs to Monitor')).toBeInTheDocument();
  });

  it('returns to request list when back button is clicked from settings', () => {
    render(<Sidebar {...defaultProps} />);

    // Open settings
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    // Find and click the back button (has title "Requests")
    const backButton = screen.getByRole('button', { name: /requests/i });
    fireEvent.click(backButton);

    // Should see the request list panel (with empty state)
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    expect(screen.getByText('Requests')).toBeInTheDocument();
  });

  it('renders a request in the sidebar', () => {
    const mockRequest = createMockRequest();
    const props = {
      ...defaultProps,
      requests: [mockRequest],
    };

    render(<Sidebar {...props} />);

    // Check if request is rendered with cube name "Orders"
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('123ms')).toBeInTheDocument();
  });

  it('does not render requests that do not match the filter', () => {
    const mockRequest1 = createMockRequest({
      id: '1',
      query: {
        measures: ['Orders.count'],
        dimensions: ['Orders.status'],
      },
    });
    const mockRequest2 = createMockRequest({
      id: '2',
      query: {
        measures: ['Users.count'],
        dimensions: ['Users.role'],
      },
    });

    const props = {
      ...defaultProps,
      requests: [mockRequest1, mockRequest2],
      filter: 'Orders', // Filter by "Orders" which is in request1's query
    };

    render(<Sidebar {...props} />);

    // Only the request with "Orders" in the query should be visible
    expect(screen.getByText('Orders')).toBeInTheDocument();

    // The Users request should not be visible
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
  });

  it('calls onRequestSelect when a request is clicked', () => {
    const mockRequest = createMockRequest();
    const props = {
      ...defaultProps,
      requests: [mockRequest],
    };

    render(<Sidebar {...props} />);

    // Click on the request (identified by the cube name)
    const requestElement = screen.getByText('Orders');
    fireEvent.click(requestElement.closest('button')!);

    expect(props.onRequestSelect).toHaveBeenCalledWith(mockRequest);
  });

  it('highlights the selected request', () => {
    const mockRequest = createMockRequest();
    const props = {
      ...defaultProps,
      requests: [mockRequest],
      selectedRequest: mockRequest,
    };

    render(<Sidebar {...props} />);

    // The selected request should have data-selected attribute
    const requestButton = screen.getByText('Orders').closest('button');
    expect(requestButton).toHaveAttribute('data-selected', 'true');
  });

  it('calls onClearRequests when clear button is clicked', () => {
    const mockRequest = createMockRequest();
    const props = {
      ...defaultProps,
      requests: [mockRequest],
    };

    render(<Sidebar {...props} />);

    // Find and click the clear button
    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    expect(props.onClearRequests).toHaveBeenCalled();
  });

  it('updates filter when typing in search box', () => {
    render(<Sidebar {...defaultProps} />);

    // First click the search button to show the search input
    const searchButton = screen.getByRole('button', { name: /show search/i });
    fireEvent.click(searchButton);

    // Now the search input should be visible
    const searchInput = screen.getByPlaceholderText('Filter requests...');
    fireEvent.change(searchInput, { target: { value: 'test filter' } });

    expect(defaultProps.onFilterChange).toHaveBeenCalledWith('test filter');
  });

  it('shows empty state when no requests match the settings', () => {
    const props = {
      ...defaultProps,
      requests: [],
    };

    render(<Sidebar {...props} />);

    // Should show "No requests" in the sidebar
    expect(
      screen.getByText('Listening for Cube Explorer requests...')
    ).toBeInTheDocument();
  });
});
