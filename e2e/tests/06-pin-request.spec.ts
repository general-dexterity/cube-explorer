import { expect, test } from '../fixtures/extension';

test.describe('Pin Request', () => {
  test('should pin a request and persist after reload', async ({
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

    await panelPage.waitForTimeout(500);

    // Click the first request item to select it
    const requestItems = panelPage.locator('[data-testid^="request-item-"]');
    await requestItems.first().click();
    await panelPage.waitForTimeout(300);

    // Verify request details are visible
    const requestDetails = panelPage.getByTestId('request-details');
    await expect(requestDetails).toBeVisible();

    // Find and click the pin button
    const pinButton = panelPage.getByTestId('pin-button');
    await expect(pinButton).toBeVisible();
    await pinButton.click();
    await panelPage.waitForTimeout(300);

    // Verify the request appears in the pinned section
    // Pinned items might have a special class or be in a specific container
    const pinnedSection = panelPage.locator(
      '[data-testid^="pinned-"]',
    ).first();
    await expect(pinnedSection).toBeVisible();

    // Reload the page to test persistence
    await panelPage.reload();
    await panelPage.waitForLoadState('domcontentloaded');
    await panelPage.waitForTimeout(1500);

    // Verify the pinned request still appears after reload
    const pinnedAfterReload = panelPage.locator(
      '[data-testid^="pinned-"]',
    ).first();
    await expect(pinnedAfterReload).toBeVisible();

    // Verify it contains the expected data (Orders.count)
    await expect(pinnedAfterReload).toContainText('Orders.count');
  });
});
