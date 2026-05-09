/**
 * DocXform verification: static checks for converter/WASM/eligibility setup + optional HTTP probes.
 *
 * Usage:
 *   node scripts/verify-all.mjs
 *   node scripts/verify-all.mjs --fetch=http://localhost:3000   # requires `npm run dev` (or deployed URL)
 *   node scripts/verify-all.mjs --full                         # also runs eslint + wasm:diagnose (diagnose needs dev for localhost)
 *
 * Exit code 1 if any check fails.
 *
 * For real browser timing (cold cache, warm repeat, WASM settle), run:
 *   npm run test:perf
 *   npx playwright test e2e/performance-load.spec.ts --reporter=html
 *
 * WASM URL + Cache-Control checks: npm run test:e2e:site-quality
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

function read(rel) {
  const p = join(repoRoot, rel);
  return readFileSync(p, 'utf8');
}

function must(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    process.exitCode = 1;
    return false;
  }
  console.log(`OK:   ${msg}`);
  return true;
}

function argOrigin() {
  const a = process.argv.find((x) => x.startsWith('--fetch='));
  if (!a) return null;
  return a.slice('--fetch='.length).replace(/\/$/, '');
}

function argFull() {
  return process.argv.includes('--full');
}

const checks = [];

const middleware = read('middleware.ts');
checks.push(() => must(middleware.includes('versionedWasm'), 'middleware.ts defines versioned WASM path matching'));
checks.push(() =>
  must(middleware.includes('/wasm/bin/') && middleware.includes('soffice.wasm'), 'middleware rewrites /wasm/bin/.../soffice.wasm')
);
checks.push(() =>
  must(middleware.includes("pathname === '/wasm/soffice.wasm'"), 'middleware keeps legacy /wasm/soffice.wasm rewrite')
);

const nextConfig = read('next.config.js');
checks.push(() =>
  must(
    nextConfig.includes('/wasm/bin/:revision/soffice.wasm') && nextConfig.includes('immutable'),
    'next.config.js sets immutable cache for versioned soffice.wasm'
  )
);
checks.push(() =>
  must(
    nextConfig.includes('/wasm/bin/:revision/soffice.data') && nextConfig.includes('31536000'),
    'next.config.js sets long cache for versioned soffice.data'
  )
);

const clientConv = read('lib/client-document-converter.ts');
checks.push(() => must(!clientConv.includes('dev-converter-flags'), 'client-document-converter has no dev-converter-flags import'));
checks.push(() =>
  must(
    clientConv.includes('getVersionedWasmBinPathPrefix') || clientConv.includes("from '@/lib/wasm-revision'"),
    'client-document-converter uses wasm-revision for versioned paths'
  )
);
checks.push(() => must(clientConv.includes('getConverterEligibility'), 'client-document-converter integrates eligibility (warm gate)'));

const docConv = read('components/document-converter.tsx');
checks.push(() => must(!docConv.includes('dev-converter-flags'), 'document-converter has no dev-converter-flags'));
checks.push(() => must(!docConv.includes('showDevConverterLoadOverlay'), 'document-converter has no dev overlay flag'));
checks.push(() =>
  must(docConv.includes('getConverterEligibility') && docConv.includes("document.readyState === 'complete'"), 'document-converter uses load + eligibility warm path')
);

const perf = read('lib/perf-profile.ts');
checks.push(() => must(perf.includes('invalidatePerfProfileCache'), 'perf-profile exports invalidatePerfProfileCache'));
checks.push(() => must(perf.includes('connectionDownlinkMbps') || perf.includes('downlink'), 'perf-profile considers connection downlink'));

const elig = read('lib/converter-eligibility.ts');
checks.push(() => must(elig.includes('CONVERTER_READINESS_BUDGET_SEC'), 'converter-eligibility defines readiness budget'));
checks.push(() => must(elig.includes('measureProbeMbps'), 'converter-eligibility includes throughput probe'));
checks.push(() => must(elig.includes('subscribeConnectionEligibilityInvalidation'), 'converter-eligibility subscribes to connection changes'));

const wasmRev = read('lib/wasm-revision.ts');
checks.push(() => must(wasmRev.includes('getWasmAssetRevision') && wasmRev.includes('getVersionedWasmBinPathPrefix'), 'wasm-revision exports revision helpers'));

checks.push(() => must(!existsSync(join(repoRoot, 'lib/dev-converter-flags.ts')), 'lib/dev-converter-flags.ts removed'));

const envExample = read('.env.example');
checks.push(() => must(!envExample.includes('DEV_CONVERTER'), '.env.example has no dev converter env'));

for (const c of checks) c();

async function fetchChecks(origin) {
  const rev =
    (typeof process.env.NEXT_PUBLIC_WASM_ASSET_REVISION === 'string' && process.env.NEXT_PUBLIC_WASM_ASSET_REVISION.trim()) ||
    '2026-05-06';
  const base = `${origin}/wasm/bin/${rev}/`;
  const urls = [
    { name: 'versioned soffice.wasm', url: new URL('soffice.wasm', base).href },
    { name: 'versioned soffice.data', url: new URL('soffice.data', base).href },
    { name: 'soffice.js (same-origin /wasm/)', url: `${origin}/wasm/soffice.js` },
  ];
  for (const { name, url } of urls) {
    try {
      const isBinary = url.endsWith('.wasm') || url.endsWith('.data');
      const r = await fetch(url, {
        method: 'GET',
        headers: isBinary ? { Range: 'bytes=0-0' } : undefined,
        signal: AbortSignal.timeout(45_000),
      });
      const ok = r.ok && (isBinary ? r.status === 200 || r.status === 206 : r.status === 200);
      must(ok, `HTTP ${name} (${url}) → ${r.status}`);
    } catch (e) {
      must(false, `fetch ${name}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}

const origin = argOrigin();
if (origin) {
  console.log(`\n--fetch=${origin} (HTTP probes)\n`);
  await fetchChecks(origin);
} else {
  console.log('\nSkip HTTP probes (pass --fetch=http://localhost:3000 with dev server running).\n');
}

function runTypecheck() {
  console.log('\n→ tsc --noEmit (TypeScript)\n');
  const tsc = join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  if (!existsSync(tsc)) {
    must(false, 'typescript not found at node_modules/typescript/bin/tsc (run npm install)');
    return;
  }
  const r = spawnSync(process.execPath, [tsc, '--noEmit'], { cwd: repoRoot, stdio: 'inherit' });
  const status = r.status === null ? 1 : r.status;
  must(status === 0, `TypeScript (tsc --noEmit) exited ${String(r.status)}`);
}

function runLint() {
  console.log('\n→ eslint . (ESLint)\n');
  const eslint = join(repoRoot, 'node_modules', 'eslint', 'bin', 'eslint.js');
  if (!existsSync(eslint)) {
    must(false, 'eslint not found (run npm install)');
    return;
  }
  const r = spawnSync(process.execPath, [eslint, '.'], { cwd: repoRoot, stdio: 'inherit' });
  const status = r.status === null ? 1 : r.status;
  must(status === 0, `ESLint exited ${String(r.status)}`);
}

function runWasmDiagnose() {
  console.log('\n→ node scripts/diagnose-wasm-assets.mjs\n');
  const script = join(repoRoot, 'scripts', 'diagnose-wasm-assets.mjs');
  const r = spawnSync(process.execPath, [script], { cwd: repoRoot, stdio: 'inherit' });
  const status = r.status === null ? 1 : r.status;
  must(status === 0, `wasm:diagnose exited ${String(r.status)}`);
}

runTypecheck();

if (argFull()) {
  runLint();
  runWasmDiagnose();
}

if (process.exitCode === 1) {
  console.error('\nverify-all: one or more checks failed.\n');
  process.exit(1);
}

console.log('\nverify-all: all checks passed.\n');
