import { test, expect } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'node:fs';
import * as path from 'node:path';

const fixturesDir = path.join(process.cwd(), 'e2e', 'fixtures');

let twoPagePdf: string;
let mergeA: string;
let mergeB: string;

test.beforeAll(async () => {
  fs.mkdirSync(fixturesDir, { recursive: true });
  twoPagePdf = path.join(fixturesDir, 'e2e-two-page.pdf');
  mergeA = path.join(fixturesDir, 'e2e-merge-a.pdf');
  mergeB = path.join(fixturesDir, 'e2e-merge-b.pdf');

  const doc2 = await PDFDocument.create();
  doc2.addPage();
  doc2.addPage();
  fs.writeFileSync(twoPagePdf, Buffer.from(await doc2.save()));

  const a = await PDFDocument.create();
  a.addPage();
  fs.writeFileSync(mergeA, Buffer.from(await a.save()));

  const b = await PDFDocument.create();
  b.addPage();
  fs.writeFileSync(mergeB, Buffer.from(await b.save()));
});

test.describe.configure({ timeout: 90_000 });

test.describe('PDF page grid UI', () => {
  test('pdf-split: page grid is visible after upload', async ({ page }) => {
    await page.goto('/tools/pdf-split', { waitUntil: 'load', timeout: 60_000 });
    await page.locator('input[type="file"]').setInputFiles(twoPagePdf);

    await expect(page.getByText(/2 page\(s\)/).first()).toBeVisible({ timeout: 45_000 });
  });

  test('pdf-merge: page grid visible; Pages buttons switch active file', async ({ page }) => {
    await page.goto('/tools/pdf-merge', { waitUntil: 'load', timeout: 60_000 });
    await page.locator('input[type="file"]').setInputFiles([mergeA, mergeB]);

    await expect(page.getByText(/1 page\(s\)/).first()).toBeVisible({ timeout: 45_000 });

    const pagesButtons = page.getByRole('button', { name: 'Pages' });
    await expect(pagesButtons).toHaveCount(2);
    await expect(pagesButtons.nth(0)).toHaveAttribute('aria-pressed', 'true');

    await pagesButtons.nth(1).click();
    await expect(pagesButtons.nth(1)).toHaveAttribute('aria-pressed', 'true');
    await expect(pagesButtons.nth(0)).toHaveAttribute('aria-pressed', 'false');
  });
});
