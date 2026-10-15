'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { runtime } from '@/lib/game/runtime';

/** Camera offset from the car (fixed 3/4 view). */
const OFFSET_Y = 24;
const OFFSET_Z = 20;
/** Per-second remainder of the follow lerp: k = 1 - FOLLOW ** dt. */
const FOLLOW = 0.04;
/** The camera aims slightly ahead of the car. */
const LOOK_AHEAD = 2;

/** Fixed 3/4 camera that eases after the car. Snaps on the first frame (hash spawns far from origin). */
export function CameraRig() {
  const placed = useRef(false);

  useFrame(({ camera }, dt) => {
    const { x, z } = runtime.car;
    if (!placed.current) {
      camera.position.set(x, OFFSET_Y, z + OFFSET_Z);
      placed.current = true;
    } else {
      const k = 1 - FOLLOW ** dt;
      camera.position.x += (x - camera.position.x) * k;
      camera.position.y += (OFFSET_Y - camera.position.y) * k;
      camera.position.z += (z + OFFSET_Z - camera.position.z) * k;
    }
    camera.lookAt(x, 0, z - LOOK_AHEAD);
  });

  return null;
}
