'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import type { Locale, Profile } from '@/content/types';
import { isTypingTarget } from '@/lib/game/input';
import { README_KEY, initialDesktop } from '@/lib/garage/desktop';
import { initialPitstop, PITSTOP_KEY } from '@/lib/pitstop';
import { readPref, writePref } from '@/lib/storage';
import { useGameStore } from '@/lib/store';
import { ErrorBoundary } from './ErrorBoundary';
import { PitstopToggle } from './PitstopToggle';
import { detectWebgl } from './useWebglSupport';

// The only door to three / R3F: never imported statically from here.
const GameLayer = dynamic(() => import('./GameLayer'), { ssr: false });

interface ConnectionLike {
  saveData?: boolean;
}

function readSaveData(): boolean {
  const { connection } = navigator as Navigator & { connection?: ConnectionLike };
  return connection?.saveData === true;
}

/**
 * The game layer failed to load (its chunk never arrived) or something in it threw
 * while rendering. Show the pit stop for good: the page must not go down with the game.
 */
function fallBackToPitstop() {
  useGameStore.getState().forcePitstop('error');
}

/** Where the server-rendered pit stop lives (PitStop's `<main>`). */
const PITSTOP_ID = 'pitstop';

/**
 * First stop in the tab order while the game runs, visible only when focused:
 * switches to the pit stop (the text version) and moves focus into it. In game
 * mode the pit stop is inert, so this is how keyboard and screen reader users
 * reach it without hunting for the toggle.
 */
function TextVersionButton() {
  const t = useTranslations('Game');
  const setPitstop = useGameStore((s) => s.setPitstop);
  return (
    <button
      type="button"
      onClick={() => {
        setPitstop(true);
        // Next frame: the mode effect has run by then, so the pit stop is no longer inert.
        requestAnimationFrame(() => document.getElementById(PITSTOP_ID)?.focus());
      }}
      className="fixed top-4 left-4 z-[60] inline-flex min-h-11 cursor-pointer items-center border border-sun bg-panel px-3 py-2 font-mono text-[0.8125rem] leading-tight tracking-[0.06em] text-sun not-focus:sr-only"
    >
      {t('textVersion')}
    </button>
  );
}

/**
 * Client shell around the server-rendered pit stop. The server HTML is the pit
 * stop (no `data-mode`); on mount this decides pit stop vs. game once, keeps
 * `<html data-mode>` in sync with the store, handles the `P` shortcut, and loads
 * the 3D layer only when the game is on, behind an error boundary: a failed chunk
 * or a render error anywhere in the game falls back to a forced pit stop.
 */
export function GameMount({ profile, locale }: { profile: Profile; locale: Locale }) {
  const ready = useGameStore((s) => s.pitstopReady);
  const pitstop = useGameStore((s) => s.pitstop);
  const forced = useGameStore((s) => s.pitstopForced);

  // Initial decision. Not a user choice, so it is applied without persisting.
  useEffect(() => {
    const stored = readPref(PITSTOP_KEY);
    const decision = initialPitstop({
      webgl: detectWebgl(),
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      saveData: readSaveData(),
      stored: stored === 'on' || stored === 'off' ? stored : null,
    });
    useGameStore.getState().applyInitialPitstop(decision);
    // Once per page: a language switch keeps the open windows (the store outlives the route).
    const { desktopReady, setDesktop } = useGameStore.getState();
    if (!desktopReady) {
      const desktop = initialDesktop(window.location.hash, readPref(README_KEY) === 'seen');
      setDesktop(desktop);
      // The readme, or the window a link opened: either way the next plain visit starts empty.
      if (desktop.windows.length > 0) writePref(README_KEY, 'seen');
    }
  }, []);

  // html[data-mode] drives the CSS that hides the pit stop and locks scrolling in game mode.
  // The hidden pit stop is also inert there, so it is no trail of invisible tab stops.
  // html[data-forced] makes room under the toggle for the line that says why it is disabled.
  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.dataset.mode = pitstop ? 'pitstop' : 'game';
    root.toggleAttribute('data-forced', forced);
    document.getElementById(PITSTOP_ID)?.toggleAttribute('inert', !pitstop);
  }, [ready, pitstop, forced]);
  useEffect(
    () => () => {
      delete document.documentElement.dataset.mode;
      document.documentElement.removeAttribute('data-forced');
      document.getElementById(PITSTOP_ID)?.removeAttribute('inert');
    },
    [],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // `key` can be missing on synthetic events (e.g. browser autofill).
      if (typeof e.key !== 'string' || e.key.toLowerCase() !== 'p') return;
      if (e.repeat || e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
      // An open modal (the HUD credits) keeps the keyboard; P waits until it is closed.
      if (isTypingTarget(e.target) || document.querySelector('dialog[open]') !== null) return;
      const { pitstopReady, pitstop: on, setPitstop } = useGameStore.getState();
      if (pitstopReady) setPitstop(!on); // a no-op when forced and trying to leave pit stop
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      {ready && !pitstop ? <TextVersionButton /> : null}
      <PitstopToggle />
      {ready && !pitstop ? (
        <ErrorBoundary fallback={null} onError={fallBackToPitstop}>
          <GameLayer profile={profile} locale={locale} />
        </ErrorBoundary>
      ) : null}
    </>
  );
}
