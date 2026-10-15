'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { ZoneId } from '@/lib/game/types';
import { ZONES } from '@/lib/game/zones';

/** Localized display name per zone id (`Game.zones`). */
export function useZoneNames(): Record<ZoneId, string> {
  const t = useTranslations('Game.zones');
  return useMemo(
    () => Object.fromEntries(ZONES.map((zone) => [zone.id, t(zone.id)])) as Record<ZoneId, string>,
    [t],
  );
}
