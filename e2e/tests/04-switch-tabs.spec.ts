import { expect, test } from '../fixtures/extension';

test.describe('Switch Tabs', () => {
  test('should switch between tabs to show different data views', async ({
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

    // Click the first request item
    const requestItems = panelPage.locator('[data-testid^="request-item-"]');
    await requestItems.first().click();
    await panelPage.waitForTimeout(300);

    // Verify request details are visible
    const requestDetails = panelPage.getByTestId('request-details');
    await expect(requestDetails).toBeVisible();

    // Get all tab buttons - they should have data-testid like "tab-query", "tab-response", etc.
    const queryTab = panelPage.getByTestId('tab-query');
    const responseTab = panelPage.getByTestId('tab-response');
    const metadataTab = panelPage.getByTestId('tab-metadata');

    // Verify query tab is initially active (or click it to activate)
    await queryTab.click();
    await panelPage.waitForTimeout(200);

    // Verify query tab content is visible
    const queryContent = panelPage.getByTestId('tab-content-query');
    await expect(queryContent).toBeVisible();

    // Click response tab
    await responseTab.click();
    await panelPage.waitForTimeout(200);

    // Verify response tab content is now visible and query content is hidden
    const responseContent = panelPage.getByTestId('tab-content-response');
    await expect(responseContent).toBeVisible();
    await expect(queryContent).not.toBeVisible();

    // Click metadata tab
    await metadataTab.click();
    await panelPage.waitForTimeout(200);

    // Verify metadata tab content is now visible
    const metadataContent = panelPage.getByTestId('tab-content-metadata');
    await expect(metadataContent).toBeVisible();
    await expect(responseContent).not.toBeVisible();
  });
});
