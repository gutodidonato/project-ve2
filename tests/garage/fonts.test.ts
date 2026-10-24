// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { legendFontFamily } from '@/lib/garage/fonts';

describe('legendFontFamily', () => {
  it('uses the family next/font registered for IBM Plex Sans (a hashed name)', () => {
    const root = document.createElement('div');
    root.style.setProperty('--font-plex-sans', "'__IBM_Plex_Sans_a1b2c3', '__IBM_Plex_Sans_Fallback_a1b2c3'");
    expect(legendFontFamily(root)).toBe("'__IBM_Plex_Sans_a1b2c3', '__IBM_Plex_Sans_Fallback_a1b2c3', \"Segoe UI\", sans-serif");
  });

  it('falls back to the plain name when the variable is missing', () => {
    expect(legendFontFamily(document.createElement('div'))).toBe('"IBM Plex Sans", "Segoe UI", sans-serif');
  });
});
