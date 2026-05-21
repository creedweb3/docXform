/**
 * Per-clone Git hygiene (run from postinstall or `npm run git:local-setup`):
 * - Ignore Next dev rewrites of next-env.d.ts (skip-worktree)
 * - Reset next-env.d.ts import when dev flipped it to .next/dev/types
 * - Clear phantom "modified" files on Windows (empty diff, stale index stat / CRLF)
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const gitDir = join(root, '.git');
const nextEnvPath = join(root, 'next-env.d.ts');
const COMMITTED_IMPORT = './.next/types/routes.d.ts';
const DEV_IMPORT = './.next/dev/types/routes.d.ts';

function git(args, { allowFail = false } = {}) {
  try {
    return execSync(`git ${args}`, { cwd: root, encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch {
    if (!allowFail) return null;
    return null;
  }
}

function hasDiff(path) {
  try {
    execSync(`git diff --quiet -- "${path}"`, { cwd: root, stdio: 'pipe' });
    execSync(`git diff --cached --quiet -- "${path}"`, { cwd: root, stdio: 'pipe' });
    return false;
  } catch {
    return true;
  }
}

/** Paths reported as modified in the working tree (not staged). */
function unstagedModifiedPaths() {
  const out = git('status --porcelain', { allowFail: true });
  if (!out) return [];
  return out
    .split(/\r?\n/)
    .filter((line) => line.length > 2 && line[1] === 'M')
    .map((line) => line.slice(3).trim())
    .filter((p) => p.length > 0);
}

function clearPhantomModifications() {
  const fixed = [];
  for (const path of unstagedModifiedPaths()) {
    if (path === 'next-env.d.ts') continue;
    if (hasDiff(path)) continue;
    git(`add --renormalize -- "${path}"`, { allowFail: true });
    git(`reset HEAD -- "${path}"`, { allowFail: true });
    fixed.push(path);
  }
  return fixed;
}

if (!existsSync(gitDir)) {
  process.exit(0);
}

if (existsSync(nextEnvPath)) {
  const content = readFileSync(nextEnvPath, 'utf8');
  if (content.includes(DEV_IMPORT)) {
    writeFileSync(
      nextEnvPath,
      content.replace(DEV_IMPORT, COMMITTED_IMPORT),
      'utf8'
    );
  }
}

git('update-index --skip-worktree next-env.d.ts', { allowFail: true });
git('update-index --refresh', { allowFail: true });

const phantom = clearPhantomModifications();
const parts = ['skip-worktree next-env.d.ts'];
if (phantom.length > 0) {
  parts.push(`cleared phantom modify: ${phantom.join(', ')}`);
}
console.log(`[git-local-setup] ${parts.join('; ')}`);
