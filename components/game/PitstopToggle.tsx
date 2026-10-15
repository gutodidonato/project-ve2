'use client';

import { useId } from 'react';
import { useTranslations } from 'next-intl';
import { useGameStore } from '@/lib/store';

/**
 * Fixed pit stop switch: bottom-right on desktop, top-right under 700px (`md`).
 * Renders nothing until the client has decided the initial mode, so the server
 * HTML (and no-JS visitors) never get a button that cannot work. The label swaps
 * between "pit stop mode" and "enter the game", so it carries no pressed state.
 *
 * When pit stop is forced (no WebGL, or the game failed to load) the button stays
 * visible but inert, and the reason is a visible line next to it, also its
 * accessible description. `aria-disabled` rather than `disabled` keeps it
 * focusable, so keyboard and screen reader users reach the explanation. The note
 * is a polite live region that exists (empty) from the start: a failure while
 * the page is open fills it in and is announced. (Not `role="status"`: a second
 * status landmark in the page's accessibility tree for something that is
 * usually empty.)
 */
export function PitstopToggle() {
  const t = useTranslations('Game');
  const noteId = useId();
  const ready = useGameStore((s) => s.pitstopReady);
  const pitstop = useGameStore((s) => s.pitstop);
  const forced = useGameStore((s) => s.pitstopForced);
  const reason = useGameStore((s) => s.pitstopReason);
  const setPitstop = useGameStore((s) => s.setPitstop);

  if (!ready) return null;

  const note = forced ? t(reason === 'error' ? 'pitstopForcedError' : 'pitstopForced') : null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end md:top-auto md:bottom-4 md:flex-col-reverse">
      <button
        type="button"
        aria-disabled={forced || undefined}
        aria-describedby={note === null ? undefined : noteId}
        onClick={() => {
          if (!forced) setPitstop(!pitstop);
        }}
        className={`inline-flex min-h-11 items-center border bg-panel/90 px-3 py-2 font-mono text-[0.8125rem] leading-tight tracking-[0.06em] backdrop-blur-sm ${
          forced
            ? 'cursor-not-allowed border-line text-muted'
            : 'cursor-pointer border-line text-sun hover:border-sun'
        }`}
      >
        {pitstop ? t('pitstopOff') : t('pitstopOn')}
      </button>
      <p
        id={noteId}
        aria-live="polite"
        aria-atomic="true"
        className={
          note === null
            ? undefined
            : 'mt-2 max-w-[min(20rem,calc(100vw-2rem))] border border-line bg-panel/90 px-2.5 py-1.5 text-right font-mono text-xs leading-snug text-muted backdrop-blur-sm md:mt-0 md:mb-2'
        }
      >
        {note}
      </p>
    </div>
  );
}
