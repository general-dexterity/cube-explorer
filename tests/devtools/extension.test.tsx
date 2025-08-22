import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PINNED_REQUESTS_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  SETTINGS_VERSION,
} from '@/constants';
import Extension from '@/devtools/extension';

describe('Extension', () => {
  beforeEach(() => {
    // Reset chrome storage mock
    vi.mocked(chrome.storage.sync.get).mockClear();
    vi.mocked(chrome.storage.onChanged.addListener).mockClear();
    vi.mocked(
      chrome.devtools.network.onRequestFinished.addListener
    ).mockClear();
  });

  it('renders the extension component with header and empty state', async () => {
    // Mock chrome storage to return default settings and empty pinned requests
    // @ts-expect-error - Mock implementation for testing
    vi.mocked(chrome.storage.sync.get).mockImplementation(
      (keys, callback: (items: Record<string, unknown>) => void) => {
        if (Array.isArray(keys)) {
          const result: Record<string, unknown> = {};
          if (keys.includes(SETTINGS_STORAGE_KEY)) {
            result[SETTINGS_STORAGE_KEY] = null;
          }
          if (keys.includes(PINNED_REQUESTS_STORAGE_KEY)) {
            result[PINNED_REQUESTS_STORAGE_KEY] = [];
          }
          callback(result);
        } else {
          callback({ [keys as string]: null });
        }
      }
    );

    render(<Extension />);

    // Check for the header - it shows "Requests" in the sidebar
    await waitFor(() => {
      expect(screen.getByText('Requests')).toBeInTheDocument();
    });

    // Check for empty state
    expect(screen.getByText('No request selected')).toBeInTheDocument();
    expect(
      screen.getByText(/Choose a Cube request from the sidebar to view details/)
    ).toBeInTheDocument();
  });

  it('loads settings from chrome storage on mount', async () => {
    const mockSettings = {
      urls: ['http://test.example.com/api/cube'],
      autoCapture: true,
      version: SETTINGS_VERSION,
    };

    // @ts-expect-error - Mock implementation for testing
    vi.mocked(chrome.storage.sync.get).mockImplementation(
      (_keys, callback: (items: Record<string, unknown>) => void) => {
        callback({ [SETTINGS_STORAGE_KEY]: mockSettings });
      }
    );

    render(<Extension />);

    await waitFor(() => {
      expect(chrome.storage.sync.get).toHaveBeenCalledWith(
        [SETTINGS_STORAGE_KEY],
        expect.any(Function)
      );
      expect(chrome.storage.sync.get).toHaveBeenCalledWith(
        [PINNED_REQUESTS_STORAGE_KEY],
        expect.any(Function)
      );
    });
  });

  it('sets up chrome network listener when settings are loaded', async () => {
    const mockSettings = {
      urls: ['http://localhost:4000/cubejs-api/v1'],
      autoCapture: true,
      version: SETTINGS_VERSION,
    };

    // @ts-expect-error - Mock implementation for testing
    vi.mocked(chrome.storage.sync.get).mockImplementation(
      (_keys, callback: (items: Record<string, unknown>) => void) => {
        callback({ [SETTINGS_STORAGE_KEY]: mockSettings });
      }
    );

    render(<Extension />);

    await waitFor(() => {
      expect(
        chrome.devtools.network.onRequestFinished.addListener
      ).toHaveBeenCalled();
    });
  });

  it('uses default settings when none are stored', async () => {
    // @ts-expect-error - Mock implementation for testing
    vi.mocked(chrome.storage.sync.get).mockImplementation(
      (keys, callback: (items: Record<string, unknown>) => void) => {
        if (Array.isArray(keys)) {
          const result: Record<string, unknown> = {};
          if (keys.includes(SETTINGS_STORAGE_KEY)) {
            result[SETTINGS_STORAGE_KEY] = null;
          }
          if (keys.includes(PINNED_REQUESTS_STORAGE_KEY)) {
            result[PINNED_REQUESTS_STORAGE_KEY] = [];
          }
          callback(result);
        } else {
          callback({ [keys as string]: null });
        }
      }
    );

    render(<Extension />);

    await waitFor(() => {
      expect(
        chrome.devtools.network.onRequestFinished.addListener
      ).toHaveBeenCalled();
    });
  });

  it('loads pinned requests from storage on mount', async () => {
    const mockPinnedRequests = [
      {
        id: 'pinned-1',
        url: 'http://localhost:4000/cubejs-api/v1/load',
        query: { measures: ['Users.count'] },
        response: { data: [] },
        timestamp: Date.now(),
        duration: 100,
        status: 200,
        domain: 'localhost:4000',
      },
    ];

    // @ts-expect-error - Mock implementation for testing
    vi.mocked(chrome.storage.sync.get).mockImplementation(
      (keys, callback: (items: Record<string, unknown>) => void) => {
        if (Array.isArray(keys)) {
          const result: Record<string, unknown> = {};
          if (keys.includes(SETTINGS_STORAGE_KEY)) {
            result[SETTINGS_STORAGE_KEY] = {
              urls: ['http://localhost:4000/cubejs-api/v1'],
              autoCapture: true,
              version: SETTINGS_VERSION,
            };
          }
          if (keys.includes(PINNED_REQUESTS_STORAGE_KEY)) {
            result[PINNED_REQUESTS_STORAGE_KEY] = mockPinnedRequests;
          }
          callback(result);
        }
      }
    );

    render(<Extension />);

    await waitFor(() => {
      expect(chrome.storage.sync.get).toHaveBeenCalledWith(
        [PINNED_REQUESTS_STORAGE_KEY],
        expect.any(Function)
      );
    });
  });
});
