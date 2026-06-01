#!/usr/bin/env node
/**
 * docXform design judge — hackathon-style rubric scanner.
 * Run: npm run design:judge (marketing shell)
 *      npm run design:judge:all (entire components + app)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const THRESHOLD = 7.5;
const SCOPE = process.argv.includes('--all') ? 'all' : 'marketing';

const MARKETING_PATHS = [
  'components/site',
  'components/faq-details-card.tsx',
  'components/articles-showcase.tsx',
  'components/tools/tools-index-client.tsx',
  'lib/site-design.ts',
  'app/page.tsx',
  'app/tools/page.tsx',
  'app/about',
  'app/faq',
  'app/articles',
  'app/contact',
  'app/word-to-pdf',
  'app/pdf-to-word',
  'docs/DESIGN.md',
];

const SLop_RULES = [
  { id: 'gradient-cta', pattern: /bg-gradient-to-br.*primaryButton|btn-shine|variant="gradient"/g, weight: 1.2, label: 'Gradient CTAs' },
  { id: 'gradient-text', pattern: /bg-clip-text|gradient-text-blue|gradient-text-rose/g, weight: 1.0, label: 'Gradient text' },
  { id: 'glass-subtle', pattern: /glass-subtle/g, weight: 0.8, label: 'Glass-subtle surfaces' },
  { id: 'white-surfaces', pattern: /bg-white\/\d+/g, weight: 1.0, label: 'Light white overlays on dark' },
  { id: 'side-stripe', pattern: /border-l-\[3px\]|border-l-(blue|rose|emerald)-500/g, weight: 1.1, label: 'Side-stripe accents' },
  { id: 'violet-accent', pattern: /text-violet-[34]00|from-violet|to-violet/g, weight: 0.6, label: 'Violet marketing accents' },
  { id: 'pastel-icon', pattern: /from-(cyan|indigo|violet|purple|orange)-50/g, weight: 1.0, label: 'Pastel icon-box (light theme)' },
];

const POSITIVE_RULES = [
  { id: 'editorial-font', pattern: /Newsreader|Source_Sans_3/g, weight: 0.5, label: 'Editorial font stack' },
  { id: 'site-design', pattern: /site-design|WORKSPACE_PRIMARY_CTA|FILTER_PILL_|CATALOG_ROW|STICKY_BAR/g, weight: 0.3, label: 'Shared design tokens' },
  { id: 'eyebrow', pattern: /Eyebrow|tracking-\[0\.18em\]/g, weight: 0.2, label: 'Editorial eyebrows' },
  { id: 'catalog-list', pattern: /ToolListRow|ToolCatalogList|divide-y divide-border/g, weight: 0.25, label: 'Tools catalog list UX' },
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === '.next') continue;
      if (SCOPE === 'marketing' && name.startsWith('admin')) continue;
      walk(p, files);
    } else if (/\.(tsx?|css|md)$/.test(name)) {
      files.push(p);
    }
  }
  return files;
}

function inMarketingScope(rel) {
  if (SCOPE === 'all') return true;
  return MARKETING_PATHS.some((prefix) => rel === prefix || rel.startsWith(prefix.replace(/\\/g, '/')));
}

function collectFiles() {
  const files = new Set();
  const roots = SCOPE === 'all' ? ['components', 'app', 'lib/site-design.ts'] : MARKETING_PATHS;
  for (const rel of roots) {
    const p = path.join(ROOT, rel);
    if (!fs.existsSync(p)) continue;
    if (fs.statSync(p).isDirectory()) walk(p).forEach((f) => files.add(f));
    else files.add(p);
  }
  if (SCOPE === 'marketing') {
    const globals = path.join(ROOT, 'app/globals.css');
    if (fs.existsSync(globals)) files.add(globals);
  }
  return [...files].filter((f) => inMarketingScope(path.relative(ROOT, f).replace(/\\/g, '/')));
}

function main() {
  const files = collectFiles();
  let totalSlop = 0;
  let totalPositive = 0;
  const report = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    let slop = 0;
    let positive = 0;
    const hits = [];

    for (const rule of SLop_RULES) {
      const m = content.match(rule.pattern);
      if (m?.length) {
        slop += m.length * rule.weight;
        hits.push({ rule: rule.label, count: m.length });
      }
    }
    for (const rule of POSITIVE_RULES) {
      const m = content.match(rule.pattern);
      if (m?.length) positive += m.length * rule.weight;
    }

    if (slop > 0 || positive > 0) report.push({ rel, slop, positive, hits });
    totalSlop += slop;
    totalPositive += positive;
  }

  const baseScore = 10;
  const penalty = Math.min(4, totalSlop * 0.06);
  const bonus = Math.min(2, totalPositive * 0.04);
  const score = Math.max(0, Math.min(10, baseScore - penalty + bonus));

  const verdict =
    score >= 8
      ? 'Demo-ready — minor polish only'
      : score >= THRESHOLD
        ? 'Strong — ship marketing shell; iterate workspace separately'
        : score >= 6
          ? 'Not hackathon-winning — fix blockers below'
          : 'Rebuild — too much template UI';

  console.log('\n=== docXform Design Judge ===');
  console.log(`Scope: ${SCOPE}`);
  console.log(`Files scanned: ${files.length}`);
  console.log(`Score: ${score.toFixed(1)} / 10`);
  console.log(`Verdict: ${verdict}`);
  console.log(`Threshold: ${THRESHOLD}\n`);

  const topSlop = report.filter((r) => r.slop > 0).sort((a, b) => b.slop - a.slop).slice(0, 10);
  if (topSlop.length) {
    console.log('Top slop sources:');
    for (const r of topSlop) {
      const labels = [...new Set(r.hits.map((h) => h.rule))].join(', ');
      console.log(`  ${r.rel} (${r.slop.toFixed(1)}): ${labels}`);
    }
  }

  console.log('\nRe-run: npm run design:judge  (marketing) | npm run design:judge:all\n');
  process.exit(score >= THRESHOLD ? 0 : 1);
}

main();
