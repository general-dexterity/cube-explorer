import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SETTINGS_STORAGE_KEY, SETTINGS_VERSION } from '@/constants';
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
    // Mock chrome storage to return default settings
    // @ts-expect-error - Mock implementation for testing
    vi.mocked(chrome.storage.sync.get).mockImplementation(
      (_keys, callback: (items: Record<string, unknown>) => void) => {
        callback({ [SETTINGS_STORAGE_KEY]: null });
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
      (_keys, callback: (items: Record<string, unknown>) => void) => {
        callback({ [SETTINGS_STORAGE_KEY]: null });
      }
    );

    render(<Extension />);

    await waitFor(() => {
      expect(
        chrome.devtools.network.onRequestFinished.addListener
      ).toHaveBeenCalled();
    });
  });
});
