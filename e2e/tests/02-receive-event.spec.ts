import { expect, test } from '../fixtures/extension';

test.describe('Receive Event', () => {
  test('should display event in list but keep empty state for content', async ({
    panelPage,
  }) => {
    // Verify initial empty state
    const emptyState = panelPage.getByTestId('empty-state');
    await expect(emptyState).toBeVisible();

    // Trigger a mock network request using our test helper
    await panelPage.evaluate(() => {
      (
        window as Window & {
          triggerCubeRequest: (mockData: {
            url: string;
            query: unknown;
            response: unknown;
            duration?: number;
            status?: number;
          }) => void;
        }
      ).triggerCubeRequest({
        url: 'https://api.example.com/cubejs-api/v1/load',
        query: {
          measures: ['Orders.count'],
          dimensions: ['Orders.status'],
        },
        response: {
          data: [
            { 'Orders.status': 'completed', 'Orders.count': 150 },
            { 'Orders.status': 'pending', 'Orders.count': 45 },
          ],
        },
        duration: 234,
        status: 200,
      });
    });

    // Wait for the extension to process the request
    await panelPage.waitForTimeout(500);

    // Verify the listening message is gone (we have requests now)
    const listeningMessage = panelPage.getByTestId('listening-message');
    await expect(listeningMessage).not.toBeVisible();

    // Verify the request appears in the list
    const requestList = panelPage.getByTestId('request-list');
    await expect(requestList).toBeVisible();

    // Verify at least one request item is visible
    const requestItems = panelPage.locator('[data-testid^="request-item-"]');
    await expect(requestItems.first()).toBeVisible();

    // Verify empty state STILL shows (because we haven't clicked a request)
    await expect(emptyState).toBeVisible();

    // Verify request details are NOT shown
    const requestDetails = panelPage.getByTestId('request-details');
    await expect(requestDetails).not.toBeVisible();
  });
});
