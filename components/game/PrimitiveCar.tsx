'use client';

import { useEffect, useMemo } from 'react';
import { AdditiveBlending, DataTexture, LinearFilter } from 'three';

const MAGENTA = '#ff3ea5';
const WHEELS: ReadonlyArray<readonly [number, number]> = [
  [-0.86, -1.2],
  [0.86, -1.2],
  [-0.86, 1.2],
  [0.86, 1.2],
];
const GLOW_SIZE = 64;

/** White texture whose alpha falls off smoothly from the center (an elliptical glow on the plane). */
function makeGlowTexture(): DataTexture {
  const data = new Uint8Array(GLOW_SIZE * GLOW_SIZE * 4);
  for (let y = 0; y < GLOW_SIZE; y++) {
    for (let x = 0; x < GLOW_SIZE; x++) {
      const u = ((x + 0.5) / GLOW_SIZE) * 2 - 1;
      const v = ((y + 0.5) / GLOW_SIZE) * 2 - 1;
      const falloff = Math.max(0, 1 - Math.hypot(u, v)) ** 1.6;
      const i = (y * GLOW_SIZE + x) * 4;
      data.set([255, 255, 255, Math.round(falloff * 255)], i);
    }
  }
  const texture = new DataTexture(data, GLOW_SIZE, GLOW_SIZE);
  // DataTexture defaults to nearest filtering, which shows the 64px grid once the glow is scaled up.
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/** Soft magenta glow on the ground under the car (shared by the GLB car and the fallback). */
export function Underglow() {
  const glow = useMemo(() => makeGlowTexture(), []);
  useEffect(() => () => glow.dispose(), [glow]);
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={0.04} renderOrder={1}>
      <planeGeometry args={[3.2, 5.6]} />
      <meshBasicMaterial
        color={MAGENTA}
        map={glow}
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </mesh>
  );
}

/**
 * The prototype's primitive silhouette, in car space (nose to -z, wheels on y = 0).
 * Shown while the GLB streams in and kept if it fails to load.
 */
export function PrimitiveCar() {
  return (
    <group>
      <mesh position-y={0.48}>
        <boxGeometry args={[1.7, 0.42, 3.8]} />
        <meshStandardMaterial color="#2a1f47" metalness={0.8} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0.86, 0.3]}>
        <boxGeometry args={[1.32, 0.36, 1.5]} />
        <meshStandardMaterial color="#0a0614" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.55, 1.92]}>
        <boxGeometry args={[1.5, 0.07, 0.04]} />
        <meshBasicMaterial color={MAGENTA} />
      </mesh>
      <mesh position={[0, 0.55, -1.92]}>
        <boxGeometry args={[1.4, 0.06, 0.04]} />
        <meshBasicMaterial color="#efe8ff" />
      </mesh>
      {WHEELS.map(([x, z]) => (
        <mesh key={`${x}:${z}`} position={[x, 0.34, z]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.34, 0.34, 0.26, 18]} />
          <meshStandardMaterial color="#050308" roughness={0.8} />
        </mesh>
      ))}
      <Underglow />
    </group>
  );
}
