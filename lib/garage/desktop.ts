import type { CaseSlug, Locale } from '@/content/types';

/** The desktop icons, in their on-screen order. */
export type IconId = 'cv' | 'projects' | 'contact' | 'salto88' | 'control' | 'readme' | 'trash';
/** Everything that opens in a window: the icons' programs, a case file, the trash's log. */
export type ProgramId = IconId | 'bug' | `case:${CaseSlug}`;

export interface WindowState {
  id: ProgramId;
  /** Top-left corner in the desktop's CSS px. */
  x: number;
  y: number;
}

export interface DesktopState {
  /** `desk`: the camera rests on the monitor; `launch`: Salto88.exe is running (pull-back, door, car). */
  view: 'desk' | 'launch';
  /** Back to front: the last window is the one on top. */
  windows: WindowState[];
  focus: ProgramId | null;
  selected: IconId | null;
}

type Bounds = { width: number; height: number };

export type DesktopAction =
  | { type: 'open'; id: ProgramId }
  | { type: 'close'; id: ProgramId }
  | { type: 'focus'; id: ProgramId }
  | { type: 'move'; id: ProgramId; x: number; y: number; bounds: Bounds }
  | { type: 'clamp'; bounds: Bounds }
  | { type: 'select'; icon: IconId | null }
  | { type: 'escape' }
  | { type: 'play' }
  | { type: 'cancel' };

/** The side effect a transition asks the controls to run; the reducer stays pure. */
export type DesktopEffect = 'start-launch' | 'cancel-launch' | null;

/** Set once the first-visit readme has been shown: later visits open on an empty desktop. */
export const README_KEY = 'rodovia:readme';

export const ICONS: readonly IconId[] = ['cv', 'projects', 'contact', 'salto88', 'control', 'readme', 'trash'];

/** Height of the menu bar: windows never go above it. */
export const MENU_H = 28;
/** Where new windows open, right of the icon column (16 + 104 + 16 px), each one stepped down and right from the last. */
export const CASCADE = { x: 136, y: 44, step: 26 };
/** How much of a window stays on the desktop when it is pushed to the right or the bottom. */
const KEEP_X = 120;
const KEEP_Y = 32;

export const INITIAL_DESKTOP: DesktopState = { view: 'desk', windows: [], focus: null, selected: null };

const isIcon = (id: ProgramId): id is IconId => (ICONS as readonly string[]).includes(id);

function clampTo(w: WindowState, bounds: Bounds): WindowState {
  return {
    ...w,
    x: Math.min(Math.max(0, w.x), Math.max(0, bounds.width - KEEP_X)),
    y: Math.min(Math.max(MENU_H, w.y), Math.max(MENU_H, bounds.height - KEEP_Y)),
  };
}

function toFront(s: DesktopState, id: ProgramId): DesktopState {
  const w = s.windows.find((x) => x.id === id);
  if (!w) return s;
  return { ...s, windows: [...s.windows.filter((x) => x.id !== id), w], focus: id };
}

function open(s: DesktopState, id: ProgramId): DesktopState {
  const selected = isIcon(id) ? id : s.selected;
  if (s.windows.some((w) => w.id === id)) return { ...toFront(s, id), selected };
  const n = s.windows.length;
  const w = { id, x: CASCADE.x + n * CASCADE.step, y: CASCADE.y + n * CASCADE.step };
  return { ...s, windows: [...s.windows, w], focus: id, selected };
}

function close(s: DesktopState, id: ProgramId): DesktopState {
  const windows = s.windows.filter((w) => w.id !== id);
  return { ...s, windows, focus: windows.length ? windows[windows.length - 1].id : null };
}

const NOTHING = (s: DesktopState) => ({ state: s, effect: null });

/**
 * The LuisOS 88 desktop. One window per program; the last window is on top
 * and focused. During the launch only `escape` / `cancel` act (they cancel),
 * so nothing opens over the departing car.
 */
export function reduceDesktop(s: DesktopState, a: DesktopAction): { state: DesktopState; effect: DesktopEffect } {
  if (s.view === 'launch') {
    if (a.type === 'escape' || a.type === 'cancel') {
      return { state: { ...close(s, 'salto88'), view: 'desk' }, effect: 'cancel-launch' };
    }
    return NOTHING(s);
  }
  switch (a.type) {
    case 'open':
      if (a.id === 'salto88') return reduceDesktop(s, { type: 'play' });
      return { state: open(s, a.id), effect: null };
    case 'close':
      return { state: close(s, a.id), effect: null };
    case 'focus':
      return { state: toFront(s, a.id), effect: null };
    case 'move':
      return {
        state: { ...s, windows: s.windows.map((w) => (w.id === a.id ? clampTo({ ...w, x: a.x, y: a.y }, a.bounds) : w)) },
        effect: null,
      };
    case 'clamp':
      return { state: { ...s, windows: s.windows.map((w) => clampTo(w, a.bounds)) }, effect: null };
    case 'select':
      return { state: { ...s, selected: a.icon }, effect: null };
    case 'escape':
      return s.focus === null ? NOTHING(s) : { state: close(s, s.focus), effect: null };
    case 'play':
      return { state: { ...open(s, 'salto88'), view: 'launch' }, effect: 'start-launch' };
    case 'cancel':
      return NOTHING(s);
  }
}

const KEY_ACTIONS: Record<string, DesktopAction | 'language'> = {
  c: { type: 'open', id: 'cv' },
  k: { type: 'open', id: 'contact' },
  j: { type: 'play' },
  e: 'language',
  escape: { type: 'escape' },
};

/** `KeyboardEvent.key` to a desktop action, or `'language'` for E; null for every other key. */
export function keyToAction(key: string): DesktopAction | 'language' | null {
  return KEY_ACTIONS[key.toLowerCase()] ?? null;
}

const HASHES: Record<Locale, Record<'cv' | 'contact', string>> = {
  pt: { cv: '#curriculo', contact: '#contato' },
  en: { cv: '#resume', contact: '#contact' },
};

/** Either locale's anchor names the window: a PT link shared to an English reader still works. */
export function parseScreenHash(hash: string): 'cv' | 'contact' | null {
  for (const locale of ['pt', 'en'] as const) {
    for (const id of ['cv', 'contact'] as const) {
      if (HASHES[locale][id] === hash) return id;
    }
  }
  return null;
}

/** The anchor for the topmost of the resume and the contact windows; '' when neither is open. */
export function hashOf(locale: Locale, s: DesktopState): string {
  for (let i = s.windows.length - 1; i >= 0; i--) {
    const id = s.windows[i].id;
    if (id === 'cv' || id === 'contact') return HASHES[locale][id];
  }
  return '';
}

/** First paint: the anchor's window; else the readme on a first visit; else an empty desktop. */
export function initialDesktop(hash: string, readmeSeen: boolean): DesktopState {
  const anchored = parseScreenHash(hash);
  if (anchored !== null) return open(INITIAL_DESKTOP, anchored);
  return readmeSeen ? INITIAL_DESKTOP : open(INITIAL_DESKTOP, 'readme');
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
