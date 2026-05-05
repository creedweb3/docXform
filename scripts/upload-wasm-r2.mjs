/**
 * Upload `public/wasm/*` to Cloudflare R2 via the S3-compatible API (multipart for large files).
 * Use this when the dashboard upload limit blocks ~250MB of WASM/data.
 *
 * Setup (Cloudflare dashboard):
 * 1. R2 → Create bucket (e.g. docxform-wasm).
 * 2. R2 → Overview → copy Account ID.
 * 3. Manage R2 API Tokens → Create API token with Object Read & Write scoped to that bucket.
 *    Put Access Key ID / Secret Access Key into env below.
 * 4. Bucket → Settings → Public access → Allow R2.dev subdomain (or connect a custom domain).
 * 5. Bucket → Settings → CORS policy — allow GET from your Netlify origins, e.g.:
 *    [{"AllowedOrigins":["https://docxform.com","https://www.docxform.com","http://localhost:3000"],"AllowedMethods":["GET","HEAD"],"AllowedHeaders":["*"],"MaxAgeSeconds":86400}]
 * 6. If your Next site sends COEP `require-corp`, add a Transform Rule (or custom metadata on
 *    upload) so wasm/js responses include `Cross-Origin-Resource-Policy: cross-origin`.
 *
 * Then set env (or copy .env.local):
 *   CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_WASM_BUCKET
 *
 * Run: npm run wasm:upload-r2
 * Upload only large files (skip the three you already put in the bucket UI):
 *   R2_UPLOAD_ONLY=soffice.wasm,soffice.data npm run wasm:upload-r2
 *
 * Netlify: set NEXT_PUBLIC_WASM_ASSET_BASE to your public URL + `/wasm`, e.g.
 *   https://pub-xxxxxxxxx.r2.dev/wasm
 *
 * Loads `.env.local` then `.env` from the project root (via dotenv).
 */

import { createReadStream, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

const repoRoot = process.cwd();
if (existsSync(resolve(repoRoot, '.env.local'))) {
  loadEnv({ path: resolve(repoRoot, '.env.local') });
}
if (existsSync(resolve(repoRoot, '.env'))) {
  loadEnv({ path: resolve(repoRoot, '.env') });
}

const WASM_DIR = join(repoRoot, 'public', 'wasm');

const CONTENT_TYPES = {
  '.wasm': 'application/wasm',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.data': 'application/octet-stream',
};

function required(name) {
  const v = process.env[name]?.trim();
  if (!v) {
    console.error(`Missing required env: ${name}`);
    process.exit(1);
  }
  return v;
}

function contentTypeFor(filename) {
  const dot = filename.lastIndexOf('.');
  const ext = dot >= 0 ? filename.slice(dot) : '';
  return CONTENT_TYPES[ext] || 'application/octet-stream';
}

async function main() {
  const accountId = required('CLOUDFLARE_ACCOUNT_ID');
  const accessKeyId = required('R2_ACCESS_KEY_ID');
  const secretAccessKey = required('R2_SECRET_ACCESS_KEY');
  const bucket = required('R2_WASM_BUCKET');
  const endpoint =
    process.env.R2_ENDPOINT?.trim() || `https://${accountId}.r2.cloudflarestorage.com`;

  const client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });

  let names = readdirSync(WASM_DIR);
  if (names.length === 0) {
    console.error(`No files in ${WASM_DIR}`);
    process.exit(1);
  }

  const only = process.env.R2_UPLOAD_ONLY?.trim();
  if (only) {
    const allow = new Set(
      only
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    );
    names = names.filter((n) => allow.has(n));
    if (names.length === 0) {
      console.error('R2_UPLOAD_ONLY did not match any files in public/wasm');
      process.exit(1);
    }
    console.log('R2_UPLOAD_ONLY filter:', [...names].join(', '));
    console.log('');
  }

  console.log(`Endpoint: ${endpoint}`);
  console.log(`Bucket:   ${bucket}`);
  console.log(`Prefix:   wasm/`);
  console.log('');

  for (const name of names) {
    const filePath = join(WASM_DIR, name);
    const stat = statSync(filePath);
    if (!stat.isFile()) continue;

    const key = `wasm/${name}`;
    const contentType = contentTypeFor(name);
    const sizeMb = (stat.size / (1024 * 1024)).toFixed(1);

    console.log(`Uploading ${key} (${sizeMb} MB, ${contentType})...`);

    const upload = new Upload({
      client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: createReadStream(filePath),
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      },
      queueSize: 4,
      partSize: 8 * 1024 * 1024,
      leavePartsOnError: false,
    });

    upload.on('httpUploadProgress', (p) => {
      if (!p.total) return;
      const pct = Math.floor(((p.loaded ?? 0) / p.total) * 100);
      if (pct % 10 === 0 || p.loaded === p.total) {
        process.stdout.write(`\r  ${key}  ${pct}%`);
      }
    });

    await upload.done();
    process.stdout.write('\n');
    console.log(`  Done: ${key}`);
  }

  console.log('');
  console.log('All uploads finished. Set NEXT_PUBLIC_WASM_ASSET_BASE to your public base, e.g.:');
  console.log('  https://pub-<subdomain>.r2.dev/wasm');
  console.log('(no trailing slash required; the app normalizes it.)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
