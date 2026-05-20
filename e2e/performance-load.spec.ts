import { test, expect, type Page } from '@playwright/test';

/**
 * Real-browser load metrics: cold cache (CDP clear) vs warm revisit, plus optional
 * "time until converter status settles" on tool pages.
 *
 * Run:  npx playwright test e2e/performance-load.spec.ts
 * Or:   npm run test:perf
 *
 * Env:
 *   PLAYWRIGHT_BASE_URL — same as other e2e (default http://localhost:3000)
 *   PERF_SKIP_CONVERTER_WAIT=1 — skip slow WASM settle + SPA timing tests (also skipped when CI is set)
 */

const ROUTES = ['/', '/word-to-pdf', '/pdf-to-word'] as const;

const skipConverterWait = process.env.PERF_SKIP_CONVERTER_WAIT === '1' || !!process.env.CI;

async function clearBrowserCache(page: Page) {
  const session = await page.context().newCDPSession(page);
  await session.send('Network.clearBrowserCache');
}

async function collectPaintAndNav(page: Page) {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const paints = performance.getEntriesByType('paint') as PerformancePaintTiming[];
    const fcp = paints.find((p) => p.name === 'first-contentful-paint');
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint') as PerformanceEntry[];
    const lcp = lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1] : undefined;
    return {
      domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd - nav.fetchStart) : null,
      loadEventEnd: nav ? Math.round(nav.loadEventEnd - nav.fetchStart) : null,
      domInteractive: nav ? Math.round(nav.domInteractive - nav.fetchStart) : null,
      transferSize: nav?.transferSize ?? null,
      encodedBodySize: nav?.encodedBodySize ?? null,
      fcpMs: fcp ? Math.round(fcp.startTime) : null,
      lcpMs: lcp && 'renderTime' in lcp && typeof (lcp as { renderTime?: number }).renderTime === 'number'
        ? Math.round((lcp as { renderTime: number }).renderTime || (lcp as { loadTime?: number }).loadTime || lcp.startTime)
        : lcp
          ? Math.round(lcp.startTime)
          : null,
    };
  });
}

test.describe('Performance: cold cache, warm repeat, converter settle', () => {
  test.describe.configure({ mode: 'serial', timeout: skipConverterWait ? 120_000 : 300_000 });

  for (const path of ROUTES) {
    test(`cold then warm navigation: ${path}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await clearBrowserCache(page);
      const coldStart = Date.now();
      await page.goto(path, { waitUntil: 'load', timeout: 90_000 });
      const coldWallMs = Date.now() - coldStart;
      const coldMetrics = await collectPaintAndNav(page);

      await page.goto('about:blank');
      const warmStart = Date.now();
      await page.goto(path, { waitUntil: 'load', timeout: 90_000 });
      const warmWallMs = Date.now() - warmStart;
      const warmMetrics = await collectPaintAndNav(page);

      const summary = {
        path,
        coldWallMs,
        warmWallMs,
        coldMetrics,
        warmMetrics,
        noiseFilteredErrors: errors.filter((m) => !m.includes('favicon') && !m.includes('ads')),
      };

      console.log('\n[perf]', JSON.stringify(summary, null, 2));

      await test.info().attach(`perf-${path === '/' ? 'home' : path.slice(1).replace(/\//g, '-')}.json`, {
        body: Buffer.from(JSON.stringify(summary, null, 2), 'utf8'),
        contentType: 'application/json',
      });

      expect(summary.noiseFilteredErrors, 'no unexpected page errors').toEqual([]);

      expect(coldWallMs, 'cold navigation should finish within 90s').toBeLessThan(90_000);
      expect(warmWallMs, 'warm navigation should finish within 90s').toBeLessThan(90_000);
      expect(coldMetrics.loadEventEnd, 'loadEventEnd available').toBeTruthy();
    });
  }

  test('converter tool: time until ready or deferred (cold cache)', async ({ page }) => {
    test.skip(
      skipConverterWait,
      'Skipped on CI or when PERF_SKIP_CONVERTER_WAIT=1. Locally: unset those and run for WASM settle timing (slow).'
    );

    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await clearBrowserCache(page);
    const t0 = Date.now();
    await page.goto('/word-to-pdf', { waitUntil: 'load', timeout: 90_000 });

    const status = page.getByText(/Converter ready|Loads when you convert|Service unavailable/);
    await expect(status.first()).toBeVisible({ timeout: 240_000 });
    const settleMs = Date.now() - t0;

    const text = (await status.first().textContent())?.trim() ?? '';

    const summary = {
      path: '/word-to-pdf',
      settleWallMs: settleMs,
      finalStatusSnippet: text.slice(0, 80),
      metricsAfterSettle: await collectPaintAndNav(page),
    };

    console.log('\n[perf-converter]', JSON.stringify(summary, null, 2));

    await test.info().attach('perf-converter-settle.json', {
      body: Buffer.from(JSON.stringify(summary, null, 2), 'utf8'),
      contentType: 'application/json',
    });

    expect(errors.filter((m) => !m.includes('favicon'))).toEqual([]);
    expect(settleMs, 'converter should reach ready/deferred/failed within 4 minutes').toBeLessThan(240_000);
  });

  test('SPA: second tool page shows Converter ready quickly after first warm', async ({ page }) => {
    test.skip(
      skipConverterWait,
      'Unset CI and PERF_SKIP_CONVERTER_WAIT locally to run WASM warm + SPA revisit timing.'
    );

    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto('/word-to-pdf', { waitUntil: 'load', timeout: 90_000 });
    const status = page.getByText(/Converter ready|Loads when you convert|Service unavailable/);
    await expect(status.first()).toBeVisible({ timeout: 240_000 });
    const label = (await status.first().textContent())?.trim() ?? '';
    if (!label.includes('Converter ready')) {
      test.skip(true, 'Converter did not reach ready (deferred/failed); skip SPA timing assertion.');
    }

    const t0 = Date.now();
    await page.getByRole('navigation').getByRole('link', { name: 'PDF to Word' }).click();
    await expect(page.getByRole('heading', { level: 1, name: /PDF to Word/i })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Converter ready').first()).toBeVisible({ timeout: 20_000 });
    const readyAfterNavMs = Date.now() - t0;

    console.log('\n[perf-spa-second-tool]', JSON.stringify({ readyAfterNavMs }, null, 2));

    await test.info().attach('perf-spa-second-tool.json', {
      body: Buffer.from(JSON.stringify({ readyAfterNavMs, errors }, null, 2), 'utf8'),
      contentType: 'application/json',
    });

    expect(errors.filter((m) => !m.includes('favicon') && !m.includes('ads'))).toEqual([]);
    expect(
      readyAfterNavMs,
      'In-memory converter should make the second tool page show ready without another long warm'
    ).toBeLessThan(20_000);
  });
});
