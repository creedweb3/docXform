#!/usr/bin/env node
/**
 * Optional: call Gemini Flash for mobile UI critique/suggestions.
 * Requires GEMINI_API_KEY. Output: docs/mobile-ui-gemini-flash-output.md
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error('Set GEMINI_API_KEY (or GOOGLE_API_KEY) to run this script.');
  process.exit(1);
}

const brief = `You are a senior mobile UX designer (Material Design 3 / Gemini app patterns).

Product: docXform — browser-local PDF tools. Brand: soft pastel washes (rose for PDF), glass cards, Inter font, rounded-2xl/3xl radii.

Constraints (strict):
- Suggestions ONLY for viewports under 768px.
- Do NOT change tablet or desktop layouts.
- Keep existing tone system (rose/blue/purple/orange).
- Privacy-first: no upload messaging stays visible.

Current mobile PDF Split patterns:
- Preview column min ~58vh; 2-column range grid with portrait thumbs.
- Settings + Split CTA in right slide-in rail (gear FAB).
- Segmented tabs: Range | Pages | Size.

Deliver:
1. Five bullet "quick wins" for visual polish (spacing, hierarchy, touch targets).
2. One ASCII wireframe for ideal phone layout (preview + rail).
3. Tailwind-oriented class ideas (max-md: only) for: preview header, range cards, settings rail FAB, rail CTA bar.
Keep under 600 words.`;

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: brief }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
  }),
});

if (!res.ok) {
  console.error(await res.text());
  process.exit(1);
}

const json = await res.json();
const text =
  json.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? 'No response from model.';

const outPath = join(root, 'docs', 'mobile-ui-gemini-flash-output.md');
writeFileSync(
  outPath,
  `# Gemini Flash mobile UI brief\n\n_Generated ${new Date().toISOString()}_\n\n${text}\n`,
  'utf8'
);
console.log(`Wrote ${outPath}`);
