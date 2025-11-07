import { expect, test } from '../fixtures/extension';

test.describe('Empty State', () => {
  test('should display empty state and listening message when panel opens', async ({
    panelPage,
  }) => {
    // Verify the empty state is visible on the main content area
    const emptyState = panelPage.getByTestId('empty-state');
    await expect(emptyState).toBeVisible({ timeout: 10000 });
    await expect(emptyState).toContainText('No request selected');
    await expect(emptyState).toContainText(
      'Choose a Cube request from the sidebar to view details',
    );

    // Verify the listening message is visible in the request list
    const listeningMessage = panelPage.getByTestId('listening-message');
    await expect(listeningMessage).toBeVisible();
    await expect(listeningMessage).toContainText(
      'Listening for Cube Explorer requests...',
    );

    // Verify no request details are shown
    const requestDetails = panelPage.getByTestId('request-details');
    await expect(requestDetails).not.toBeVisible();
  });
});
