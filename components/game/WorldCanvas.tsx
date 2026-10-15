'use client';

import { Suspense, lazy, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { getGPUTier } from 'detect-gpu';
import { tierFrom, type Tier } from '@/lib/game/tier';
import type { ZoneId } from '@/lib/game/types';
import { ZONES } from '@/lib/game/zones';
import { useGameStore } from '@/lib/store';
import { CameraRig } from './CameraRig';
import { Car } from './Car';
import { Decor, type Company } from './Decor';
import { GameDirector } from './GameDirector';
import { Hub } from './Hub';
import { ZoneMarker } from './ZoneMarker';

/** Post-processing is only for tier A: its own chunk, so tier B never downloads it. */
const Effects = lazy(() => import('./Effects').then((m) => ({ default: m.Effects })));

/** Benchmarks copied from node_modules/detect-gpu/dist/benchmarks (no third-party CDN). */
const BENCHMARKS_URL = '/detect-gpu';
/** Past this the canvas starts anyway, in tier B. */
const TIER_TIMEOUT_MS = 2500;

let tierDetection: Promise<Tier> | null = null;

/**
 * Pick the quality tier once per page load and store it. Any failure or a slow
 * answer counts as an unknown GPU, which is tier B. Cached so leaving and
 * re-entering the game neither re-detects nor undoes a PerformanceMonitor decline.
 */
function detectTier(): Promise<Tier> {
  tierDetection ??= Promise.race([
    getGPUTier({ benchmarksURL: BENCHMARKS_URL }).then((gpu) => {
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      return tierFrom(gpu.tier, gpu.isMobile === true || coarse);
    }),
    new Promise<Tier>((resolve) => setTimeout(() => resolve(tierFrom(undefined, false)), TIER_TIMEOUT_MS)),
  ])
    .catch(() => tierFrom(undefined, false))
    .then((tier) => {
      useGameStore.getState().setTier(tier);
      return tier;
    });
  return tierDetection;
}

function declineTier() {
  const { tier, setTier } = useGameStore.getState();
  if (tier !== 'B') setTier('B');
}

export interface WorldCanvasProps {
  /** Display name per zone, already localized. */
  labels: Record<ZoneId, string>;
  /** Oldest first, for the experiência signposts. */
  companies: readonly Company[];
}

/**
 * The R3F canvas and the hub scene. Waits for the GPU tier (antialiasing is a
 * context-creation option, so it cannot change later), then renders. A failed
 * WebGL context throws out of <Canvas>, for GameLayer's boundary to catch.
 */
export function WorldCanvas({ labels, companies }: WorldCanvasProps) {
  const tier = useGameStore((s) => s.tier);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    void detectTier().then(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!ready) return null;

  return (
    <Canvas
      aria-hidden
      flat
      dpr={tier === 'A' ? [1, 2] : 1}
      camera={{ fov: 48, near: 0.5, far: 220, position: [0, 24, 26] }}
      gl={{ antialias: tier === 'A', powerPreference: 'high-performance' }}
    >
      <PerformanceMonitor onDecline={declineTier} />
      <GameDirector />
      <Hub />
      {ZONES.map((zone) => (
        <ZoneMarker key={zone.id} zone={zone} label={labels[zone.id]} />
      ))}
      <Decor companies={companies} />
      <Car />
      <CameraRig />
      {tier === 'A' ? (
        <Suspense fallback={null}>
          <Effects />
        </Suspense>
      ) : null}
    </Canvas>
  );
}
