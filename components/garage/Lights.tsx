'use client';

import { useLayoutEffect, useRef } from 'react';
import { Lightformer, Environment } from '@react-three/drei';
import { Object3D, type SpotLight } from 'three';
import type { Tier } from '@/lib/game/tier';
import { CAR_SPOT } from '@/lib/garage/scene';

const LAMP = '#FFCF8A';
const HEADLIGHTS = '#DDE8FF';
const LAMP_POS: [number, number, number] = [-0.35, 2.05, -0.1];
const LAMP_INTENSITY = 2.6;
/** Headlights at full; the door at rest lets 0.35 of it leak under. */
export const HEADLIGHT_MAX = 38;
const HEADLIGHT_REST = 0.35;

/** Where each headlight sits on the parked car (its nose faces +z, towards the garage). */
const HEADLIGHT_X = [-0.55, 0.55];
const HEADLIGHT_Y = 0.62;
const HEADLIGHT_Z = CAR_SPOT.z + 1.85;

function Headlight({ x }: { x: number }) {
  const light = useRef<SpotLight>(null);
  const target = useRef(new Object3D());
  useLayoutEffect(() => {
    target.current.position.set(x, 0.2, HEADLIGHT_Z + 6);
    target.current.updateMatrixWorld();
    if (light.current) light.current.target = target.current;
  }, [x]);
  return (
    <group name="headlight">
      <spotLight
        ref={light}
        position={[x, HEADLIGHT_Y, HEADLIGHT_Z]}
        color={HEADLIGHTS}
        intensity={HEADLIGHT_MAX * HEADLIGHT_REST}
        angle={0.5}
        penumbra={0.6}
        distance={12}
        decay={1.6}
      />
      <mesh position={[x, HEADLIGHT_Y, HEADLIGHT_Z + 0.01]}>
        <circleGeometry args={[0.09, 20]} />
        <meshBasicMaterial color={HEADLIGHTS} />
      </mesh>
    </group>
  );
}

/**
 * Two light temperatures: the warm tungsten lamp over the bench and the cold
 * DeLorean headlights behind the door. The environment map is a tiny scene of
 * the same two lights (Lightformers, nothing downloaded) for the car's paint.
 */
export function Lights({ tier }: { tier: Tier }) {
  return (
    <group name="lights">
      <hemisphereLight args={['#3b3f45', '#1a1816', 0.35]} />
      <pointLight
        name="lamp"
        position={LAMP_POS}
        color={LAMP}
        intensity={LAMP_INTENSITY}
        distance={7}
        decay={1.4}
        castShadow={tier === 'A'}
        shadow-mapSize={[512, 512]}
      />
      <mesh position={[LAMP_POS[0], LAMP_POS[1] + 0.06, LAMP_POS[2]]}>
        <coneGeometry args={[0.16, 0.14, 20, 1, true]} />
        <meshStandardMaterial color="#2f3a33" side={2} roughness={0.6} />
      </mesh>
      <mesh position={LAMP_POS}>
        <sphereGeometry args={[0.035, 12, 8]} />
        <meshBasicMaterial color={LAMP} />
      </mesh>
      {HEADLIGHT_X.map((x) => (
        <Headlight key={x} x={CAR_SPOT.x + x} />
      ))}
      <Environment resolution={32} frames={1}>
        <Lightformer form="rect" color={LAMP} intensity={2} position={[-2, 3, 2]} scale={[3, 1, 1]} />
        <Lightformer form="rect" color={HEADLIGHTS} intensity={3} position={[3, 1, -4]} scale={[4, 1.5, 1]} />
      </Environment>
    </group>
  );
}
