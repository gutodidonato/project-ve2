import type { Controls } from './types';

const FORWARD = ['KeyW', 'ArrowUp'];
const BACK = ['KeyS', 'ArrowDown'];
const LEFT = ['KeyA', 'ArrowLeft'];
const RIGHT = ['KeyD', 'ArrowRight'];

function any(keys: ReadonlySet<string>, codes: readonly string[]): number {
  return codes.some((code) => keys.has(code)) ? 1 : 0;
}

/** WASD / arrows to controls. Opposing keys cancel; steer +1 = left. */
export function keysToControls(keys: ReadonlySet<string>): Controls {
  return {
    throttle: any(keys, FORWARD) - any(keys, BACK),
    steer: any(keys, LEFT) - any(keys, RIGHT),
  };
}

const TYPING_SELECTOR = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';

/**
 * True when a key event originates in something the user types into, so the
 * game must not treat the keystroke as driving or as the pit stop toggle.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (target === null) return false;
  // Duck-typed on purpose: stays safe across realms (iframes) and in non-DOM environments.
  const closest = (target as Partial<Element>).closest;
  if (typeof closest !== 'function') return false;
  return closest.call(target, TYPING_SELECTOR) !== null;
}

/** The only codes that ever enter the input queue as held keys. */
export const MOVEMENT_CODES: ReadonlySet<string> = new Set([...FORWARD, ...BACK, ...LEFT, ...RIGHT]);

/**
 * The keys a browser scrolls with. Inside a focused scroll panel (the zone
 * panel) these scroll it instead of driving; every other key keeps its game
 * meaning there, so WASD and the left / right arrows still drive a car whose
 * panel was just clicked.
 */
export const SCROLL_CODES: ReadonlySet<string> = new Set([
  'ArrowUp',
  'ArrowDown',
  'PageUp',
  'PageDown',
  'Home',
  'End',
  'Space',
]);

/** A key that only ever drives the car, even when a scroll panel has focus (WASD, left / right arrows). */
export function isDrivingOnlyKey(code: string): boolean {
  return MOVEMENT_CODES.has(code) && !SCROLL_CODES.has(code);
}

/**
 * Pointer pixels to world units for a drag. The autopilot reaches full speed at
 * about 14.5 world units, so this is full throttle at ~97 px of travel.
 */
export const DRAG_SCALE = 0.15;

const LINE_HEIGHT_PX = 16;

/** A wheel delta in pixels, whatever unit the browser reported it in (pixels, lines or pages). */
export function wheelPixels(deltaY: number, deltaMode: number, pageHeight: number): number {
  if (deltaMode === 1) return deltaY * LINE_HEIGHT_PX; // WheelEvent.DOM_DELTA_LINE
  if (deltaMode === 2) return deltaY * pageHeight; // WheelEvent.DOM_DELTA_PAGE
  return deltaY;
}

/** Controls Space activates. Not links: Space never follows a link (Enter does), so the game keeps it there. */
const ACTIVATABLE_SELECTOR = 'button, summary, [role="button"]';

/**
 * True when a key event comes from a control the user reached with the keyboard
 * (Tab) and that Space would activate, so Space must press it instead of
 * jumping to the next stop. A button that merely kept focus after a mouse click
 * does not count: the game owns Space again there.
 */
export function isKeyboardActivatable(target: EventTarget | null): boolean {
  if (target === null) return false;
  const closest = (target as Partial<Element>).closest;
  if (typeof closest !== 'function') return false;
  const control = closest.call(target, ACTIVATABLE_SELECTOR) as Element | null;
  if (control === null) return false;
  try {
    return control.matches(':focus-visible');
  } catch {
    return true; // No :focus-visible support: assume the safe, accessible reading.
  }
}
