'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/content/types';
import { isTypingTarget } from '@/lib/game/input';
import { garageRuntime } from '@/lib/garage/runtime';
import { keyToAction, otherLocale, reduceGarage, screenHash, stateFromHash, type GarageAction, type GarageState } from '@/lib/garage/state';
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
 * effects (the language switch here; the launch in Task 6's sequence), and
 * listens to the keyboard (C, J, K, E, Esc; every key also sinks its 3D cap),
 * keeps the URL anchor on the open screen and follows anchors typed into the
 * address bar.
 */
export function useGarageControls(locale: Locale): (a: GarageAction) => void {
  const router = useRouter();

  const act = useCallback(
    (a: GarageAction) => {
      const { garage, setGarage } = useGameStore.getState();
      const { state, effect } = reduceGarage(garage, a);
      setGarage(state, a);
      if (effect === 'switch-locale') {
        const other = otherLocale(locale);
        router.replace(`/${other}${screenHash(other, state.view === 'screen' ? state.content : null)}`);
      } else if (effect === 'start-launch') {
        garageRuntime.launchStart = performance.now();
      } else if (effect === 'cancel-launch') {
        garageRuntime.launchStart = null;
      }
    },
    [locale, router],
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
      const action = keyToAction(e.key);
      if (action === null) return;
      e.preventDefault();
      act(action);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [act]);

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
