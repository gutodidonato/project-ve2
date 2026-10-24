import { describe, expect, it } from 'vitest';
import {
  ICONS,
  INITIAL_DESKTOP,
  gameUrl,
  hashOf,
  initialDesktop,
  keyToAction,
  otherLocale,
  parseScreenHash,
  reduceDesktop,
  type DesktopAction,
  type DesktopState,
} from '@/lib/garage/desktop';

/** Apply actions in order, keeping only the state. */
function run(...actions: DesktopAction[]): DesktopState {
  return actions.reduce((s, a) => reduceDesktop(s, a).state, INITIAL_DESKTOP);
}

const ids = (s: DesktopState) => s.windows.map((w) => w.id);

describe('reduceDesktop', () => {
  it('opens a program once and brings it to the front', () => {
    const s = run({ type: 'open', id: 'cv' }, { type: 'open', id: 'contact' });
    expect(s.windows.map((w) => [w.x, w.y])).toEqual([
      [24, 44],
      [50, 70],
    ]);
    const again = reduceDesktop(s, { type: 'open', id: 'cv' }).state;
    expect(ids(again)).toEqual(['contact', 'cv']);
    expect(again.focus).toBe('cv');
    expect(again.selected).toBe('cv');
  });

  it('close focuses the window left on top', () => {
    let s = run({ type: 'open', id: 'cv' }, { type: 'open', id: 'contact' }, { type: 'close', id: 'contact' });
    expect(s.focus).toBe('cv');
    s = reduceDesktop(s, { type: 'close', id: 'cv' }).state;
    expect(s.focus).toBeNull();
    expect(s.windows).toEqual([]);
  });

  it('focus brings a window to the front', () => {
    const s = run({ type: 'open', id: 'cv' }, { type: 'open', id: 'contact' }, { type: 'focus', id: 'cv' });
    expect(ids(s)).toEqual(['contact', 'cv']);
    expect(s.focus).toBe('cv');
  });

  it('escape closes the focused window and is a no-op on an empty desktop', () => {
    expect(ids(run({ type: 'open', id: 'cv' }, { type: 'open', id: 'readme' }, { type: 'escape' }))).toEqual(['cv']);
    expect(reduceDesktop(INITIAL_DESKTOP, { type: 'escape' })).toEqual({ state: INITIAL_DESKTOP, effect: null });
  });

  it('move keeps the title reachable, and clamp does it when the glass shrinks', () => {
    const bounds = { width: 960, height: 720 };
    const moved = run({ type: 'open', id: 'cv' }, { type: 'move', id: 'cv', x: 5000, y: -50, bounds });
    expect([moved.windows[0].x, moved.windows[0].y]).toEqual([840, 28]);
    const far = run({ type: 'open', id: 'cv' }, { type: 'move', id: 'cv', x: 800, y: 600, bounds });
    const clamped = reduceDesktop(far, { type: 'clamp', bounds: { width: 600, height: 400 } }).state;
    expect([clamped.windows[0].x, clamped.windows[0].y]).toEqual([480, 368]);
  });

  it('selects an icon', () => {
    expect(run({ type: 'select', icon: 'trash' }).selected).toBe('trash');
    expect(run({ type: 'select', icon: 'trash' }, { type: 'select', icon: null }).selected).toBeNull();
  });

  it('Salto88.exe and J start the launch; nothing opens during it; escape cancels', () => {
    const exe = reduceDesktop(run({ type: 'open', id: 'cv' }), { type: 'open', id: 'salto88' });
    expect(exe.effect).toBe('start-launch');
    expect(exe.state.view).toBe('launch');
    expect(ids(exe.state)).toEqual(['cv', 'salto88']);
    expect(reduceDesktop(INITIAL_DESKTOP, { type: 'play' }).effect).toBe('start-launch');

    const during = reduceDesktop(exe.state, { type: 'open', id: 'contact' });
    expect(during).toEqual({ state: exe.state, effect: null });
    expect(reduceDesktop(exe.state, { type: 'play' }).effect).toBeNull();

    const cancelled = reduceDesktop(exe.state, { type: 'escape' });
    expect(cancelled.effect).toBe('cancel-launch');
    expect(cancelled.state.view).toBe('desk');
    expect(ids(cancelled.state)).toEqual(['cv']);
    expect(reduceDesktop(INITIAL_DESKTOP, { type: 'cancel' }).effect).toBeNull();
  });
});

describe('keys', () => {
  it('maps the letters and Escape, any case', () => {
    expect(keyToAction('c')).toEqual({ type: 'open', id: 'cv' });
    expect(keyToAction('C')).toEqual({ type: 'open', id: 'cv' });
    expect(keyToAction('k')).toEqual({ type: 'open', id: 'contact' });
    expect(keyToAction('j')).toEqual({ type: 'play' });
    expect(keyToAction('e')).toBe('language');
    expect(keyToAction('Escape')).toEqual({ type: 'escape' });
    expect(keyToAction('p')).toBeNull();
  });
});

describe('anchors and the first visit', () => {
  it('the topmost of the resume and the contact names the anchor', () => {
    expect(hashOf('pt', run({ type: 'open', id: 'cv' }, { type: 'open', id: 'contact' }))).toBe('#contato');
    expect(hashOf('en', run({ type: 'open', id: 'cv' }, { type: 'open', id: 'readme' }))).toBe('#resume');
    expect(hashOf('pt', run({ type: 'open', id: 'readme' }))).toBe('');
    expect(parseScreenHash('#curriculo')).toBe('cv');
    expect(parseScreenHash('#contact')).toBe('contact');
    expect(parseScreenHash('#cases')).toBeNull();
  });

  it('opens the anchor, else the readme on the first visit, else nothing', () => {
    expect(ids(initialDesktop('#contact', false))).toEqual(['contact']);
    expect(initialDesktop('#contact', false).focus).toBe('contact');
    expect(ids(initialDesktop('', false))).toEqual(['readme']);
    expect(initialDesktop('', true)).toEqual(INITIAL_DESKTOP);
  });

  it('lists the seven icons in order', () => {
    expect(ICONS).toEqual(['cv', 'projects', 'contact', 'salto88', 'control', 'readme', 'trash']);
  });

  it('keeps the game URL and the locale flip', () => {
    expect(gameUrl('pt')).toBe('/salto88/index.html');
    expect(gameUrl('en')).toBe('/salto88/index.html?lang=en');
    expect(otherLocale('pt')).toBe('en');
  });
});
