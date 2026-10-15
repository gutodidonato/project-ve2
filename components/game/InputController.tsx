'use client';

import { useEffect, type RefObject } from 'react';
import {
  DRAG_SCALE,
  MOVEMENT_CODES,
  SCROLL_CODES,
  isKeyboardActivatable,
  isTypingTarget,
  wheelPixels,
} from '@/lib/game/input';
import { inputQueue } from '@/lib/game/runtime';
import { useGameStore } from '@/lib/store';

/**
 * Anything inside one of these is something the user is reading: the wheel and
 * the scroll keys (SCROLL_CODES) scroll it, not the car. Driving keys still drive.
 */
const SCROLL_PANEL = '[data-scroll-panel]';
/** An open modal (the HUD credits) owns the keyboard: Space presses its buttons, keys do not drive behind it. */
const OPEN_DIALOG = 'dialog[open]';

function closestMatch(target: EventTarget | null, selector: string): boolean {
  if (target === null) return false;
  // Duck-typed like isTypingTarget: the target can be a window or document.
  const closest = (target as Partial<Element>).closest;
  return typeof closest === 'function' && closest.call(target, selector) !== null;
}

export interface InputControllerProps {
  /** The game layer element: pointer drags start on the canvas inside it. */
  layerRef: RefObject<HTMLElement | null>;
}

/**
 * Turns browser input into `inputQueue` writes: keyboard (WASD / arrows drive,
 * Space is the next stop), wheel (spends tour distance) and a pointer drag on
 * the canvas (steers toward the drag direction). Inside a focused scroll panel
 * only the scroll keys (up / down / Space and friends) are left to the browser.
 * It renders nothing and listens only while not in pit stop, so the page scrolls
 * and types normally there. P is the mode toggle and belongs to GameMount.
 */
export function InputController({ layerRef }: InputControllerProps) {
  const pitstop = useGameStore((s) => s.pitstop);

  useEffect(() => {
    if (pitstop) return;
    const layer = layerRef.current;
    if (layer === null) return;

    let pointerId: number | null = null;
    let originX = 0;
    let originY = 0;

    /** Let go of everything: held keys and any drag in progress. */
    function release() {
      pointerId = null;
      inputQueue.releaseAll();
      inputQueue.endDrag();
    }

    function onKeyDown(e: KeyboardEvent) {
      // `code` can be missing on synthetic events (e.g. browser autofill).
      if (typeof e.code !== 'string') return;
      if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
      const space = e.code === 'Space';
      if (!space && !MOVEMENT_CODES.has(e.code)) return;
      if (isTypingTarget(e.target) || closestMatch(e.target, OPEN_DIALOG)) return;
      // Focus inside a panel: up / down and Space scroll it natively. WASD and left / right keep
      // driving, so clicking the panel text does not strand the car (Escape drops the focus).
      if (SCROLL_CODES.has(e.code) && closestMatch(e.target, SCROLL_PANEL)) return;
      // Space on a control the user tabbed to presses that control.
      if (space && isKeyboardActivatable(e.target)) return;
      e.preventDefault();
      if (space) {
        if (!e.repeat) inputQueue.nextStop();
      } else {
        inputQueue.press(e.code);
      }
    }

    // Releasing is always safe, so a key pressed in the game and let go over a text field cannot stick.
    function onKeyUp(e: KeyboardEvent) {
      if (MOVEMENT_CODES.has(e.code)) inputQueue.release(e.code);
    }

    function onWheel(e: WheelEvent) {
      if (e.ctrlKey) return; // pinch / ctrl+wheel zoom stays the browser's
      if (closestMatch(e.target, SCROLL_PANEL)) return;
      e.preventDefault();
      if (e.deltaY !== 0) inputQueue.wheel(wheelPixels(e.deltaY, e.deltaMode, window.innerHeight));
    }

    function onPointerDown(e: PointerEvent) {
      if (pointerId !== null || !e.isPrimary || e.button !== 0) return;
      // Only the canvas steers; HUD and panels above it keep their own pointer behavior.
      if (!closestMatch(e.target, 'canvas')) return;
      pointerId = e.pointerId;
      originX = e.clientX;
      originY = e.clientY;
      try {
        // Keep the drag alive when the pointer leaves the canvas or the window.
        (e.target as Element).setPointerCapture(e.pointerId);
      } catch {
        // Capture is a nicety: the window-level listeners below still end the drag.
      }
      inputQueue.drag(0, 0);
    }

    function onPointerMove(e: PointerEvent) {
      if (e.pointerId !== pointerId) return;
      inputQueue.drag((e.clientX - originX) * DRAG_SCALE, (e.clientY - originY) * DRAG_SCALE);
    }

    function onPointerEnd(e: PointerEvent) {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      inputQueue.endDrag();
    }

    function onVisibilityChange() {
      if (document.hidden) release();
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('wheel', onWheel, { passive: false });
    layer.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerEnd);
    window.addEventListener('pointercancel', onPointerEnd);
    window.addEventListener('blur', release);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('wheel', onWheel);
      layer.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerEnd);
      window.removeEventListener('pointercancel', onPointerEnd);
      window.removeEventListener('blur', release);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      release(); // leaving the game mid-drive must not leave the car held
    };
  }, [pitstop, layerRef]);

  return null;
}
