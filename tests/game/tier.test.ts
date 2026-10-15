import { describe, expect, it } from 'vitest';
import { tierFrom } from '@/lib/game/tier';

describe('tierFrom', () => {
  it('is A for a strong GPU on desktop', () => {
    expect(tierFrom(3, false)).toBe('A');
    expect(tierFrom(2, false)).toBe('A');
  });

  it('is B on mobile regardless of GPU', () => {
    expect(tierFrom(3, true)).toBe('B');
  });

  it('is B for a weak or unknown GPU', () => {
    expect(tierFrom(1, false)).toBe('B');
    expect(tierFrom(0, false)).toBe('B');
    expect(tierFrom(undefined, false)).toBe('B');
  });
});
