# Security, deploy, and ops plan

Living checklist for docxform.com (Cloudflare Pages, Next.js 16, AdSense).  
**Last reviewed:** 2026-05-20.

---

## Status legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Done |
| 🔄 | In progress |
| ⏳ | Planned |
| 👤 | Manual (dashboard / no code) |

---

## High priority

### H1 — Patch Next.js and npm audit (supply chain)

**Why:** `npm audit` reported **high** issues on Next 16.0.0–16.2.5 (middleware bypass, CSP/XSS, DoS). Patched in **16.2.6+**.

**Steps:**

1. `npm install next@16.2.6` (align `@next/bundle-analyzer` if present).
2. `npm audit fix` (addresses transitive e.g. `brace-expansion`).
3. `npm run build` and `npm run typecheck` locally.
4. Deploy via normal branch flow (`dev-tools` → `dev-stable` → `master` or Pages preview).
5. Re-run `npm audit` — target **0 high** on production dependencies.

**Acceptance:** Clean audit for app deps; production build green on Cloudflare.

**Status:** ✅ (2026-05-20: `next@16.2.6`, `npm audit` clean, build OK)

---

### H2 — Remove invalid Cloudflare `_redirects` WASM proxy lines

**Why:** Deploy log showed:

```text
Proxy (200) redirects can only point to relative paths.
```

Those two lines are **ignored** by Cloudflare. WASM is already proxied in `middleware.ts` → `wasm.docxform.com`.

**Steps:**

1. Remove `/wasm/soffice.wasm` and `/wasm/soffice.data` external `200` rules from `public/_redirects`.
2. Delete `public/_redirects` if empty, or leave a one-line comment file only if your host supports it (CF Pages: prefer delete).
3. Confirm converter still loads WASM after deploy (versioned `/wasm/bin/<rev>/` and legacy `/wasm/soffice.*`).

**Acceptance:** Next deploy shows **0 invalid redirect lines**; PDF/Word conversion works.

**Status:** ✅ (2026-05-20: `public/_redirects` removed; WASM via `middleware.ts` only)

---

### H3 — AdSense verification on production (post-deploy)

**Why:** Dashboard showed “Requires review”, ads.txt “Not found” before latest deploy. Code includes meta tag, script, `public/ads.txt`.

**Steps (manual — 👤):**

1. Confirm deploy includes commit with `lib/adsense.ts` + layout `Script` (≥ `1c059a3`, ideally `b655c13+`).
2. In browser:
   - https://docxform.com/ads.txt → should show `google.com, pub-7154775313079570, DIRECT, …`
   - https://www.docxform.com/ → view source → `google-adsense-account` and `adsbygoogle.js`
3. AdSense → **Sites** → add/verify property **`docxform.com`** only (not `www` in the add-site field).
4. **Let’s go** → verify via **Meta tag** (or ads.txt) → **I’ve placed the code**.
5. **ads.txt** row → **Check for updates**.
6. Wait for **site review** (days–weeks). Optional: **Ads → Explore** for auto-ad preview.

**Acceptance:** Green check on site ownership; ads.txt status **Found**; review eventually **Ready**.

**Status:** 👤 (after each production deploy)

---

## Medium priority

### M1 — Google Search Console

**Why:** Indexing and sitemap coverage independent of AdSense.

**Steps:**

1. Add property: `https://www.docxform.com` (URL prefix or domain).
2. Verify via DNS TXT or HTML (meta already on site if using HTML method on root).
3. Submit sitemap: `https://www.docxform.com/sitemap.xml`.
4. Request indexing for: `/`, `/word-to-pdf`, `/pdf-to-word`, `/tools`, `/tools/pdf-split`.
5. Monitor **Pages** and **Core Web Vitals** monthly.

**Acceptance:** Sitemap processed; flagship URLs indexed.

**Status:** ⏳

---

### M2 — CSP review (don’t break WASM / AdSense)

**Why:** CSP includes `'unsafe-inline'` and `'unsafe-eval'` for Next, WASM, and ads. Tightening improves security but can break converters.

**Steps:**

1. Document current CSP in `next.config.js` and why each directive exists.
2. Test removing `'unsafe-eval'` on staging — run full Word/PDF convert smoke test.
3. If AdSense uses inline scripts, evaluate **nonce-based** CSP (Next 16 supports; larger refactor).
4. Avoid `script-src *` or broad `https:` on scripts.

**Acceptance:** Documented tradeoffs; any CSP change passes e2e + manual convert test.

**Status:** ⏳

---

### M3 — API abuse protection

**Why:** Edge routes: `/api/contact`, `/api/metrics/converter`, admin APIs. Public contact form is spam-prone.

**Steps:**

1. Cloudflare **WAF** / rate limiting rules per path (e.g. 10 req/min/IP on `/api/contact`).
2. Optional: honeypot or Turnstile on contact form (code change).
3. Ensure admin routes stay non-enumerable (`ADMIN_ENTRY_SLUG`, no links from public site).
4. Review Supabase RLS / keys only in env (never client).

**Acceptance:** Rate limits active; no spike in spam or metrics noise.

**Status:** ⏳

---

### M4 — Dependency hygiene in CI

**Why:** Prevent drift and repeat audit surprises.

**Steps:**

1. Add CI step: `npm audit --audit-level=high` (fail on high/critical).
2. Enable **Dependabot** or Renovate on `package.json` (weekly, grouped).
3. Pin major versions; allow patch/minor auto-PRs for Next/React.

**Acceptance:** PRs fail on new high vulnerabilities; weekly update PRs optional.

**Status:** ⏳

---

### M5 — SEO consistency (www canonical)

**Why:** Canonical is `https://www.docxform.com`; AdSense property is `docxform.com`.

**Steps:**

1. Confirm Cloudflare **apex → www** 301 (already expected).
2. Search Console: prefer **www** property; optional domain property for whole zone.
3. Keep `SITE_URL` in `lib/seo.ts` as www — no change unless rebranding.

**Acceptance:** No duplicate indexing of apex vs www; canonicals all www.

**Status:** ✅ (code); 👤 (GSC)

---

### M6 — Coming-soon tools (index hygiene)

**Why:** WIP tool pages use `noindex`; sitemap lists only live tools (`pdf-split`). Already implemented in `1c059a3+`.

**Steps:**

1. When enabling a tool, set `TOOL_PAGE_AVAILABLE[slug] = true` in `lib/tool-availability.ts`.
2. Redeploy; confirm sitemap includes new slug.
3. Remove “Coming soon” from index card when live.

**Acceptance:** Only finished tools indexed and in sitemap.

**Status:** ✅ (process)

---

## Low priority

### L1 — Migrate Cloudflare build: `next-on-pages` → OpenNext

**Why:** `@cloudflare/next-on-pages@1.13.16` is deprecated; OpenNext is the supported path for Next on Cloudflare.

**Steps:**

1. Read https://opennext.js.org/cloudflare
2. Spike branch: replace build command, compare worker size and cold start.
3. Re-test middleware, edge API routes, static assets, WASM proxy.
4. Switch production build when parity confirmed.

**Effort:** Multi-day; schedule outside feature work.

**Status:** ⏳

---

### L2 — Next.js middleware → “proxy” convention

**Why:** Next 16 warns: middleware file convention deprecated in favor of `proxy`.

**Steps:**

1. Follow Next upgrade guide when `proxy` API is stable for your version.
2. Rename/migrate `middleware.ts` per official docs.
3. Full regression: COEP headers, WASM rewrites, admin rewrites.

**Status:** ⏳ (track Next release notes)

---

### L3 — AdSense / privacy copy polish

**Why:** GDPR/consent expectations when serving personalized ads in EU/UK.

**Steps:**

1. Review `/cookies` and `/privacy` for AdSense, DoubleClick, Funding Choices.
2. Optional: CMP / consent banner if traffic is EU-heavy (not required for US-only launch).
3. Link policies in footer on all layouts.

**Status:** ⏳ (content/legal review)

---

### L4 — Lighthouse / performance budget

**Why:** Core Web Vitals affect SEO and AdSense quality signals indirectly.

**Steps:**

1. Run existing `npm run test:lighthouse` on home + converters post-deploy.
2. Track LCP on pages with AdSense script (`afterInteractive`).
3. Keep WASM load deferred (post-LCP prime) — already partially done.

**Status:** ⏳

---

### L5 — Invalid prerender config (`/articles/[slug]`)

**Why:** next-on-pages warns on `[slug]` prerender config; static output still works.

**Steps:**

1. Audit `app/articles/[slug]/page.tsx` vs static article routes.
2. Either align `generateStaticParams` with `SITE_ARTICLES` or remove duplicate dynamic route if redundant.
3. Rebuild and confirm warning gone.

**Status:** ⏳

---

## Execution order (recommended)

```text
H1 + H2 (code) → deploy → H3 (manual AdSense)
     → M1 (GSC) → M3 (WAF) → M4 (CI audit)
     → M2 (CSP spike) → L1/L2 when platform allows
```

---

## Related docs

- `docs/tool-status.md` — which tools are live
- `docs/pages-reference.md` — routes and SEO surfaces
- `lib/adsense.ts` — publisher ID and script URL
