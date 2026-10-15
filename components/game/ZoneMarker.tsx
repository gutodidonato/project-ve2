'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, DoubleSide, type MeshBasicMaterial } from 'three';
import { runtime } from '@/lib/game/runtime';
import type { Zone } from '@/lib/game/types';
import { SignLabel } from './SignLabel';

const RING_INNER = 6.6;
const RING_OUTER = 7.1;
const BEAM_HEIGHT = 14;
/**
 * Label center height. The plan says 15, but with the fixed camera (24 up,
 * 20 back, fov 48) a label at 15 sits on the top edge of the screen once the
 * car parks in the zone and gets cut off; at 12 it stays fully in view. The
 * beam (14) shows above it, as a sign hung on the light pole.
 */
const LABEL_Y = 12;
const LABEL_SIZE = 1.1;
/** Keeps the beam's top (2 units above the label center) behind the sign. */
const LABEL_FORWARD = 1.8;
/**
 * The camera's fov is vertical, so a portrait phone sees a narrow strip (about
 * 10 units across at the label's distance) and "EXPERIÊNCIA" would not fit.
 * Below this aspect ratio the signs shrink with it, down to MIN_LABEL_SCALE.
 */
const FULL_LABEL_ASPECT = 1.2;
const MIN_LABEL_SCALE = 0.55;

/**
 * One zone: ground ring and disc, vertical light beam and a camera-facing name.
 * The ring pulses (0.3–0.8) until the car is inside, then stays fully lit;
 * materials are mutated in the frame loop, no React state.
 */
export function ZoneMarker({ zone, label }: { zone: Zone; label: string }) {
  const ring = useRef<MeshBasicMaterial>(null);
  const disc = useRef<MeshBasicMaterial>(null);
  const beam = useRef<MeshBasicMaterial>(null);
  const time = useRef(0);
  const aspect = useThree((state) => state.size.width / Math.max(1, state.size.height));
  const labelScale = Math.min(1, Math.max(MIN_LABEL_SCALE, aspect / FULL_LABEL_ASPECT));

  useFrame((_, dt) => {
    time.current += dt;
    const active = runtime.zone === zone.id;
    if (ring.current) ring.current.opacity = active ? 1 : 0.55 + Math.sin(time.current * 2 + zone.x) * 0.25;
    if (disc.current) disc.current.opacity = active ? 0.09 : 0.07;
    if (beam.current) beam.current.opacity = active ? 0.8 : 0.55;
  });

  return (
    <group position={[zone.x, 0, zone.z]}>
      <mesh rotation-x={-Math.PI / 2} position-y={0.06}>
        <ringGeometry args={[RING_INNER, RING_OUTER, 64]} />
        <meshBasicMaterial ref={ring} color={zone.color} transparent opacity={0.55} side={DoubleSide} depthWrite={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.05}>
        <circleGeometry args={[RING_INNER, 48]} />
        <meshBasicMaterial ref={disc} color={zone.color} transparent opacity={0.07} depthWrite={false} />
      </mesh>
      <mesh position-y={BEAM_HEIGHT / 2}>
        <cylinderGeometry args={[0.12, 0.12, BEAM_HEIGHT, 8]} />
        <meshBasicMaterial
          ref={beam}
          color={zone.color}
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
      <SignLabel
        text={label.toUpperCase()}
        color={zone.color}
        size={LABEL_SIZE * labelScale}
        position={[0, LABEL_Y, 0]}
        forward={LABEL_FORWARD}
      />
    </group>
  );
}
