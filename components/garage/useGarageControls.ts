'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/content/types';
import { isTypingTarget } from '@/lib/game/input';
import { LAUNCH_MS } from '@/lib/garage/launch';
import { garageRuntime } from '@/lib/garage/runtime';
import { garageSound } from '@/lib/garage/sound';
import {
  gameUrl,
  INITIAL_GARAGE,
  keyToAction,
  otherLocale,
  reduceGarage,
  screenHash,
  stateFromHash,
  type GarageAction,
  type GarageState,
} from '@/lib/garage/state';
import { useGameStore } from '@/lib/store';

/** Point the URL at the open screen (or at nothing) without a history entry; a no-op when it already does. */
function writeHash(locale: Locale, garage: GarageState): void {
  const { hash, pathname, search } = window.location;
  const next = screenHash(locale, garage.view === 'screen' ? garage.content : null);
  if (hash === next) return;
  window.history.replaceState(null, '', next === '' ? pathname + search : next);
}

/**
 * The garage's input: returns `act`, which runs the state machine and its
 * effects (the language switch, the launch and its one navigation to the game,
 * its cancel), and listens to the keyboard (C, J, K, E, Esc; every key also
 * sinks its 3D cap and clicks), keeps the URL anchor on the open screen,
 * follows anchors typed into the address bar, prefetches the game page once
 * the page is idle and resets the garage when the browser brings the page
 * back from its cache after the game.
 */
export function useGarageControls(locale: Locale): (a: GarageAction) => void {
  const router = useRouter();
  /** The pending navigation to the game: one per launch, whatever is pressed meanwhile. */
  const departure = useRef<number | null>(null);

  const cancelDeparture = useCallback(() => {
    if (departure.current !== null) window.clearTimeout(departure.current);
    departure.current = null;
    garageRuntime.launchStart = null;
  }, []);

  const act = useCallback(
    (a: GarageAction) => {
      const { garage, setGarage } = useGameStore.getState();
      const { state, effect } = reduceGarage(garage, a);
      setGarage(state, a);
      if (effect === 'switch-locale') {
        const other = otherLocale(locale);
        router.replace(`/${other}${screenHash(other, state.view === 'screen' ? state.content : null)}`);
      } else if (effect === 'start-launch') {
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
    [locale, router, cancelDeparture],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // `key` can be missing on synthetic events (e.g. browser autofill).
      if (typeof e.key !== 'string') return;
      if (e.repeat || e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
      // An open modal (the credits) keeps the keyboard.
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
      act(action);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [act]);

  // Audio may only start after a gesture; the first one anywhere unlocks it.
  useEffect(() => {
    const unlock = () => garageSound().unlock();
    window.addEventListener('pointerdown', unlock, { once: true, capture: true });
    window.addEventListener('keydown', unlock, { once: true, capture: true });
    return () => {
      window.removeEventListener('pointerdown', unlock, { capture: true });
      window.removeEventListener('keydown', unlock, { capture: true });
    };
  }, []);

  // Back from the game through the browser's page cache: the store still says `launch`.
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (!e.persisted) return;
      cancelDeparture();
      garageRuntime.door = 0;
      useGameStore.getState().setGarage(INITIAL_GARAGE, null);
    }
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, [cancelDeparture]);

  // Fetch the game page ahead, once the garage is idle, so J never lands on a blank page.
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

  // Leaving the garage (pit stop, unmount) never leaves a navigation armed.
  useEffect(() => cancelDeparture, [cancelDeparture]);

  useEffect(() => {
    writeHash(locale, useGameStore.getState().garage);
    const unsubscribe = useGameStore.subscribe((s, prev) => {
      if (s.garage !== prev.garage) writeHash(locale, s.garage);
    });
    function onHashChange() {
      if (useGameStore.getState().garage.view === 'launch') return;
      useGameStore.getState().setGarage(stateFromHash(window.location.hash), null);
    }
    window.addEventListener('hashchange', onHashChange);
    return () => {
      unsubscribe();
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [locale]);

  return act;
}
