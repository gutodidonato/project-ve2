'use client';

import { useEffect } from 'react';
import { inputQueue, runtime } from '@/lib/game/runtime';
import type { ZoneId } from '@/lib/game/types';
import { parseZoneHash } from '@/lib/game/zones';
import { useGameStore } from '@/lib/store';

/** Point the URL at `zone` (or at no zone), without a history entry; no-op when it already does. */
function writeZoneHash(zone: ZoneId | null): void {
  const { hash, pathname, search } = window.location;
  const next = zone === null ? '' : `#${zone}`;
  if (hash === next) return;
  window.history.replaceState(null, '', next === '' ? pathname + search : next);
}

/**
 * Keeps the URL hash on the zone the car is in (`#cases`) and clears it on the
 * road, with `replaceState` so driving never piles up history entries, and so a
 * reload lands where the screen shows.
 *
 * On mount a zone hash that disagrees with the car (say `#contato` followed in
 * the pit stop before entering the game) is rewritten to the car's zone. The
 * first load agrees by construction: GameMount spawned the car from the hash.
 * Anything that is not a zone hash (`#foo`) is left alone until the car enters
 * or leaves a zone.
 *
 * The other direction too: a zone hash typed into the address bar (or a pit
 * stop anchor followed in game mode) sends the car there.
 */
export function useHashSync(): void {
  useEffect(() => {
    const hashZone = parseZoneHash(window.location.hash);
    if (hashZone !== null && hashZone !== runtime.zone) writeZoneHash(runtime.zone);

    const unsubscribe = useGameStore.subscribe((state, prev) => {
      if (state.zone !== prev.zone) writeZoneHash(state.zone);
    });

    function onHashChange() {
      const zone = parseZoneHash(window.location.hash);
      if (zone !== null) inputQueue.goto(zone);
    }
    window.addEventListener('hashchange', onHashChange);

    return () => {
      unsubscribe();
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);
}
