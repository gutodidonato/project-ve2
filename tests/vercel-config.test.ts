import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const path = new URL('../vercel.json', import.meta.url);

describe('vercel.json', () => {
  // The Vercel projects linked to this repo were created for the old Vite
  // site, so their saved Framework Preset is "Vite" (output `dist`). Pinning
  // the framework here overrides that preset on every linked project.
  it('pins the Next.js framework preset', () => {
    expect(existsSync(path)).toBe(true);
    const config = JSON.parse(readFileSync(path, 'utf8')) as { framework?: string; outputDirectory?: string };
    expect(config.framework).toBe('nextjs');
    expect(config.outputDirectory).toBeUndefined();
  });
});
