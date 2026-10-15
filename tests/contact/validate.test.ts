import { describe, expect, it } from 'vitest';
import { contactSchema, createRateLimiter } from '@/lib/contact';

const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'Hello, I would like to talk about a project.',
};

function failedPaths(input: unknown): string[] {
  const result = contactSchema.safeParse(input);
  if (result.success) return [];
  return result.error.issues.map((i) => String(i.path[0]));
}

describe('contactSchema', () => {
  it('accepts valid input', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts an empty or missing honeypot', () => {
    expect(contactSchema.safeParse({ ...valid, website: '' }).success).toBe(true);
    expect(contactSchema.safeParse({ ...valid, website: undefined }).success).toBe(true);
  });

  it('rejects a name shorter than 2 characters', () => {
    expect(failedPaths({ ...valid, name: 'A' })).toEqual(['name']);
  });

  it('rejects a name longer than 80 characters', () => {
    expect(failedPaths({ ...valid, name: 'a'.repeat(81) })).toEqual(['name']);
    expect(contactSchema.safeParse({ ...valid, name: 'a'.repeat(80) }).success).toBe(true);
  });

  it('rejects a message longer than 2000 characters', () => {
    expect(failedPaths({ ...valid, message: 'm'.repeat(2001) })).toEqual(['message']);
    expect(contactSchema.safeParse({ ...valid, message: 'm'.repeat(2000) }).success).toBe(true);
  });

  it('rejects a message shorter than 10 characters', () => {
    expect(failedPaths({ ...valid, message: 'too short' })).toEqual(['message']);
  });

  it('rejects a malformed email', () => {
    expect(failedPaths({ ...valid, email: 'x' })).toEqual(['email']);
  });

  it('rejects an email longer than 120 characters', () => {
    const long = `${'a'.repeat(110)}@example.com`;
    expect(failedPaths({ ...valid, email: long })).toEqual(['email']);
  });

  it('trims whitespace before measuring', () => {
    expect(failedPaths({ ...valid, name: '  A  ' })).toEqual(['name']);
    expect(failedPaths({ ...valid, message: `   ${'x'.repeat(5)}     ` })).toEqual(['message']);
  });

  it('reports every missing field for an empty object', () => {
    expect(new Set(failedPaths({}))).toEqual(new Set(['name', 'email', 'message']));
  });
});

describe('createRateLimiter', () => {
  it('allows `limit` calls, denies the next, and allows again after the window', () => {
    let t = 1_000;
    const allow = createRateLimiter({ limit: 5, windowMs: 10 * 60_000, now: () => t });

    for (let i = 0; i < 5; i++) expect(allow('1.2.3.4')).toBe(true);
    expect(allow('1.2.3.4')).toBe(false);

    t += 10 * 60_000 - 1;
    expect(allow('1.2.3.4')).toBe(false);

    t += 1;
    expect(allow('1.2.3.4')).toBe(true);
  });

  it('counts each key separately', () => {
    const allow = createRateLimiter({ limit: 1, windowMs: 1_000, now: () => 0 });
    expect(allow('a')).toBe(true);
    expect(allow('a')).toBe(false);
    expect(allow('b')).toBe(true);
  });

  it('slides the window instead of resetting it', () => {
    let t = 0;
    const allow = createRateLimiter({ limit: 2, windowMs: 100, now: () => t });
    expect(allow('k')).toBe(true); // t=0
    t = 60;
    expect(allow('k')).toBe(true); // t=60
    t = 99;
    expect(allow('k')).toBe(false);
    t = 100; // the t=0 call has left the window, t=60 has not
    expect(allow('k')).toBe(true);
    expect(allow('k')).toBe(false);
  });

  it('does not count denied calls against the caller', () => {
    let t = 0;
    const allow = createRateLimiter({ limit: 1, windowMs: 100, now: () => t });
    expect(allow('k')).toBe(true);
    t = 50;
    expect(allow('k')).toBe(false);
    t = 100;
    expect(allow('k')).toBe(true);
  });
});
