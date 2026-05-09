/**
 * Probe WASM URLs (Node has no CORS enforcement; we still send Origin to mirror browser CORS for CDNs).
 *
 * Usage: npm run wasm:diagnose
 * Loads NEXT_PUBLIC_WASM_ASSET_BASE from .env.local if present.
 * Same-origin: start `npm run dev` first. Optional: WASM_DIAGNOSE_ORIGIN=http://localhost:3001
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

const WASM_BIN_REVISION =
  (typeof process.env.NEXT_PUBLIC_WASM_ASSET_REVISION === 'string' &&
    process.env.NEXT_PUBLIC_WASM_ASSET_REVISION.trim()) ||
  '2026-05-06';

function loadWasmBaseFromEnvLocal() {
  const p = resolve(repoRoot, '.env.local');
  if (!existsSync(p)) return null;
  const text = readFileSync(p, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (t.startsWith('#') || !t) continue;
    const m = t.match(/^NEXT_PUBLIC_WASM_ASSET_BASE=(.+)$/);
    if (m) {
      const v = m[1].trim().replace(/^["']|["']$/g, '');
      if (v && /^https?:\/\//i.test(v)) return v.endsWith('/') ? v : `${v}/`;
    }
  }
  return null;
}

function wasmBaseUrl() {
  const fromFile = loadWasmBaseFromEnvLocal();
  if (fromFile) return fromFile;
  const origin = (process.env.WASM_DIAGNOSE_ORIGIN || 'http://localhost:3000').replace(/\/$/, '');
  return `${origin}/wasm/`;
}

function versionedWasmBinBase() {
  const origin = (process.env.WASM_DIAGNOSE_ORIGIN || 'http://localhost:3000').replace(/\/$/, '');
  return `${origin}/wasm/bin/${WASM_BIN_REVISION}/`;
}

const FILES = [
  'soffice.js',
  'browser.worker.global.js',
  'soffice.worker.js',
  'soffice.wasm',
  'soffice.data',
];

async function probe(name, base, originHeader) {
  const url = new URL(name, base).href;
  try {
    const headers = { Range: 'bytes=0-4095' };
    if (originHeader) headers.Origin = originHeader;
    const res = await fetch(url, { method: 'GET', headers, redirect: 'follow' });
    const buf = await res.arrayBuffer();
    const row = {
      url,
      ok: res.ok,
      status: res.status,
      bytes: buf.byteLength,
      'content-type': res.headers.get('content-type'),
      'access-control-allow-origin': res.headers.get('access-control-allow-origin'),
    };
    return row;
  } catch (e) {
    return { url, ok: false, error: e?.message || String(e) };
  }
}

const base = wasmBaseUrl();
const binBase = versionedWasmBinBase();
const defaultProbeOrigin = process.env.WASM_DIAGNOSE_ORIGIN || new URL(base).origin;
const pageOrigin = (process.env.WASM_CORS_PROBE_ORIGIN || defaultProbeOrigin).replace(/\/$/, '');
const crossOrigin = (() => {
  try {
    return new URL(base).origin !== new URL(pageOrigin).origin;
  } catch {
    return false;
  }
})();

console.log('WASM base:', base);
if (!crossOrigin) {
  console.log('(Ensure `npm run dev` is running for localhost probes.)\n');
} else {
  console.log(`(Cross-origin: checking CORS with Origin: ${pageOrigin})\n`);
}

let failed = false;
const corsOrigin = pageOrigin;

function resolveProbeBase(file) {
  const isBinary = file.endsWith('.wasm') || file.endsWith('.data');
  if (!isBinary) return base;
  try {
    const u = new URL(base);
    if (u.protocol === 'http:' || u.protocol === 'https:') {
      const h = u.hostname;
      if (h !== 'localhost' && h !== '127.0.0.1') {
        return base;
      }
    }
  } catch {
    /* fall through */
  }
  return binBase;
}

for (const f of FILES) {
  const probeBase = resolveProbeBase(f);
  const row = await probe(f, probeBase, crossOrigin ? corsOrigin : undefined);
  console.log(JSON.stringify(row, null, 2));
  if (!row.ok) failed = true;
  if (crossOrigin && row.ok && !row['access-control-allow-origin']) {
    console.warn(
      `  ⚠ No Access-Control-Allow-Origin for Origin ${corsOrigin} — browsers may block. Add this origin on your WASM host CORS policy.`
    );
  }
}

console.log('');
if (failed) {
  console.error(
    crossOrigin
      ? 'Fix CDN URL, CORS, and Netlify NEXT_PUBLIC_WASM_ASSET_BASE + clear cache deploy.'
      : `Fix: copy all files into ${resolve(repoRoot, 'public', 'wasm')} or set NEXT_PUBLIC_WASM_ASSET_BASE in .env.local.`
  );
  process.exit(1);
}
console.log('All probed assets returned HTTP success (first 4KB where Range is supported).');
