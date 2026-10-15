'use client';

import { Suspense, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Box3, Group, Vector3, type Object3D } from 'three';
import { CAR_GLB, CAR_LENGTH, CAR_MODEL_YAW } from '@/lib/game/assets';
import { runtime } from '@/lib/game/runtime';
import { ErrorBoundary } from './ErrorBoundary';
import { PrimitiveCar, Underglow } from './PrimitiveCar';

/** The GLB has no Draco data; `false` keeps drei from pointing a Draco decoder at a CDN. */
const USE_DRACO = false;

/**
 * Wrap a clone of the raw GLB scene so it fits car space: turned by
 * `CAR_MODEL_YAW` (nose to -z), scaled to `CAR_LENGTH` on its longest
 * horizontal side, centered on x/z and resting on y = 0. Runs once per load.
 */
export function normalizeCar(source: Object3D): Group {
  const model = source.clone(true);
  model.rotation.set(0, CAR_MODEL_YAW, 0);
  const holder = new Group();
  holder.name = 'car-model';
  holder.add(model);
  holder.updateMatrixWorld(true);

  // Precise: the box of the rotated vertices, not of rotated per-mesh boxes.
  const box = new Box3().setFromObject(holder, true);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  model.position.set(-center.x, -box.min.y, -center.z);
  holder.scale.setScalar(CAR_LENGTH / Math.max(size.x, size.z));
  return holder;
}

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
