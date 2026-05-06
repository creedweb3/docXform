# WASM Hosting Options (Converter)

The converter needs a public `/wasm/` mirror containing:

- `soffice.js`
- `browser.worker.global.js`
- `soffice.worker.js`
- `soffice.wasm`
- `soffice.data`

Then set `NEXT_PUBLIC_WASM_ASSET_BASE` to that public URL (for this project: `https://wasm.docxform.com/wasm`).

For production, the robust setup is to keep runtime same-origin (`/wasm/`) and proxy only
`/wasm/soffice.wasm` + `/wasm/soffice.data` to R2/CDN via middleware. This avoids cross-origin Worker issues.
Code is also hardened to default to same-origin `/wasm/` unless
`NEXT_PUBLIC_WASM_FORCE_SAME_ORIGIN=0` is explicitly set.

## Cloudflare R2 (recommended)

Cloudflare has a generous free tier and works well with large files.

### 1) Create bucket + public URL

1. Create an R2 bucket.
2. Add a custom domain or public dev URL for the bucket.
3. Ensure objects are reachable as `https://wasm.docxform.com/wasm/<file>`.

### 2) Upload from this repo

Set env vars:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN` (R2 write permission)
- `R2_WASM_BUCKET`
- `R2_WASM_PREFIX=wasm`
- `R2_PUBLIC_BASE_URL=https://wasm.docxform.com/wasm`

Run:

```bash
npm run wasm:r2:upload
```

### 3) Configure Cloudflare deployment

Set:

```bash
NEXT_PUBLIC_WASM_ASSET_BASE=https://wasm.docxform.com/wasm
```

Then deploy and clear cache if your platform has cached old WASM responses.

### 4) Verify

```bash
npm run wasm:diagnose
```

If using a different origin than your site, set CORS on the WASM host for your exact page origins (scheme + host + port).

## Other low-cost/free options

If you do not want Cloudflare:

- **Backblaze B2**: small free tier, S3-compatible, good for large files.
- **Supabase Storage**: free tier, easy if your app already uses Supabase.
- **AWS S3**: reliable, but usually not free after trial.

Notes:

- GitHub + jsDelivr is usually not viable for this file set because `soffice.wasm` is larger than GitHub's 100MB file limit.
- Any host must serve byte ranges and keep stable URLs for all `/wasm/*` assets.
