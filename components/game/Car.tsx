'use client';

import { Suspense, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import type { Group } from 'three';
import { CAR_GLB } from '@/lib/game/assets';
import { runtime } from '@/lib/game/runtime';
import { normalizeCar } from '@/components/garage/DeLorean';
import { ErrorBoundary } from './ErrorBoundary';
import { PrimitiveCar, Underglow } from './PrimitiveCar';

/** The GLB has no Draco data; `false` keeps drei from pointing a Draco decoder at a CDN. */
const USE_DRACO = false;

function CarModel() {
  const { scene } = useGLTF(CAR_GLB, USE_DRACO);
  const model = useMemo(() => normalizeCar(scene), [scene]);
  return (
    <>
      <primitive object={model} />
      <Underglow />
    </>
  );
}

/**
 * The player's car. The group follows `runtime.car` every frame; inside it the
 * DeLorean streams in behind the primitive silhouette, which also stays if the
 * GLB fails to load.
 */
export function Car() {
  const ref = useRef<Group>(null);

  useFrame(() => {
    const group = ref.current;
    if (!group) return;
    const { x, z, heading } = runtime.car;
    group.position.set(x, 0, z);
    group.rotation.y = heading;
  });

  return (
    <group ref={ref}>
      <ErrorBoundary fallback={<PrimitiveCar />}>
        <Suspense fallback={<PrimitiveCar />}>
          <CarModel />
        </Suspense>
      </ErrorBoundary>
    </group>
  );
}

// Start the download as soon as this (lazily loaded) module is evaluated.
useGLTF.preload(CAR_GLB, USE_DRACO);
