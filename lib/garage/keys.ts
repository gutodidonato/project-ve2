import type { DesktopAction } from './desktop';

const letters = (s: string) => [...s].map((c) => `Key${c}`);

/** The micro's keyboard by `KeyboardEvent.code`, row by row, front row last. */
export const KEY_ROWS: readonly (readonly string[])[] = [
  ['Escape', ...[...'1234567890'].map((d) => `Digit${d}`)],
  letters('QWERTYUIOP'),
  letters('ASDFGHJKL'),
  letters('ZXCVBNM'),
  ['Space'],
];

/** The keys that act, by `KeyboardEvent.code` (the letter printed on them): the same as typing it. */
const ACTIONS: Record<string, DesktopAction | 'language'> = {
  KeyC: { type: 'open', id: 'cv' },
  KeyK: { type: 'open', id: 'contact' },
  KeyJ: { type: 'play' },
  KeyE: 'language',
  Escape: { type: 'escape' },
};

export const ACTION_CODES: readonly string[] = Object.keys(ACTIONS);

/** The action of a clicked 3D key; null for keys that only move. */
export function codeToAction(code: string): DesktopAction | 'language' | null {
  return ACTIONS[code] ?? null;
}

/** What is printed on a key cap. */
export function legendOf(code: string): string {
  if (code === 'Escape') return 'Esc';
  if (code === 'Space') return '';
  return code.replace(/^Key|^Digit/, '');
}
