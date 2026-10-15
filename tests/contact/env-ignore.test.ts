import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

/** `git check-ignore -q` exits 0 when the path is ignored, 1 when it is not. */
function isIgnored(path: string) {
  const res = spawnSync('git', ['check-ignore', '-q', '--no-index', path], { encoding: 'utf8' });
  expect(res.error, 'git must be available').toBeUndefined();
  return res.status === 0;
}

describe('.gitignore protects contact secrets', () => {
  it('ignores .env and .env.local', () => {
    expect(isIgnored('.env')).toBe(true);
    expect(isIgnored('.env.local')).toBe(true);
    expect(isIgnored('.env.production.local')).toBe(true);
  });

  it('keeps .env.example tracked', () => {
    expect(isIgnored('.env.example')).toBe(false);
  });
});
