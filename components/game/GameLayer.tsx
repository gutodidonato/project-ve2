'use client';

import { useCallback } from 'react';
import type { Locale, Profile } from '@/content/types';
import type { DesktopAction } from '@/lib/garage/desktop';
import { useGameStore } from '@/lib/store';
import { GarageCanvas } from '@/components/garage/GarageCanvas';
import { GarageFlash } from '@/components/garage/GarageFlash';
import { ScreenSurface } from '@/components/garage/ScreenSurface';
import { useDesktopControls } from '@/components/garage/useDesktopControls';
import { ErrorBoundary } from './ErrorBoundary';

export interface GameLayerProps {
  profile: Profile;
  locale: Locale;
}

/** The scene could not start or crashed (context creation failed, a render error): show the pit stop for good. */
function fallBackToPitstop() {
  useGameStore.getState().forcePitstop('error');
}

/**
 * The 3D boundary: the only module that may import three / R3F, directly or
 * through components/garage (it is loaded through `next/dynamic` with
 * `ssr: false` by GameMount, only when not in pit stop). A fixed
 * full-viewport layer under the pit stop toggle (z-50): the garage canvas, the
 * LuisOS desktop on the glass above it and the launch flash.
 */
export default function GameLayer({ profile, locale }: GameLayerProps) {
  const { dispatch, language } = useDesktopControls(locale);
  const onKey = useCallback((a: DesktopAction | 'language') => (a === 'language' ? language() : dispatch(a)), [dispatch, language]);

  return (
    <div className="game-layer fixed inset-0 z-0">
      <ErrorBoundary fallback={null} onError={fallBackToPitstop}>
        <GarageCanvas onKey={onKey} />
      </ErrorBoundary>
      <ScreenSurface profile={profile} locale={locale} dispatch={dispatch} onLanguage={language} />
      <GarageFlash />
    </div>
  );
}
