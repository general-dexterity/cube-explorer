import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SETTINGS_STORAGE_KEY, SETTINGS_VERSION } from '@/constants';
import Extension from '@/devtools/extension';

describe('Settings Panel Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock chrome storage to return default settings
    vi.mocked(
      chrome.storage.sync.get as (
        keys: string[],
        callback: (items: Record<string, unknown>) => void
      ) => void
    ).mockImplementation((_, cb) =>
      cb({
        [SETTINGS_STORAGE_KEY]: {
          urls: ['http://localhost:4000/cubejs-api/v1'],
          autoCapture: true,
          version: SETTINGS_VERSION,
        },
      })
    );
  });

  it('clicking on the settings displays the settings panel', async () => {
    render(<Extension />);

    // Initially should show the requests panel
    expect(screen.getByText('Requests')).toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();

    // Find and click the settings button
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    await userEvent.click(settingsButton);

    // Settings panel should be visible
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('URLs to Monitor')).toBeInTheDocument();

    // Requests header should not be visible
    expect(screen.queryByText('Requests')).not.toBeInTheDocument();
  });

  it('clicking back from the settings displays the list again', async () => {
    render(<Extension />);

    // Open settings
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    await userEvent.click(settingsButton);

    // Verify we're in settings
    expect(screen.getByText('Settings')).toBeInTheDocument();

    // Find and click the back button (has title "Requests")
    const backButton = screen.getByRole('button', { name: /requests/i });
    await userEvent.click(backButton);

    // Should be back to requests view
    expect(screen.getByText('Requests')).toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();

    // Should show the empty state
    expect(
      screen.getByText('Listening for Cube Explorer requests...')
    ).toBeInTheDocument();
  });

  it('can navigate back and forth between settings and requests', async () => {
    const user = userEvent.setup();

    render(<Extension />);

    // Initially in requests view
    expect(screen.getByText('Requests')).toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();

    // Open settings
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    await user.click(settingsButton);

    // Now in settings view
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.queryByText('Requests')).not.toBeInTheDocument();

    // Go back to requests
    const backButton = screen.getByRole('button', { name: /requests/i });
    await user.click(backButton);

    // Back in requests view
    expect(screen.getByText('Requests')).toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();

    // Can go back to settings again
    await user.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
