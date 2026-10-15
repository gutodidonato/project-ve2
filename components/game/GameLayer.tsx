'use client';

import { useMemo, useRef } from 'react';
import type { Locale, Profile } from '@/content/types';
import { useGameStore } from '@/lib/store';
import type { Company } from './Decor';
import { ErrorBoundary } from './ErrorBoundary';
import { Hud } from './Hud';
import { InputController } from './InputController';
import { Minimap } from './Minimap';
import { useHashSync } from './useHashSync';
import { useZoneNames } from './useZoneNames';
import { WorldCanvas } from './WorldCanvas';
import { ZonePanel } from './ZonePanel';

export interface GameLayerProps {
  profile: Profile;
  locale: Locale;
}

/** The scene could not start or crashed (context creation failed, a render error): show the pit stop for good. */
function fallBackToPitstop() {
  useGameStore.getState().forcePitstop('error');
}

/**
 * The 3D game boundary: the only module under components/game that may import
 * three / R3F (it is loaded through `next/dynamic` with `ssr: false` by
 * GameMount, only when not in pit stop). A fixed full-viewport layer under the
 * pit stop toggle (z-50): the canvas, then the DOM overlays above it (HUD, zone
 * panel, minimap).
 */
export default function GameLayer({ profile, locale }: GameLayerProps) {
  const names = useZoneNames();
  const companies = useMemo<Company[]>(
    () => [...profile.experience].reverse().map((e) => ({ name: e.company, since: e.start.slice(0, 4) })),
    [profile],
  );

  const layerRef = useRef<HTMLDivElement>(null);
  useHashSync();

  return (
    <div ref={layerRef} className="game-layer fixed inset-0 z-0">
      <ErrorBoundary fallback={null} onError={fallBackToPitstop}>
        <WorldCanvas labels={names} companies={companies} />
      </ErrorBoundary>
      <InputController layerRef={layerRef} />
      <Hud profile={profile} locale={locale} names={names} />
      <ZonePanel profile={profile} locale={locale} names={names} />
      <Minimap names={names} />
    </div>
  );
}
