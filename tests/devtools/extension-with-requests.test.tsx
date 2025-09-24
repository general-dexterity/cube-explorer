import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PINNED_REQUESTS_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  SETTINGS_VERSION,
} from '@/constants';
import Extension from '@/devtools/extension';
import { createMock } from '../utils/mock';

describe('Extension with Requests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a mocked request in the sidebar', async () => {
    const mockSettings = {
      urls: ['http://localhost:4000/cubejs-api/v1'],
      autoCapture: true,
      version: SETTINGS_VERSION,
    };

    vi.mocked(
      chrome.storage.sync.get as (
        keys: string | string[],
        callback: (items: Record<string, unknown>) => void,
      ) => void,
    ).mockImplementation((keys, cb) => {
      if (Array.isArray(keys)) {
        const result: Record<string, unknown> = {};
        if (keys.includes(SETTINGS_STORAGE_KEY)) {
          result[SETTINGS_STORAGE_KEY] = mockSettings;
        }
        if (keys.includes(PINNED_REQUESTS_STORAGE_KEY)) {
          result[PINNED_REQUESTS_STORAGE_KEY] = [];
        }
        cb(result);
      } else {
        cb({ [keys]: mockSettings });
      }
    });

    // Create a mock request
    const mockRequest = createMock<chrome.devtools.network.Request>({
      request: {
        url: 'http://localhost:4000/cubejs-api/v1/load',
        postData: {
          text: JSON.stringify({
            measures: ['Orders.count'],
            dimensions: ['Orders.status'],
          }),
        },
      },
      response: {
        status: 200,
      },
      time: 123,
      getContent: vi.fn((callback) => {
        callback(
          JSON.stringify({
            data: [{ 'Orders.status': 'completed', 'Orders.count': 100 }],
            annotation: {
              measures: {},
              dimensions: {},
              segments: {},
              timeDimensions: {},
            },
          }),
        );
      }),
    });

    let networkListener:
      | ((request: chrome.devtools.network.Request) => void)
      | null = null;

    // Capture the network listener
    vi.mocked(
      chrome.devtools.network.onRequestFinished.addListener,
    ).mockImplementation(
      (listener: (request: chrome.devtools.network.Request) => void) => {
        networkListener = listener;
      },
    );

    render(<Extension />);

    // Wait for settings to load and listener to be set up
    await waitFor(() => {
      expect(
        chrome.devtools.network.onRequestFinished.addListener,
      ).toHaveBeenCalled();
    });

    // Simulate a network request
    act(() => {
      if (networkListener) {
        networkListener(mockRequest);
      }
    });

    // Wait for the request to appear in the sidebar
    await waitFor(() => {
      // The request shows the cube name "Orders" instead of the URL
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('123ms')).toBeInTheDocument();
      // Check for measure and dimension tags
      expect(screen.getByText('1 measure')).toBeInTheDocument();
      expect(screen.getByText('1 dimension')).toBeInTheDocument();
    });
  });

  it('does not render requests that do not match the settings', async () => {
    const mockSettings = {
      urls: ['http://api.example.com/api/analytics'],
      autoCapture: true,
      version: SETTINGS_VERSION,
    };

    // Mock chrome storage to return settings
    vi.mocked(
      chrome.storage.sync.get as (
        keys: string | string[],
        callback: (items: Record<string, unknown>) => void,
      ) => void,
    ).mockImplementation((keys, cb) => {
      if (Array.isArray(keys)) {
        const result: Record<string, unknown> = {};
        if (keys.includes(SETTINGS_STORAGE_KEY)) {
          result[SETTINGS_STORAGE_KEY] = mockSettings;
        }
        if (keys.includes(PINNED_REQUESTS_STORAGE_KEY)) {
          result[PINNED_REQUESTS_STORAGE_KEY] = [];
        }
        cb(result);
      } else {
        cb({ [keys]: mockSettings });
      }
    });

    // Create a mock request that doesn't match settings
    const mockRequest = createMock<chrome.devtools.network.Request>({
      request: {
        url: 'http://localhost:4000/cubejs-api/v1/load',
        postData: {
          text: JSON.stringify({
            measures: ['Orders.count'],
          }),
        },
      },
      response: {
        status: 200,
      },
      time: 100,
      getContent: vi.fn((callback) => {
        callback(JSON.stringify({ data: [] }));
      }),
    });

    let networkListener:
      | ((request: chrome.devtools.network.Request) => void)
      | null = null;

    // Capture the network listener
    vi.mocked(
      chrome.devtools.network.onRequestFinished.addListener,
    ).mockImplementation(
      (listener: (request: chrome.devtools.network.Request) => void) => {
        networkListener = listener;
      },
    );

    render(<Extension />);

    // Wait for settings to load and listener to be set up
    await waitFor(() => {
      expect(
        chrome.devtools.network.onRequestFinished.addListener,
      ).toHaveBeenCalled();
    });

    // Simulate a network request
    act(() => {
      if (networkListener) {
        networkListener(mockRequest);
      }
    });

    // Wait a bit to ensure the request would have been processed
    await new Promise((resolve) => setTimeout(resolve, 100));

    // The request should not appear in the sidebar
    expect(screen.queryByText('/cubejs-api/v1/load')).not.toBeInTheDocument();

    // Should still show the empty state in sidebar
    expect(
      screen.getByText('Listening for Cube Explorer requests...'),
    ).toBeInTheDocument();
  });
});
