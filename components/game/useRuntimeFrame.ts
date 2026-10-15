'use client';

import { useEffectEvent, useLayoutEffect } from 'react';

const subscribers = new Set<() => void>();
let handle = 0;

function tick() {
  handle = requestAnimationFrame(tick);
  for (const run of subscribers) {
    // One throwing subscriber must neither stop the loop nor skip the others this frame.
    try {
      run();
    } catch (error) {
      reportError(error);
    }
  }
}

/**
 * Run `onFrame` on every animation frame, from one requestAnimationFrame loop
 * shared by all DOM overlays (HUD readouts, minimap car marker). It is for
 * writing per-frame runtime values straight into DOM refs: never set React or
 * store state from it. Also runs once on mount, before paint.
 */
export function useRuntimeFrame(onFrame: () => void): void {
  const frame = useEffectEvent(onFrame);

  useLayoutEffect(() => {
    const run = () => frame();
    subscribers.add(run);
    run();
    if (subscribers.size === 1) handle = requestAnimationFrame(tick);
    return () => {
      subscribers.delete(run);
      if (subscribers.size === 0) cancelAnimationFrame(handle);
    };
  }, []);
}

/** Set `el`'s text only when it changed (a same-value write still costs a DOM mutation). */
export function writeText(el: HTMLElement | null, text: string): void {
  if (el !== null && el.textContent !== text) el.textContent = text;
}
