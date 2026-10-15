'use client';

import { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { registerDebug } from '@/lib/game/debug';
import { inputQueue, runtime } from '@/lib/game/runtime';
import { tickGame } from '@/lib/game/tick';
import type { GameEvent } from '@/lib/game/types';
import { useGameStore } from '@/lib/store';

/** Runs before every other frame subscriber (negative priority keeps R3F's own render loop). */
const DIRECTOR_PRIORITY = -1;

function applyEvents(events: readonly GameEvent[]): void {
  const { setZone, setMode } = useGameStore.getState();
  for (const event of events) {
    if (event.type === 'zone') setZone(event.zone);
    else setMode(event.mode);
  }
}

/**
 * The frame loop's single writer: advances the game runtime once per frame and
 * forwards its discrete events (zone / mode changes) to the store. This is the
 * only `useFrame` allowed to call store setters, and only for those events.
 */
export function GameDirector() {
  useEffect(() => {
    // The runtime may start inside a zone (hash spawn) or carry state from a
    // previous mount; events only fire on change, so align the store once.
    const { setZone, setMode } = useGameStore.getState();
    setZone(runtime.zone);
    setMode(runtime.mode);
    return registerDebug(runtime);
  }, []);

  useFrame((_, dt) => {
    const events = tickGame(runtime, inputQueue.consume(), dt);
    if (events.length > 0) applyEvents(events);
  }, DIRECTOR_PRIORITY);

  return null;
}
