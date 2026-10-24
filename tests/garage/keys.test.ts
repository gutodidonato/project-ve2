import { describe, expect, it } from 'vitest';
import { ACTION_CODES, KEY_ROWS, codeToAction } from '@/lib/garage/keys';

describe('garage keyboard layout', () => {
  const all = KEY_ROWS.flat();

  it('has every action key on the board', () => {
    for (const code of ACTION_CODES) expect(all).toContain(code);
  });

  it('repeats no key', () => {
    expect(new Set(all).size).toBe(all.length);
  });

  it('maps a pressed 3D key to the desktop action of its letter', () => {
    expect(codeToAction('KeyC')).toEqual({ type: 'open', id: 'cv' });
    expect(codeToAction('KeyK')).toEqual({ type: 'open', id: 'contact' });
    expect(codeToAction('KeyJ')).toEqual({ type: 'play' });
    expect(codeToAction('KeyE')).toBe('language');
    expect(codeToAction('Escape')).toEqual({ type: 'escape' });
    expect(codeToAction('KeyQ')).toBeNull();
  });
});
