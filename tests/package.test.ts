import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  engines: Record<string, string>;
  scripts: Record<string, string>;
};

describe('package.json', () => {
  it('pins the Node major the build and the types target', () => {
    expect(pkg.engines.node).toBe('22.x');
  });

  it('runs only the functional e2e projects by default', () => {
    const run = pkg.scripts['test:e2e'];
    expect(run).toContain('playwright test');
    expect(run).toContain('--project=chromium');
    expect(run).toContain('--project=mobile');
    // The perf budgets need a quiet machine: they are opt-in (`npm run test:perf`).
    expect(run).not.toContain('perf');
  });

  it('runs the perf project alone, without the functional projects it depends on', () => {
    const run = pkg.scripts['test:perf'];
    expect(run).toContain('--project=perf');
    expect(run).toContain('--no-deps');
  });
});
