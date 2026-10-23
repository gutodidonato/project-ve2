import type { Locale } from '@/content/types';

/** Where the camera is: at the workbench, inside the monitor, or turning to the car (J). */
export type GarageView = 'bench' | 'screen' | 'launch';
/** What the monitor shows once the camera is inside it. */
export type ScreenContent = 'cv' | 'contact';

export interface GarageState {
  view: GarageView;
  /** Only set in the `screen` view. */
  content: ScreenContent | null;
}

/** What a key (C, K, J, E, Esc), a 3D key or a menu button asks for. */
export type GarageAction = 'cv' | 'contact' | 'play' | 'language' | 'back';

/** The side effect a transition asks the controls to run; the reducer stays pure. */
export type GarageEffect = 'switch-locale' | 'start-launch' | 'cancel-launch' | null;

export const INITIAL_GARAGE: GarageState = { view: 'bench', content: null };

/**
 * The garage state machine. During the launch only `back` acts (it cancels);
 * the language switch never changes the view, the controls carry it to the
 * other locale's URL.
 */
export function reduceGarage(
  s: GarageState,
  a: GarageAction,
): { state: GarageState; effect: GarageEffect } {
  if (s.view === 'launch') {
    return a === 'back' ? { state: INITIAL_GARAGE, effect: 'cancel-launch' } : { state: s, effect: null };
  }
  switch (a) {
    case 'cv':
    case 'contact':
      return { state: { view: 'screen', content: a }, effect: null };
    case 'play':
      return { state: { view: 'launch', content: null }, effect: 'start-launch' };
    case 'language':
      return { state: s, effect: 'switch-locale' };
    case 'back':
      return { state: INITIAL_GARAGE, effect: null };
  }
}

const KEY_ACTIONS: Record<string, GarageAction> = {
  c: 'cv',
  k: 'contact',
  j: 'play',
  e: 'language',
  escape: 'back',
};

/** `KeyboardEvent.key` to an action (the letter printed on the key, any case); null for every other key. */
export function keyToAction(key: string): GarageAction | null {
  return KEY_ACTIONS[key.toLowerCase()] ?? null;
}

const HASHES: Record<Locale, Record<ScreenContent, string>> = {
  pt: { cv: '#curriculo', contact: '#contato' },
  en: { cv: '#resume', contact: '#contact' },
};

/** Either locale's anchor opens the screen: a PT link shared to an English reader still works. */
export function parseScreenHash(hash: string): ScreenContent | null {
  for (const locale of ['pt', 'en'] as const) {
    for (const content of ['cv', 'contact'] as const) {
      if (HASHES[locale][content] === hash) return content;
    }
  }
  return null;
}

/** The anchor for `content` in `locale`; '' when nothing is open. */
export function screenHash(locale: Locale, content: ScreenContent | null): string {
  return content === null ? '' : HASHES[locale][content];
}

export function stateFromHash(hash: string): GarageState {
  const content = parseScreenHash(hash);
  return content === null ? INITIAL_GARAGE : { view: 'screen', content };
}

/**
 * The game page. The file name is part of it on purpose: proxy.ts only skips
 * paths with a dot, so `/salto88/` would be sent through the locale redirect.
 */
export function gameUrl(locale: Locale): string {
  return locale === 'en' ? '/salto88/index.html?lang=en' : '/salto88/index.html';
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'pt' ? 'en' : 'pt';
}
