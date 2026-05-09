import { test, expect } from '@playwright/test';

/**
 * Mirrors how the app resolves WASM URLs and fetches them in the browser (CORS + COEP apply here).
 * Run with dev server: npm run dev  then  npx playwright test e2e/wasm-assets.spec.ts
 */
test.describe('WASM assets (browser)', () => {
  test('crossOriginIsolated and core WASM URLs fetch from configured base', async ({ page }) => {
    await page.goto('/word-to-pdf');
    await expect(page.getByRole('heading', { level: 1, name: /^Word to PDF converter$/i })).toBeVisible();

    const result = await page.evaluate(async () => {
      const baseRoot = window.__DOCXFORM_WASM_BASE__ || '/wasm/';
      const wasmRev = '2026-05-06';
      const versionedBin = `${window.location.origin}/wasm/bin/${wasmRev}/`;
      const resolveUrl = (name: string) => {
        if (name.endsWith('.wasm') || name.endsWith('.data')) {
          return new URL(name, versionedBin).href;
        }
        return new URL(name, baseRoot.startsWith('http') ? baseRoot : `${window.location.origin}${baseRoot}`).href;
      };

      const names = [
        'soffice.js',
        'browser.worker.global.js',
        'soffice.worker.js',
        'soffice.wasm',
        'soffice.data',
      ];
      const rows: Array<Record<string, unknown>> = [];

      for (const name of names) {
        const url = resolveUrl(name);
        try {
          const isBinary = name.endsWith('.wasm') || name.endsWith('.data');
          const r = await fetch(url, {
            signal: AbortSignal.timeout(45_000),
            headers: isBinary ? { Range: 'bytes=0-0' } : undefined,
          });
          rows.push({
            name,
            url,
            status: r.status,
            ok: r.ok,
            contentType: r.headers.get('content-type'),
            corp: r.headers.get('cross-origin-resource-policy'),
            acao: r.headers.get('access-control-allow-origin'),
          });
        } catch (e) {
          rows.push({ name, url, error: e instanceof Error ? e.message : String(e) });
        }
      }

      return {
        baseRoot,
        crossOriginIsolated: window.crossOriginIsolated,
        rows,
      };
    });

    // surfaced in Playwright report when debugging
    console.log('WASM diagnose:', JSON.stringify(result, null, 2));

    expect(result.crossOriginIsolated, 'COOP+COEP should enable crossOriginIsolated for LibreOffice WASM').toBe(
      true
    );

    for (const row of result.rows) {
      expect(row.error, `fetch ${row.name}: ${row.error || ''}`).toBeUndefined();
      expect(row.ok, `HTTP ok for ${row.name}`).toBe(true);
      if (String(row.name).endsWith('.wasm') || String(row.name).endsWith('.data')) {
        expect([200, 206]).toContain(row.status);
      }
    }

    // `page.evaluate` fetch results above are the contract. Console may still show unrelated
    // dev-only 404/500 (telemetry, ads, optional chunks) without affecting WASM availability.
  });
});
