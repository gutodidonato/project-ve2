import type { GarageAction } from './state';

const letters = (s: string) => [...s].map((c) => `Key${c}`);

/** The micro's keyboard by `KeyboardEvent.code`, row by row, front row last. */
export const KEY_ROWS: readonly (readonly string[])[] = [
  ['Escape', ...[...'1234567890'].map((d) => `Digit${d}`)],
  letters('QWERTYUIOP'),
  letters('ASDFGHJKL'),
  letters('ZXCVBNM'),
  ['Space'],
];

/** The physical key of each action (the letter printed on it). */
export const ACTION_CODES: Record<GarageAction, string> = {
  cv: 'KeyC',
  play: 'KeyJ',
  contact: 'KeyK',
  language: 'KeyE',
  back: 'Escape',
};

/** On a phone held upright the keyboard is only the four menu keys, big, in menu order. */
export const PORTRAIT_CODES: readonly string[] = [ACTION_CODES.cv, ACTION_CODES.play, ACTION_CODES.contact, ACTION_CODES.language];

const BY_CODE = new Map(Object.entries(ACTION_CODES).map(([action, code]) => [code, action as GarageAction]));

/** The action of a clicked 3D key; null for keys that only move. */
export function codeToAction(code: string): GarageAction | null {
  return BY_CODE.get(code) ?? null;
}

/** What is printed on a key cap. */
export function legendOf(code: string): string {
  if (code === 'Escape') return 'Esc';
  if (code === 'Space') return '';
  return code.replace(/^Key|^Digit/, '');
}
