/**
 * Check that WASM asset URLs are reachable and that R2 (or your CDN) returns CORS for each
 * browser Origin you care about. Node does not enforce CORS, but we send `Origin` and verify
 * `Access-Control-Allow-Origin` so failures match what the browser would see.
 *
 * Usage: node scripts/diagnose-wasm-assets.mjs
 * Optional: WASM_DIAGNOSE_ORIGIN=http://127.0.0.1:3000 when using /wasm/ relative base
 * Optional: WASM_CORS_ORIGINS=comma,separated,list (defaults include localhost:3000 and :3001)
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
config({ path: resolve(repoRoot, '.env.local') });
config({ path: resolve(repoRoot, '.env') });

function wasmBase() {
  const raw = process.env.NEXT_PUBLIC_WASM_ASSET_BASE?.trim();
  if (raw && /^https?:\/\//i.test(raw)) {
    return raw.endsWith('/') ? raw : `${raw}/`;
  }
  const origin = (process.env.WASM_DIAGNOSE_ORIGIN || 'http://localhost:3000').replace(/\/$/, '');
  return `${origin}/wasm/`;
}

const FILES = [
  'soffice.js',
  'browser.worker.global.js',
  'soffice.worker.js',
  'soffice.wasm',
  'soffice.data',
];

async function probe(name) {
  const base = wasmBase();
  const url = new URL(name, base).href;
  try {
    const originProbe = process.env.WASM_CORS_ORIGIN || 'https://docxform.com';
    const res = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-4095', Origin: originProbe },
      redirect: 'follow',
    });
    const buf = await res.arrayBuffer();
    const corp = res.headers.get('cross-origin-resource-policy');
    const acao = res.headers.get('access-control-allow-origin');
    const ct = res.headers.get('content-type');
    return {
      url,
      ok: res.ok,
      status: res.status,
      bytes: buf.byteLength,
      'content-type': ct,
      'cross-origin-resource-policy': corp,
      'access-control-allow-origin': acao,
    };
  } catch (e) {
    return { url, ok: false, error: e?.message || String(e) };
  }
}

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://docxform.com',
  'https://www.docxform.com',
];

function corsOriginsToCheck() {
  const raw = process.env.WASM_CORS_ORIGINS?.trim();
  if (raw) {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return DEFAULT_CORS_ORIGINS;
}

async function corsForOrigin(origin) {
  const base = wasmBase();
  if (!/^https?:\/\//i.test(base)) {
    return { origin, skip: true, note: 'same-origin /wasm/ — CORS not required' };
  }
  const url = new URL('soffice.js', base).href;
  const res = await fetch(url, {
    method: 'GET',
    headers: { Range: 'bytes=0-0', Origin: origin },
    redirect: 'follow',
  });
  const acao = res.headers.get('access-control-allow-origin');
  const ok = res.ok && (acao === origin || acao === '*');
  return { origin, status: res.status, 'access-control-allow-origin': acao, browserWouldLoad: ok };
}

console.log('WASM base (from env):', wasmBase());
console.log('Single-file probe Origin:', process.env.WASM_CORS_ORIGIN || 'https://docxform.com');
console.log('');

let failed = false;
for (const f of FILES) {
  const row = await probe(f);
  const line = JSON.stringify(row, null, 2);
  console.log(line);
  if (!row.ok) failed = true;
}

console.log('');
console.log('CORS check (R2 / cross-origin base only):');
let corsFailed = false;
for (const origin of corsOriginsToCheck()) {
  const row = await corsForOrigin(origin);
  console.log(JSON.stringify(row, null, 2));
  if (!row.skip && !row.browserWouldLoad) corsFailed = true;
}

console.log('');
if (failed) {
  console.error('Some assets failed. Fix R2 public URL, bucket objects under wasm/, or start dev for same-origin /wasm/.');
  process.exit(1);
}
if (corsFailed) {
  console.error(
    'CORS: at least one Origin is missing Access-Control-Allow-Origin. Browsers will block fetch() / Worker loads. Update R2 bucket CORS (see scripts/r2-cors-policy.json) to include every dev port (3000 and 3001) and prod hosts.'
  );
  process.exit(1);
}
console.log('All probed assets returned HTTP success (first 4KB where Range supported).');
console.log('All listed Origins received a matching ACAO header for cross-origin WASM base.');
