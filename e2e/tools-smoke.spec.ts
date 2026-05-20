import { test, expect } from '@playwright/test';
import { AVAILABLE_TOOL_SLUGS, TOOL_PAGE_AVAILABLE } from '../lib/tool-availability';
import { toolDefinitions } from '../lib/tools';

const ALL_TOOL_SLUGS = toolDefinitions.map((t) => t.slug);
const COMING_SOON_SLUGS = ALL_TOOL_SLUGS.filter((slug) => !TOOL_PAGE_AVAILABLE[slug]);

test.describe.configure({ timeout: 60_000 });

test.describe('Tools hub: every tool page renders its dropzone', () => {
  test('tools index lists core converters and every tool', async ({ page }) => {
    await page.goto('/tools', { waitUntil: 'load', timeout: 60_000 });
    await expect(page.getByRole('heading', { level: 1, name: /All docXform tools/ })).toBeVisible();
    await expect(page.locator('a[href="/word-to-pdf"]').first()).toBeVisible();
    await expect(page.locator('a[href="/pdf-to-word"]').first()).toBeVisible();
    for (const slug of AVAILABLE_TOOL_SLUGS) {
      const card = page.locator(`a[href="/tools/${slug}"]`).first();
      await expect(card, `Missing link card for ${slug}`).toBeVisible();
    }
    for (const slug of COMING_SOON_SLUGS) {
      await expect(page.locator(`a[href="/tools/${slug}"]`)).toHaveCount(0);
    }
    await expect(page.getByText('Coming soon').first()).toBeVisible();
  });

  for (const slug of AVAILABLE_TOOL_SLUGS) {
    test(`/tools/${slug} renders the workspace`, async ({ page }) => {
      await page.goto(`/tools/${slug}`, { waitUntil: 'load', timeout: 60_000 });
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText(/drop|files ready|browse|add/i).first()).toBeVisible({ timeout: 30_000 });
    });
  }

  test('coming soon tool route shows gate (not workspace)', async ({ page }) => {
    const slug = COMING_SOON_SLUGS[0] ?? 'pdf-merge';
    await page.goto(`/tools/${slug}`, { waitUntil: 'load', timeout: 60_000 });
    await expect(page.getByText(/isn't open yet/i)).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('input[type="file"]')).toHaveCount(0);
  });

  test('/tools/docx-to-pdf redirects to Word to PDF', async ({ page }) => {
    await page.goto('/tools/docx-to-pdf', { waitUntil: 'load', timeout: 60_000 });
    await expect(page).toHaveURL(/\/word-to-pdf\/?$/);
  });

  test('/pdf-to-docx redirects to PDF to Word', async ({ page }) => {
    await page.goto('/pdf-to-docx', { waitUntil: 'load', timeout: 60_000 });
    await expect(page).toHaveURL(/\/pdf-to-word\/?$/);
  });
});
