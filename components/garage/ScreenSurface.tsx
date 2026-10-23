'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { Locale, Profile } from '@/content/types';
import { garageRuntime } from '@/lib/garage/runtime';
import type { GarageAction } from '@/lib/garage/state';
import { SCREEN_PX } from '@/lib/garage/surface';
import { useGameStore } from '@/lib/store';
import { Screen } from './screen/Screen';

/**
 * The monitor's picture: ordinary DOM in the page's React tree (intl context,
 * focus, screen readers), above the canvas. GarageCamera places it on the
 * glass every rendered frame (lib/garage/surface.ts); it starts hidden until
 * the camera has projected the glass once.
 */
export function ScreenSurface({
  profile,
  locale,
  act,
}: {
  profile: Profile;
  locale: Locale;
  act(a: GarageAction): void;
}) {
  const t = useTranslations('Garage');
  const garage = useGameStore((s) => s.garage);
  const last = useGameStore((s) => s.garageLast);

  const attach = useCallback((el: HTMLDivElement | null) => {
    garageRuntime.surface = el;
  }, []);

  return (
    <div
      ref={attach}
      role="region"
      aria-label={t('screen')}
      className="crt crt-screen"
      style={{ position: 'absolute', visibility: 'hidden', width: SCREEN_PX.width, height: SCREEN_PX.height }}
    >
      <Screen profile={profile} locale={locale} state={garage} last={last} onAction={act} />
    </div>
  );
}
