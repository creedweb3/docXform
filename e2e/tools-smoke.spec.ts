import { test, expect } from '@playwright/test';

const TOOL_SLUGS = [
  'pdf-merge',
  'pdf-split',
  'pdf-compress',
  'pdf-to-images',
  'images-to-pdf',
  'pptx-to-pdf',
  'docx-to-pptx',
  'docx-scrub',
  'pdf-rotate',
  'pdf-organize',
  'pdf-watermark',
  'pdf-unlock',
  'pdf-to-text',
  'image-convert',
  'image-compress',
  'docx-to-text',
];

test.describe.configure({ timeout: 60_000 });

test.describe('Tools hub: every tool page renders its dropzone', () => {
  test('tools index lists core converters and every tool', async ({ page }) => {
    await page.goto('/tools', { waitUntil: 'load', timeout: 60_000 });
    await expect(page.getByRole('heading', { level: 1, name: /All docXform tools/ })).toBeVisible();
    await expect(page.locator('a[href="/word-to-pdf"]').first()).toBeVisible();
    await expect(page.locator('a[href="/pdf-to-word"]').first()).toBeVisible();
    for (const slug of TOOL_SLUGS) {
      const card = page.locator(`a[href="/tools/${slug}"]`).first();
      await expect(card, `Missing card for ${slug}`).toBeVisible();
    }
  });

  for (const slug of TOOL_SLUGS) {
    test(`/tools/${slug} renders the workspace`, async ({ page }) => {
      await page.goto(`/tools/${slug}`, { waitUntil: 'load', timeout: 60_000 });
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText(/drop|files ready|browse|add/i).first()).toBeVisible({ timeout: 30_000 });
    });
  }

  test('/tools/docx-to-pdf redirects to Word to PDF', async ({ page }) => {
    await page.goto('/tools/docx-to-pdf', { waitUntil: 'load', timeout: 60_000 });
    await expect(page).toHaveURL(/\/word-to-pdf\/?$/);
  });

  test('/pdf-to-docx redirects to PDF to Word', async ({ page }) => {
    await page.goto('/pdf-to-docx', { waitUntil: 'load', timeout: 60_000 });
    await expect(page).toHaveURL(/\/pdf-to-word\/?$/);
  });
});
