/**
 * Check that WASM assets under `/wasm/` are reachable (Node fetch — no browser CORS).
 *
 * Usage: npm run wasm:diagnose
 * Optional: WASM_DIAGNOSE_ORIGIN=http://127.0.0.1:3001  (default http://localhost:3000)
 * Start `next dev` first so /wasm/* is served.
 */
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

function wasmBaseUrl() {
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
  const base = wasmBaseUrl();
  const url = new URL(name, base).href;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-4095' },
      redirect: 'follow',
    });
    const buf = await res.arrayBuffer();
    return {
      url,
      ok: res.ok,
      status: res.status,
      bytes: buf.byteLength,
      'content-type': res.headers.get('content-type'),
    };
  } catch (e) {
    return { url, ok: false, error: e?.message || String(e) };
  }
}

console.log('Probing same-origin WASM base:', wasmBaseUrl());
console.log('(Ensure `npm run dev` is running if localhost fails.)\n');

let failed = false;
for (const f of FILES) {
  const row = await probe(f);
  console.log(JSON.stringify(row, null, 2));
  if (!row.ok) failed = true;
}

console.log('');
if (failed) {
  console.error(
    `Fix: copy all LibreOffice WASM files into ${resolve(repoRoot, 'public', 'wasm')} (see .env.example).`
  );
  process.exit(1);
}
console.log('All probed assets returned HTTP success (first 4KB where Range is supported).');
