'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/content/types';
import { isTypingTarget } from '@/lib/game/input';
import {
  gameUrl,
  hashOf,
  keyToAction,
  otherLocale,
  parseScreenHash,
  reduceDesktop,
  type DesktopAction,
} from '@/lib/garage/desktop';
import { LAUNCH_MS, launchFrame } from '@/lib/garage/launch';
import { garageRuntime } from '@/lib/garage/runtime';
import { garageSound } from '@/lib/garage/sound';
import { useGameStore } from '@/lib/store';

/** Point the URL at the anchor of the open resume or contact (or at nothing), without a history entry. */
function writeHash(next: string): void {
  const { hash, pathname, search } = window.location;
  if (hash === next) return;
  window.history.replaceState(null, '', next === '' ? pathname + search : next);
}

/** Milliseconds since Salto88.exe started (the e2e hold freezes it); 0 outside the launch. */
function launchElapsed(): number {
  const start = garageRuntime.launchStart;
  return start === null ? 0 : (garageRuntime.launchHold ?? performance.now() - start);
}

/**
 * The garage's input around the LuisOS desktop: `dispatch` runs the desktop
 * machine and its effects (the launch and its one navigation to the game,
 * the cancel, which Esc can only ask for before the flash), `language`
 * switches the locale keeping the open windows. Also listens to the keyboard
 * (C, K, J, E, Esc; every key sinks its 3D cap and clicks), keeps the anchor on
 * the open resume or contact, follows anchors typed into the address bar,
 * prefetches the game page, unlocks the sound on a real gesture and brings the
 * desk back when the browser restores the page after the game.
 */
export function useDesktopControls(locale: Locale): { dispatch(a: DesktopAction): void; language(): void } {
  const router = useRouter();
  /** The pending navigation to the game: one per launch, whatever is pressed meanwhile. */
  const departure = useRef<number | null>(null);

  const cancelDeparture = useCallback(() => {
    if (departure.current !== null) window.clearTimeout(departure.current);
    departure.current = null;
    garageRuntime.launchStart = null;
  }, []);

  /** Back to the desk now, whatever the timeline says (page restored from cache, garage unmounted). */
  const forceDesk = useCallback(() => {
    cancelDeparture();
    garageRuntime.door = 0;
    const { desktop, setDesktop } = useGameStore.getState();
    if (desktop.view === 'launch') setDesktop(reduceDesktop(desktop, { type: 'cancel' }).state);
  }, [cancelDeparture]);

  const language = useCallback(() => {
    const other = otherLocale(locale);
    router.replace(`/${other}${hashOf(other, useGameStore.getState().desktop)}`);
  }, [locale, router]);

  const dispatch = useCallback(
    (a: DesktopAction) => {
      const { desktop, setDesktop } = useGameStore.getState();
      // Once the flash has started the jump goes on: neither Esc nor the dialog's close box cancels.
      const cancels = a.type === 'escape' || a.type === 'cancel' || a.type === 'close';
      if (desktop.view === 'launch' && cancels && launchFrame(launchElapsed()).whiteout > 0) return;
      const { state, effect } = reduceDesktop(desktop, a);
      if (state !== desktop) setDesktop(state);
      if (effect === 'start-launch') {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        garageRuntime.launchStart = performance.now();
        garageSound().door();
        garageSound().engine();
        departure.current = window.setTimeout(
          () => {
            departure.current = null;
            window.location.assign(gameUrl(locale));
          },
          reduced ? 0 : LAUNCH_MS,
        );
      } else if (effect === 'cancel-launch') {
        cancelDeparture();
      }
    },
    [locale, cancelDeparture],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // `key` can be missing on synthetic events (e.g. browser autofill).
      if (typeof e.key !== 'string') return;
      if (e.repeat || e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
      if (document.querySelector('dialog[open]') !== null) return;
      if (isTypingTarget(e.target)) {
        // Esc in a form field only leaves the field; letters are just typed.
        if (e.key === 'Escape') (e.target as HTMLElement).blur();
        return;
      }
      garageRuntime.pressed.set(e.code, performance.now());
      garageSound().key();
      const action = keyToAction(e.key);
      if (action === null) return;
      e.preventDefault();
      if (action === 'language') language();
      else dispatch(action);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dispatch, language]);

  // Audio may only start after a gesture. A touch pointerdown (or Esc) is not one, so every
  // gesture asks again until the context is really running.
  useEffect(() => {
    const GESTURES = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'] as const;
    const stop = () => GESTURES.forEach((g) => window.removeEventListener(g, unlock, { capture: true }));
    function unlock() {
      garageSound().unlock();
      if (garageSound().running()) stop();
    }
    GESTURES.forEach((g) => window.addEventListener(g, unlock, { capture: true }));
    return stop;
  }, []);

  // Back from the game through the browser's page cache: the store still says `launch`.
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) forceDesk();
    }
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, [forceDesk]);

  // Fetch the game page ahead, once the garage is idle, so the jump never lands on a blank page.
  useEffect(() => {
    const href = gameUrl(locale);
    const add = () => {
      if (document.querySelector(`link[rel="prefetch"][href="${href}"]`) !== null) return;
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    };
    // Safari has no requestIdleCallback: a few seconds after mount is idle enough.
    if (typeof window.requestIdleCallback !== 'function') {
      const id = window.setTimeout(add, 3000);
      return () => window.clearTimeout(id);
    }
    const id = window.requestIdleCallback(add, { timeout: 5000 });
    return () => window.cancelIdleCallback(id);
  }, [locale]);

  // Leaving the garage (pit stop, unmount) never leaves a navigation armed, nor a launch with nothing pending.
  useEffect(() => forceDesk, [forceDesk]);

  useEffect(() => {
    writeHash(hashOf(locale, useGameStore.getState().desktop));
    const unsubscribe = useGameStore.subscribe((s, prev) => {
      if (s.desktop !== prev.desktop) writeHash(hashOf(locale, s.desktop));
    });
    function onHashChange() {
      const id = parseScreenHash(window.location.hash);
      if (id !== null) dispatch({ type: 'open', id });
    }
    window.addEventListener('hashchange', onHashChange);
    return () => {
      unsubscribe();
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [locale, dispatch]);

  return { dispatch, language };
}
