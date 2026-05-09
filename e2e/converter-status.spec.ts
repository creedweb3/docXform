import { expect, test, type Route } from '@playwright/test';

test.describe('Converter status messaging', () => {
  test('shows service unavailable when warm-up fails', async ({ page }) => {
    test.setTimeout(120_000);

    const failAsset = async (route: Route) => {
      await route.fulfill({
        status: 404,
        contentType: 'text/plain',
        body: 'missing',
      });
    };

    // Broad interception: worker + main-thread fetches must hit the stub (regex-only routes can miss).
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      if (url.includes('soffice.wasm') || url.includes('soffice.data')) {
        await failAsset(route);
        return;
      }
      await route.continue();
    });

    await page.goto('/word-to-pdf');
    await expect(page.getByRole('heading', { level: 1, name: /^Word to PDF converter$/i })).toBeVisible();

    // If eligibility defers auto warm-up, user intent (hover) still starts the same load path.
    try {
      await page.getByText('Drop your Word files here').hover({ timeout: 8000 });
    } catch {
      /* optional */
    }

    // When the queue is empty, warm failure surfaces in the top notice row (not the queue chip row).
    await expect(
      page.getByText(
        'Converter files are currently unavailable. We are working on it - please try again shortly.'
      )
    ).toBeVisible({ timeout: 90_000 });
    await expect(page.getByText('Ready on demand')).toHaveCount(0);
  });
});
