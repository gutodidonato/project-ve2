import { afterEach, describe, expect, it, vi } from 'vitest';

const DEFAULT_URL = 'https://project-ve2-dtbe.vercel.app';

/** A fresh `lib/site` evaluated against `NEXT_PUBLIC_SITE_URL` (`undefined` unsets it). */
async function siteUrlFor(value: string | undefined): Promise<string> {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', value);
  return (await import('@/lib/site')).SITE_URL;
}

describe('SITE_URL', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('is the default deployment when the variable is not set', async () => {
    expect(await siteUrlFor(undefined)).toBe(DEFAULT_URL);
  });

  it('falls back to the default when the variable is empty or only whitespace', async () => {
    // An empty `NEXT_PUBLIC_SITE_URL=` line (as in .env.example) must not become `new URL('')`.
    expect(await siteUrlFor('')).toBe(DEFAULT_URL);
    expect(await siteUrlFor('   ')).toBe(DEFAULT_URL);
    expect(await siteUrlFor('\t\n')).toBe(DEFAULT_URL);
  });

  it('uses the configured origin as is', async () => {
    expect(await siteUrlFor('https://luisdidonato.dev')).toBe('https://luisdidonato.dev');
  });

  it('trims surrounding whitespace', async () => {
    expect(await siteUrlFor('  https://luisdidonato.dev  ')).toBe('https://luisdidonato.dev');
  });

  it('drops trailing slashes, so `${SITE_URL}/pt` never has a double slash', async () => {
    expect(await siteUrlFor('https://luisdidonato.dev/')).toBe('https://luisdidonato.dev');
    expect(await siteUrlFor('https://luisdidonato.dev///')).toBe('https://luisdidonato.dev');
    expect(await siteUrlFor(' https://luisdidonato.dev/ ')).toBe('https://luisdidonato.dev');
  });

  it('falls back to the default when nothing is left after trimming slashes', async () => {
    expect(await siteUrlFor('/')).toBe(DEFAULT_URL);
  });

  it('builds valid absolute URLs for whatever was configured', async () => {
    const site = await siteUrlFor('https://luisdidonato.dev/');
    expect(new URL(site).origin).toBe('https://luisdidonato.dev');
    expect(`${site}/pt`).toBe('https://luisdidonato.dev/pt');
  });
});
