'use client';

import type { Locale, Profile } from '@/content/types';
import { useGameStore } from '@/lib/store';
import { GarageCanvas } from '@/components/garage/GarageCanvas';
import { ScreenSurface } from '@/components/garage/ScreenSurface';
import { useGarageControls } from '@/components/garage/useGarageControls';
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
 * full-viewport layer under the pit stop toggle (z-50): the garage canvas, and
 * the DOM screen above it.
 */
export default function GameLayer({ profile, locale }: GameLayerProps) {
  const act = useGarageControls(locale);

  return (
    <div className="game-layer fixed inset-0 z-0">
      <ErrorBoundary fallback={null} onError={fallBackToPitstop}>
        <GarageCanvas act={act} />
      </ErrorBoundary>
      <ScreenSurface profile={profile} locale={locale} act={act} />
    </div>
  );
}
