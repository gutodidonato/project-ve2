'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Locale, Profile } from '@/content/types';
import { deskRect, framingFor } from '@/lib/garage/camera';
import type { DesktopAction, DesktopState, ProgramId } from '@/lib/garage/desktop';
import { garageRuntime } from '@/lib/garage/runtime';
import { garageSound } from '@/lib/garage/sound';
import { useGameStore } from '@/lib/store';
import { Desktop } from './os/Desktop';

/** The desktop's layout for this window: the glass in CSS px, and whether a phone holds it upright. */
function measure(): { size: { width: number; height: number }; compact: boolean } {
  const { innerWidth: w, innerHeight: h } = window;
  const { page } = deskRect(w, h);
  return { size: { width: Math.round(page.width), height: Math.round(page.height) }, compact: framingFor(w, h) === 'portrait' };
}

/** Where the keyboard lands when a window closes: the icon or file that opened it. */
function opener(node: HTMLElement, id: ProgramId): HTMLElement | null {
  if (id === 'bug') return node.querySelector('.os-window[data-program="trash"] [data-testid="os-file"]');
  if (id.startsWith('case:')) {
    const name = `${id.slice(5)}.txt`;
    const files = node.querySelectorAll<HTMLElement>('.os-window[data-program="projects"] [data-testid="os-file"]');
    return Array.from(files).find((f) => f.textContent === name) ?? null;
  }
  return node.querySelector(`[data-icon="${id}"]`);
}

function titleOf(node: HTMLElement, id: ProgramId): HTMLElement | null {
  return node.querySelector(`.os-window[data-program="${id}"] .os-title`);
}

/**
 * The monitor's picture: the LuisOS desktop, ordinary DOM in the page's React
 * tree (intl context, focus, screen readers), above the canvas. GarageCamera
 * places it on the glass every rendered frame (lib/garage/surface.ts); it
 * starts hidden until the camera has projected the glass once.
 */
export function ScreenSurface({
  profile,
  locale,
  dispatch,
  onLanguage,
}: {
  profile: Profile;
  locale: Locale;
  dispatch(a: DesktopAction): void;
  onLanguage(): void;
}) {
  const desktop = useGameStore((s) => s.desktop);
  const [layout, setLayout] = useState(measure);
  const [muted, setMuted] = useState(() => garageSound().muted());
  const sound = useMemo(
    () => ({
      muted,
      toggle() {
        garageSound().setMuted(!muted);
        setMuted(!muted);
      },
    }),
    [muted],
  );

  const el = useRef<HTMLDivElement | null>(null);
  const attach = useCallback((node: HTMLDivElement | null) => {
    el.current = node;
    garageRuntime.surface = node;
  }, []);

  // A smaller window shrinks the glass: the desktop follows, and no window is left out of reach.
  useEffect(() => {
    function onResize() {
      const next = measure();
      setLayout((prev) =>
        prev.compact === next.compact && prev.size.width === next.size.width && prev.size.height === next.size.height ? prev : next,
      );
      dispatch({ type: 'clamp', bounds: next.size });
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [dispatch]);

  // Opened with a window up (a #curriculo link, the first-visit readme, a language switch): once the
  // desktop is on the glass (hidden elements cannot take focus), the keyboard starts in that window.
  useEffect(() => {
    const id = useGameStore.getState().desktop.focus;
    if (id === null) return;
    let frame = 0;
    const until = performance.now() + 30_000;
    const tryFocus = () => {
      const node = el.current;
      const title = node && titleOf(node, id);
      if (node && title && node.dataset.placed !== undefined && !node.dataset.placed.startsWith('visibility:hidden')) {
        title.focus({ preventScroll: true });
        return;
      }
      if (performance.now() < until) frame = requestAnimationFrame(tryFocus);
    };
    frame = requestAnimationFrame(tryFocus);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Focus follows the windows: into the one that opened, back to the icon of the one that closed.
  const previous = useRef<DesktopState>(desktop);
  useEffect(() => {
    const before = previous.current;
    previous.current = desktop;
    const node = el.current;
    if (node === null || before === desktop) return;
    const opened = desktop.windows.find((w) => !before.windows.some((b) => b.id === w.id));
    if (opened) {
      titleOf(node, opened.id)?.focus({ preventScroll: true });
      return;
    }
    const closed = before.windows.find((b) => !desktop.windows.some((w) => w.id === b.id));
    if (closed) opener(node, closed.id)?.focus({ preventScroll: true });
  }, [desktop]);

  return (
    <div
      ref={attach}
      className="crt crt-screen"
      style={{ position: 'absolute', visibility: 'hidden', width: layout.size.width, height: layout.size.height }}
    >
      <Desktop
        profile={profile}
        locale={locale}
        state={desktop}
        size={layout.size}
        compact={layout.compact}
        dispatch={dispatch}
        onLanguage={onLanguage}
        sound={sound}
      />
    </div>
  );
}
