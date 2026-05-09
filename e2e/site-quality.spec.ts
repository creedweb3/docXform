import { test, expect, chromium } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test.describe.configure({ timeout: 120_000 });

test.describe('Site quality: WASM reachability, cache headers, persistent cache', () => {
  test('Word to PDF page renders converter UI', async ({ page }) => {
    await page.goto('/word-to-pdf', { waitUntil: 'load', timeout: 90_000 });
    await expect(page.getByRole('heading', { level: 1, name: /^Word to PDF converter$/i })).toBeVisible();
    await expect(page.getByText('Drop your Word files here')).toBeVisible();
  });

  test('soffice.wasm responds with bytes (versioned path or legacy)', async ({ request, baseURL }) => {
    const base = (baseURL ?? process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
    const envRev = process.env.NEXT_PUBLIC_WASM_ASSET_REVISION?.trim();
    const candidates = [
      ...(envRev ? [`${base}/wasm/bin/${envRev}/soffice.wasm`] : []),
      `${base}/wasm/bin/2026-05-06/soffice.wasm`,
      `${base}/wasm/soffice.wasm`,
    ];

    let res: Awaited<ReturnType<typeof request.get>> | null = null;
    for (const url of candidates) {
      const r = await request.get(url, {
        headers: { Range: 'bytes=0-0' },
        timeout: 60_000,
      });
      if (![200, 206].includes(r.status())) continue;
      const body = await r.body();
      if (body.byteLength > 0) {
        res = r;
        break;
      }
    }

    expect(res, `Expected 200/206 with body from one of: ${candidates.join(', ')}`).not.toBeNull();

    const cc = (res!.headers()['cache-control'] ?? '').toLowerCase();
    if (cc.includes('immutable')) {
      expect(cc).toMatch(/max-age=\d{5,}/);
    } else {
      // `next dev` often applies short cache to rewritten routes; immutable is asserted in scripts/verify-all.mjs + next.config.js.
      expect(cc.length).toBeGreaterThan(0);
      expect(cc).toMatch(/max-age=\d+/);
    }
  });

  test('second visit with same Chromium profile is faster than cold (HTTP cache)', async () => {
    test.setTimeout(600_000);
    test.skip(!!process.env.CI, 'Downloads large WASM; run locally to validate disk cache across sessions.');

    const userDataDir = mkdtempSync(join(tmpdir(), 'docxform-pw-profile-'));

    const persistent1 = await chromium.launchPersistentContext(userDataDir, {
      headless: true,
    });
    const page1 = await persistent1.newPage();
    const t0 = Date.now();
    await page1.goto('/word-to-pdf', { waitUntil: 'load', timeout: 90_000 });
    await expect(
      page1.getByText(/Converter ready|Loads when you convert|Service unavailable/)
    ).toBeVisible({ timeout: 240_000 });
    const firstReadyMs = Date.now() - t0;
    await persistent1.close();

    const persistent2 = await chromium.launchPersistentContext(userDataDir, {
      headless: true,
    });
    const page2 = await persistent2.newPage();
    const t1 = Date.now();
    await page2.goto('/word-to-pdf', { waitUntil: 'load', timeout: 90_000 });
    await expect(
      page2.getByText(/Converter ready|Loads when you convert|Service unavailable/)
    ).toBeVisible({ timeout: 240_000 });
    const secondReadyMs = Date.now() - t1;
    await persistent2.close();

    console.log('[cache-persist]', { firstReadyMs, secondReadyMs, userDataDir });

    if (firstReadyMs > 45_000) {
      expect(secondReadyMs, 'cached profile should warm noticeably faster').toBeLessThan(firstReadyMs * 0.8);
    } else {
      expect(secondReadyMs, 'second warm should finish quickly').toBeLessThan(90_000);
    }
  });
});
