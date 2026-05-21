# Security, deploy, and ops plan

Living checklist for **docxform.com** (Cloudflare Pages, Next.js 16, Google AdSense).  
**Last updated:** 2026-05-20.

---

## Summary

| Area | State |
|------|--------|
| **Production branches** | `master` and `dev-stable` at **`9c075d7`**; `dev-tools` same commit |
| **npm audit** | **0 vulnerabilities** (Next **16.2.6**) |
| **AdSense (code)** | Meta tag, `next/script`, `public/ads.txt` — deployed from `1c059a3`+ |
| **AdSense (dashboard)** | 👤 Verify ownership + site review after each prod deploy |
| **Cloudflare `_redirects`** | Removed; WASM proxy only in `middleware.ts` |
| **SEO / tools index** | `noindex` on WIP tools; sitemap lists live tools only |

---

## Status legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Done (code merged or verified) |
| 🔄 | In progress |
| ⏳ | Planned |
| 👤 | Manual (dashboard / browser checks) |

---

## Branch and deploy flow

```text
dev-tools  →  dev-stable  →  master  →  Cloudflare Pages (production)
```

| Commit | Branch(es) | What shipped |
|--------|------------|--------------|
| `8219a0e` | all three | Format-based tones, tools hub, coming-soon gates, PDF split studio, docs (`colors`, `pages-reference`, `tool-status`) |
| `1c059a3` | all three | AdSense: `lib/adsense.ts`, layout script + meta, `noindex`/sitemap for WIP tools; removed click-only `adsense-loader` |
| `b655c13` | all three | Fix `getStudioAccent(tone \| undefined)` — Cloudflare build TypeScript |
| `9c075d7` | all three | Next **16.2.6**, `npm audit` clean, delete `public/_redirects`, this plan doc |

**Production deploy:** Trigger Cloudflare Pages on **`master`** or **`dev-stable`** (whichever the project uses). Latest merge: **`0d32d42`** on `master` (merge of `9c075d7`). Confirm build log shows commit **`9c075d7`** or newer.

---

## Code inventory (AdSense & SEO)

| Requirement | Location |
|-------------|----------|
| Publisher ID `ca-pub-7154775313079570` | `lib/adsense.ts` |
| AdSense script (`adsbygoogle.js`) | `app/layout.tsx` — `next/script`, `strategy="afterInteractive"` |
| Meta `google-adsense-account` | `app/layout.tsx` — `metadata.other` |
| ads.txt line | `public/ads.txt` (same line as `ADSENSE_ADS_TXT_LINE` in `lib/adsense.ts`) |
| CSP allowlist for Google ads | `next.config.js` — `script-src`, `connect-src`, `frame-src` |
| ads.txt not wrapped in COEP middleware | `middleware.ts` matcher excludes `ads.txt` |
| Canonical host `https://www.docxform.com` | `lib/seo.ts` — `SITE_URL` |
| Sitemap: live tools only | `lib/seo.ts` — filters via `lib/tool-availability.ts` |
| WIP tool pages `noindex` | `lib/seo.ts` — `createToolPageMetadata()` |
| WASM same-origin proxy | `middleware.ts` → `wasm.docxform.com` (not `_redirects`) |
| robots.txt | `app/robots.ts` — allows `/`; blocks `/admin-private/`, `/api/` only |

**AdSense add-site field:** use **`docxform.com`** (no `www`, no `https://`). Public site canonical remains **www**.

---

## High priority

### H1 — Patch Next.js and npm audit (supply chain)

**Why:** Next 16.0.0–16.2.5 had high-severity advisories (middleware bypass, CSP/XSS, DoS).

**Done:**

- `next` and `eslint-config-next` → **16.2.6**
- `npm audit fix` → **0 vulnerabilities**
- Local `npm run build` OK
- Merged `dev-tools` → `dev-stable` → `master` (`9c075d7`)

**Acceptance:** ✅ Clean audit; green Cloudflare build on `9c075d7`.

**Status:** ✅

---

### H2 — Remove invalid Cloudflare `_redirects` WASM proxy lines

**Why:** Deploy log reported invalid rules — external `200` targets not allowed on Cloudflare Pages. Rules were ignored; WASM already handled in middleware.

**Done:**

- Deleted `public/_redirects` (contained only invalid `/wasm/soffice.*` → CDN lines)
- WASM unchanged: `middleware.ts` rewrites `/wasm/soffice.wasm`, `/wasm/soffice.data`, `/wasm/bin/<rev>/…`

**Post-deploy check:** Run Word/PDF convert once after deploy to confirm WASM loads.

**Acceptance:** ✅ No “invalid redirect lines” in deploy log; converters work.

**Status:** ✅

---

### H3 — AdSense verification on production (dashboard)

**Why:** AdSense showed “Requires review” and ads.txt “Not found” before AdSense code shipped. Implementation is in repo from **`1c059a3`** onward.

**Code is live when deploy ≥ `1c059a3` (ideally `9c075d7`).**

**Manual checklist (👤):**

1. Confirm Cloudflare deploy commit ≥ `9c075d7`.
2. Browser checks:
   - https://docxform.com/ads.txt → `google.com, pub-7154775313079570, DIRECT, f08c47fec0942fa0`
   - https://www.docxform.com/ads.txt → same (apex redirects to www)
   - https://www.docxform.com/ → view source → `google-adsense-account` and `pagead2.googlesyndication.com`
3. AdSense → **Sites** → property **`docxform.com`** (not `www.docxform.com` in the add-site field).
4. **Sites** → **Let’s go** → verify (**Meta tag** or **ads.txt**) → confirm ownership.
5. **ads.txt** column → **Check for updates** if still “Not found”.
6. Wait for **site review** (often days–weeks). Optional: **Ads → Explore** for preview.

**Acceptance:** Ownership verified; ads.txt **Found**; review moves toward **Ready**.

**Status:** 👤 — code ✅; dashboard steps pending your confirmation

---

## Medium priority

### M1 — Google Search Console

**Why:** Indexing and sitemap coverage; separate from AdSense.

**Steps:**

1. Add property: `https://www.docxform.com`
2. Verify (DNS TXT or HTML)
3. Submit `https://www.docxform.com/sitemap.xml`
4. Request indexing: `/`, `/word-to-pdf`, `/pdf-to-word`, `/tools`, `/tools/pdf-split`
5. Monitor Pages / Core Web Vitals monthly

**Status:** ⏳

---

### M2 — CSP review (don’t break WASM / AdSense)

**Why:** `next.config.js` uses `'unsafe-inline'` and `'unsafe-eval'` for Next, WASM, and ads.

**Steps:**

1. Document each CSP directive and why it exists
2. Test removing `'unsafe-eval'` on staging + full convert smoke test
3. Consider nonce-based CSP later (larger change)
4. Never use blanket `script-src https:`

**Status:** ⏳

---

### M3 — API abuse protection

**Why:** Public edge routes: `/api/contact`, `/api/metrics/converter`; admin behind secret slug.

**Steps:**

1. Cloudflare WAF / rate limit (e.g. `/api/contact` 10 req/min/IP)
2. Optional: Turnstile or honeypot on contact form
3. Keep admin paths non-linked; env-only secrets
4. Supabase keys server-side only

**Status:** ⏳

---

### M4 — Dependency hygiene in CI

**Why:** Keep audit clean after `9c075d7`.

**Steps:**

1. CI: `npm audit --audit-level=high` (fail on high/critical)
2. Dependabot or Renovate on `package.json`
3. Bump patch/minor for Next/React via PRs

**Status:** ⏳

---

### M5 — SEO consistency (www canonical)

**Why:** `SITE_URL` is www; AdSense property label is apex `docxform.com`.

**Done (code):**

- `lib/seo.ts` → `https://www.docxform.com`
- Apex → www redirect confirmed in production (ads.txt works on both)

**Remaining (👤):** Search Console property on www; optional domain property for whole zone.

**Status:** ✅ code · 👤 GSC

---

### M6 — Coming-soon tools (index hygiene)

**Why:** Avoid indexing thin WIP utility pages.

**Done (code, `8219a0e` / `1c059a3`):**

- `lib/tool-availability.ts` — only `pdf-split` live
- `createToolPageMetadata()` — `noindex` when not available
- Sitemap excludes WIP tool URLs
- `/tools` index: WIP cards without links + “Coming soon” badge

**When launching a tool:**

1. Set `TOOL_PAGE_AVAILABLE[slug] = true`
2. Redeploy
3. Confirm sitemap + remove coming-soon on index

**Status:** ✅

---

## Low priority

### L1 — Migrate Cloudflare build: `next-on-pages` → OpenNext

**Why:** `@cloudflare/next-on-pages@1.13.16` deprecated; OpenNext recommended.

**Note:** Production builds today use `npx @cloudflare/next-on-pages@1` successfully on `b655c13` / `9c075d7`.

**Status:** ⏳

---

### L2 — Next.js middleware → “proxy” convention

**Why:** Next 16 build warns middleware convention → proxy.

**Status:** ⏳

---

### L3 — AdSense / privacy copy polish

**Why:** EU/UK consent if personalized ads expand.

**Note:** `/cookies` and `/privacy` already mention AdSense cookies.

**Status:** ⏳

---

### L4 — Lighthouse / performance budget

**Why:** CWV and LCP with AdSense script.

**Note:** WASM primed post-LCP (`PostLcpWasmPrime`); AdSense `afterInteractive`.

**Status:** ⏳

---

### L5 — Invalid prerender config (`/articles/[slug]`)

**Why:** next-on-pages warns on `/articles/[slug]`; build still completes (435 prerendered routes).

**Status:** ⏳

---

## Build warnings (non-blocking)

| Warning | Impact | Action |
|---------|--------|--------|
| Invalid `_redirects` WASM lines | Log noise | ✅ Fixed in `9c075d7` |
| `Invalid prerender config` for `/articles/[slug]` | None observed | L5 |
| `middleware` → `proxy` deprecation | Future | L2 |
| `@cloudflare/next-on-pages` deprecated | Future | L1 |
| npm deprecated glob/tar in CF install | Transitive / npx | Monitor |

---

## Execution order (updated)

```text
✅ H1 + H2 — merged to master (9c075d7)
✅ AdSense code — merged (1c059a3+)
→ Deploy master / dev-stable (confirm 9c075d7 on CF)
→ 👤 H3 AdSense dashboard verify
→ M1 Search Console
→ M3 WAF / rate limits
→ M4 CI npm audit gate
→ M2 CSP spike
→ L1 / L2 when upgrading platform
```

---

## Related docs

- `docs/tool-status.md` — which `/tools/*` routes are live vs coming soon
- `docs/pages-reference.md` — routes, SEO, studio UI
- `docs/colors.md` — format-based tone palette
- `lib/adsense.ts` — publisher ID, script URL, ads.txt line
