'use client';

import { Suspense, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Box3, Group, Vector3, type Object3D } from 'three';
import { CAR_GLB, CAR_LENGTH, CAR_MODEL_YAW } from '@/lib/game/assets';
import { CAR_SPOT } from '@/lib/garage/scene';
import { ErrorBoundary } from '@/components/game/ErrorBoundary';

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
  return <primitive object={model} />;
}

/**
 * The DeLorean parked behind the door, nose to the garage. A GLB that fails to
 * load leaves only its headlights (Lights): the garage itself keeps working.
 */
export function DeLorean() {
  return (
    <group name="delorean" position={[CAR_SPOT.x, 0, CAR_SPOT.z]} rotation={[0, CAR_SPOT.heading, 0]}>
      <ErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <CarModel />
        </Suspense>
      </ErrorBoundary>
    </group>
  );
}

// Start the download as soon as this (lazily loaded) module is evaluated.
useGLTF.preload(CAR_GLB, USE_DRACO);
