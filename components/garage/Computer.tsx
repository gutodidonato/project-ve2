'use client';

import { BENCH_TOP_Y, GLASS } from '@/lib/garage/scene';

const BEIGE = '#D6CBB0';
const GLASS_OFF = '#17130C';

const [gx, gy, gz] = GLASS.center;
const MONITOR = { width: 0.52, height: 0.42, depth: 0.4 };
const CASE = { width: 0.56, height: 0.12, depth: 0.44 };

/**
 * The 1988 micro: a beige case on the bench, the CRT monitor on top and its
 * dark glass. The picture on the glass is DOM (ScreenSurface), placed on it
 * by GarageCamera.
 */
export function Computer() {
  const caseY = BENCH_TOP_Y + CASE.height / 2;
  const monitorZ = gz - 0.005 - MONITOR.depth / 2;

  return (
    <group name="computer">
      <mesh position={[gx, caseY, monitorZ + 0.02]} castShadow>
        <boxGeometry args={[CASE.width, CASE.height, CASE.depth]} />
        <meshStandardMaterial color={BEIGE} roughness={0.7} />
      </mesh>
      <mesh position={[gx, gy, monitorZ]} castShadow>
        <boxGeometry args={[MONITOR.width, MONITOR.height, MONITOR.depth]} />
        <meshStandardMaterial color={BEIGE} roughness={0.65} />
      </mesh>
      <mesh name="glass" position={[gx, gy, gz]}>
        <planeGeometry args={[GLASS.width, GLASS.height]} />
        <meshStandardMaterial color={GLASS_OFF} emissive="#3a2600" emissiveIntensity={0.35} roughness={0.2} metalness={0.1} />
      </mesh>
    </group>
  );
}
