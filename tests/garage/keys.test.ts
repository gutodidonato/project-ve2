import { describe, expect, it } from 'vitest';
import { ACTION_CODES, KEY_ROWS, PORTRAIT_CODES, codeToAction } from '@/lib/garage/keys';

describe('garage keyboard layout', () => {
  const all = KEY_ROWS.flat();

  it('has every action key on the board', () => {
    for (const code of Object.values(ACTION_CODES)) expect(all).toContain(code);
  });

  it('repeats no key', () => {
    expect(new Set(all).size).toBe(all.length);
  });

  it('keeps only the four menu keys on phones, in menu order', () => {
    expect(PORTRAIT_CODES).toEqual(['KeyC', 'KeyJ', 'KeyK', 'KeyE']);
    expect(ACTION_CODES).toEqual({ cv: 'KeyC', play: 'KeyJ', contact: 'KeyK', language: 'KeyE', back: 'Escape' });
  });

  it('maps a pressed 3D key to its action', () => {
    expect(codeToAction('KeyK')).toBe('contact');
    expect(codeToAction('Escape')).toBe('back');
    expect(codeToAction('KeyQ')).toBeNull();
  });
});
