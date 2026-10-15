// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readPref, writePref } from '@/lib/storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('round-trips a value', () => {
    expect(writePref('rodovia:test', 'on')).toBe(true);
    expect(readPref('rodovia:test')).toBe('on');
  });

  it('returns null for a missing key', () => {
    expect(readPref('rodovia:missing')).toBeNull();
  });

  it('readPref returns null when getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(readPref('rodovia:test')).toBeNull();
  });

  it('writePref returns false when setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(writePref('rodovia:test', 'on')).toBe(false);
  });

  it('survives the localStorage accessor itself throwing (blocked site data)', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(readPref('rodovia:test')).toBeNull();
    expect(writePref('rodovia:test', 'on')).toBe(false);
  });
});
