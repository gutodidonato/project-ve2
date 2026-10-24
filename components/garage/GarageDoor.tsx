'use client';

import { useLayoutEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Matrix4, type InstancedMesh } from 'three';
import { garageRuntime } from '@/lib/garage/runtime';
import { DOOR } from '@/lib/garage/scene';

const SLATS = 24;
const SLAT_H = DOOR.height / SLATS;
/** The door rests with its lower 40% open, the headlights leaking under it. */
const REST_OPEN = 0.4;
const STEEL = '#b9b4a6';

const matrix = new Matrix4();
const hidden = new Matrix4().makeScale(0, 0, 0);

/**
 * Roll-up door: 24 slats in one instanced mesh. The bottom edge sits at
 * `open × height`; slats that would rise above the opening go into the drum.
 */
export function GarageDoor() {
  const ref = useRef<InstancedMesh>(null);
  const shown = useRef(-1);
  const width = DOOR.x1 - DOOR.x0;
  const cx = (DOOR.x0 + DOOR.x1) / 2;

  const place = (open: number) => {
    const mesh = ref.current;
    if (!mesh) return;
    const bottom = open * DOOR.height;
    for (let i = 0; i < SLATS; i++) {
      const y = bottom + (i + 0.5) * SLAT_H;
      if (y < DOOR.height) mesh.setMatrixAt(i, matrix.makeTranslation(cx, y, DOOR.z));
      else mesh.setMatrixAt(i, hidden);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  useLayoutEffect(() => place(REST_OPEN));

  useFrame(() => {
    const open = REST_OPEN + (1 - REST_OPEN) * garageRuntime.door;
    if (open === shown.current) return;
    shown.current = open;
    place(open);
  });

  return (
    <group name="garage-door">
      <instancedMesh ref={ref} args={[undefined, undefined, SLATS]} castShadow>
        <boxGeometry args={[width, SLAT_H * 0.94, 0.04]} />
        <meshStandardMaterial color={STEEL} metalness={0.4} roughness={0.55} />
      </instancedMesh>
      <mesh position={[cx, DOOR.height + 0.12, DOOR.z + 0.08]}>
        <boxGeometry args={[width + 0.2, 0.24, 0.24]} />
        <meshStandardMaterial color="#5c5f5c" roughness={0.7} />
      </mesh>
    </group>
  );
}
