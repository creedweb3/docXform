import { expect, test } from '@playwright/test';

test.describe('Converter status messaging', () => {
  test('shows service unavailable when warm-up fails', async ({ page }) => {
    await page.route('**/wasm/soffice.wasm**', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'text/plain',
        body: 'missing',
      });
    });

    await page.goto('/word-to-pdf');
    await expect(page.getByRole('heading', { level: 1, name: /^Word to PDF converter$/i })).toBeVisible();

    await expect(
      page.getByText(
        'Converter files are currently unavailable. We are working on it - please try again shortly.'
      )
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Ready on demand')).toHaveCount(0);
  });
});
