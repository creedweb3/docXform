/**
 * Per-clone Git hygiene (run from postinstall):
 * - Ignore Next dev rewrites of next-env.d.ts in status (skip-worktree)
 * - Reset next-env.d.ts import to the committed production path when dev flipped it
 * - Refresh index stat cache (reduces false "modified" on Windows)
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
    execSync(`git ${args}`, { cwd: root, encoding: 'utf8', stdio: 'pipe' });
    return true;
  } catch {
    if (!allowFail) return false;
    return false;
  }
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

if (!git('update-index --skip-worktree next-env.d.ts', { allowFail: true })) {
  process.exit(0);
}

git('update-index --refresh', { allowFail: true });
console.log('[git-local-setup] skip-worktree next-env.d.ts, index refreshed');
