import { expect, test } from '../fixtures/extension';

test.describe('Click Request', () => {
  test('should display request details when clicking a request item', async ({
    panelPage,
  }) => {
    // Trigger a mock network request
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

    // Wait for request to appear
    await panelPage.waitForTimeout(500);

    // Verify empty state is visible before clicking
    const emptyState = panelPage.getByTestId('empty-state');
    await expect(emptyState).toBeVisible();

    // Verify request details are not visible yet
    const requestDetails = panelPage.getByTestId('request-details');
    await expect(requestDetails).not.toBeVisible();

    // Click the first request item
    const requestItems = panelPage.locator('[data-testid^="request-item-"]');
    await requestItems.first().click();

    // Wait for details to load
    await panelPage.waitForTimeout(300);

    // Verify empty state is now hidden
    await expect(emptyState).not.toBeVisible();

    // Verify request details are now visible
    await expect(requestDetails).toBeVisible();

    // Verify the request item has the selected state (has specific class or style)
    const firstItem = requestItems.first();
    await expect(firstItem).toHaveClass(/bg-blue-50|selected/);
  });
});
