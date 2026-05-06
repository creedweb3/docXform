import { test, expect } from '@playwright/test';

test.describe('docXform smoke', () => {
  test('home loads and shows primary CTAs', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: /docXform/i })).toBeVisible();
    await expect(page.locator('main a[href="/word-to-pdf"]')).toBeVisible();
    await expect(page.locator('main a[href="/pdf-to-word"]')).toBeVisible();
    await expect(page.getByText(/Browser Based/i)).toBeVisible();

    expect(errors.filter((m) => !m.includes('favicon'))).toEqual([]);
  });

  test('Word to PDF tool page loads', async ({ page }) => {
    await page.goto('/word-to-pdf');
    await expect(
      page.getByRole('heading', { level: 1, name: /^Word to PDF converter$/i })
    ).toBeVisible();
    await expect(page.getByText(/Drop your Word files here/i)).toBeVisible();
  });

  test('PDF to Word tool page loads', async ({ page }) => {
    await page.goto('/pdf-to-word');
    await expect(
      page.getByRole('heading', { level: 1, name: /^PDF to Word converter$/i })
    ).toBeVisible();
    await expect(page.getByText(/Drop your PDF files here/i)).toBeVisible();
  });

  test('articles index loads', async ({ page }) => {
    await page.goto('/articles');
    await expect(page.getByRole('heading', { level: 1, name: /Articles & guides/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Modern Word Security with WASM/i })).toBeVisible();
  });

  test('footer includes Articles link', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.locator('footer').getByRole('link', { name: /^Articles$/i })).toBeVisible();
  });
});
