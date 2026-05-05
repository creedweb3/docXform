/**
 * Upload every file from public/wasm to Cloudflare R2 using Wrangler.
 *
 * Required env:
 * - CLOUDFLARE_ACCOUNT_ID
 * - R2_WASM_BUCKET
 *
 * Auth for wrangler:
 * - CLOUDFLARE_API_TOKEN (recommended), or interactive `wrangler login`.
 *
 * Optional env:
 * - R2_WASM_PREFIX (default: "wasm")
 * - R2_PUBLIC_BASE_URL (e.g. https://cdn.example.com/wasm)
 */
import { readdirSync, statSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const wasmDir = resolve(repoRoot, 'public', 'wasm');

function walkFiles(dir) {
  const out = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(abs));
      continue;
    }
    if (entry.isFile()) out.push(abs);
  }
  return out;
}

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
const bucket = process.env.R2_WASM_BUCKET?.trim();
const prefix = (process.env.R2_WASM_PREFIX || 'wasm').replace(/^\/+|\/+$/g, '');
const publicBase = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, '');

if (!accountId || !bucket) {
  console.error(
    'Missing env. Required: CLOUDFLARE_ACCOUNT_ID and R2_WASM_BUCKET. ' +
      'Optional: R2_WASM_PREFIX, R2_PUBLIC_BASE_URL.'
  );
  process.exit(1);
}

const files = walkFiles(wasmDir);
if (files.length === 0) {
  console.error(`No files found under ${wasmDir}`);
  process.exit(1);
}

console.log(`Uploading ${files.length} files from ${wasmDir} to r2://${bucket}/${prefix}/ ...`);

for (const abs of files) {
  const rel = relative(wasmDir, abs).split(sep).join('/');
  const key = `${prefix}/${rel}`;
  const size = statSync(abs).size;

  const args = [
    'wrangler@latest',
    'r2',
    'object',
    'put',
    `${bucket}/${key}`,
    `--file=${abs}`,
    '--remote',
  ];

  const run = spawnSync('npx', args, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      CLOUDFLARE_ACCOUNT_ID: accountId,
    },
  });

  if (run.status !== 0) {
    console.error(`\nUpload failed for: ${rel}`);
    process.exit(run.status || 1);
  }

  if (publicBase) {
    console.log(`  ok  ${size} bytes  -> ${publicBase}/${rel}`);
  } else {
    console.log(`  ok  ${size} bytes  -> r2://${bucket}/${key}`);
  }
}

console.log('\nUpload complete.');
if (publicBase) {
  console.log(`Set NEXT_PUBLIC_WASM_ASSET_BASE=${publicBase} in Netlify and clear-cache redeploy.`);
}
