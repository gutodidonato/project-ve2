'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Lightformer, Environment } from '@react-three/drei';
import {
  AdditiveBlending,
  CanvasTexture,
  DoubleSide,
  Matrix4,
  Object3D,
  Quaternion,
  Vector3,
  type InstancedMesh,
  type MeshBasicMaterial,
  type PointLight,
  type SpotLight,
} from 'three';
import type { Tier } from '@/lib/game/tier';
import { garageRuntime } from '@/lib/garage/runtime';
import { CAR_SPOT } from '@/lib/garage/scene';

const LAMP = '#FFCF8A';
const HEADLIGHTS = '#DDE8FF';
const LAMP_POS: [number, number, number] = [-0.25, 1.86, -0.05];
const LAMP_INTENSITY = 2.6;
/** Headlights at full; the door at rest lets 0.35 of it leak under. */
export const HEADLIGHT_MAX = 90;

/** Where each headlight sits on the parked car (its nose faces +z, towards the garage). */
const HEADLIGHT_X = [-0.55, 0.55];
const HEADLIGHT_Y = 0.62;
const HEADLIGHT_Z = CAR_SPOT.z + 1.85;
/** Where each headlight aims: through the door, at the bench. */
const aimOf = (x: number): [number, number, number] => [x - 1.6, 0.6, HEADLIGHT_Z + 5];

/** The visible beam: a cone from the lamp along its aim, faint at rest, bright as the door opens. */
const BEAM_LENGTH = 5;
const BEAM_RADIUS = 0.85;
const BEAM_REST = 0.035;
const BEAM_FULL = 0.1;

/** The cold light that comes in through the opening, from the top of the door to the bench. */
const SPILL_MAX = 34;
const SPILL_POS: [number, number, number] = [1.9, 1.55, 0.35];
const SPILL_AIM: [number, number, number] = [-0.4, 0.95, 0];

const up = new Vector3(0, 1, 0);

/** Alpha along the beam: bright at the lamp, gone at the far end (ConeGeometry's v runs base 0 → apex 1). */
let beamFade: CanvasTexture | null = null;
function fadeTexture(): CanvasTexture {
  if (beamFade) return beamFade;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 64, 0, 0);
  g.addColorStop(0, '#000');
  g.addColorStop(0.55, '#555');
  g.addColorStop(1, '#fff');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1, 64);
  beamFade = new CanvasTexture(canvas);
  return beamFade;
}

function beamPose(x: number): { position: [number, number, number]; quaternion: Quaternion } {
  const from = new Vector3(x, HEADLIGHT_Y, HEADLIGHT_Z);
  const dir = new Vector3(...aimOf(x)).sub(from).normalize();
  // ConeGeometry's apex is at +y: point +y back at the lamp, the open base along the aim.
  const quaternion = new Quaternion().setFromUnitVectors(up, dir.clone().negate());
  const mid = from.addScaledVector(dir, BEAM_LENGTH / 2);
  return { position: [mid.x, mid.y, mid.z], quaternion };
}

function Headlight({ x }: { x: number }) {
  const light = useRef<SpotLight>(null);
  const target = useRef(new Object3D());
  useFrame(() => {
    if (light.current) light.current.intensity = HEADLIGHT_MAX * garageRuntime.launch.headlights;
  });
  useLayoutEffect(() => {
    // Aimed through the door at the bench, so the cold light reaches the warm corner as the door rises.
    target.current.position.set(...aimOf(x));
    target.current.updateMatrixWorld();
    if (light.current) light.current.target = target.current;
  }, [x]);
  return (
    <group name="headlight">
      <spotLight
        ref={light}
        position={[x, HEADLIGHT_Y, HEADLIGHT_Z]}
        color={HEADLIGHTS}
        intensity={HEADLIGHT_MAX * garageRuntime.launch.headlights}
        angle={0.6}
        penumbra={0.6}
        distance={12}
        decay={1.6}
      />
    </group>
  );
}

/**
 * Two light temperatures: the warm tungsten lamp over the bench and the cold
 * DeLorean headlights behind the door. The environment map is a tiny scene of
 * the same two lights (Lightformers, nothing downloaded) for the car's paint.
 */
/** Both headlight beams in one instanced mesh (draw calls are the garage budget), one shared opacity. */
function Beams({ xs }: { xs: readonly number[] }) {
  const mesh = useRef<InstancedMesh>(null);
  const material = useRef<MeshBasicMaterial>(null);
  const fade = useMemo(() => fadeTexture(), []);
  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    xs.forEach((x, i) => {
      const { position, quaternion } = beamPose(x);
      m.setMatrixAt(i, new Matrix4().compose(new Vector3(...position), quaternion, new Vector3(1, 1, 1)));
    });
    m.instanceMatrix.needsUpdate = true;
  }, [xs]);
  useFrame(() => {
    if (material.current) material.current.opacity = BEAM_REST + (BEAM_FULL - BEAM_REST) * garageRuntime.launch.spill;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, xs.length]} frustumCulled={false}>
      <coneGeometry args={[BEAM_RADIUS, BEAM_LENGTH, 24, 1, true]} />
      <meshBasicMaterial
        ref={material}
        color={HEADLIGHTS}
        alphaMap={fade}
        transparent
        opacity={BEAM_REST}
        blending={AdditiveBlending}
        depthWrite={false}
        side={DoubleSide}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

const BEAM_XS = HEADLIGHT_X.map((x) => CAR_SPOT.x + x);

/** The headlights' light entering the garage through the opening door (a spot, no shadow). */
function Spill() {
  const light = useRef<SpotLight>(null);
  const target = useRef(new Object3D());
  useLayoutEffect(() => {
    target.current.position.set(...SPILL_AIM);
    target.current.updateMatrixWorld();
    if (light.current) light.current.target = target.current;
  }, []);
  useFrame(() => {
    if (light.current) light.current.intensity = SPILL_MAX * garageRuntime.launch.spill;
  });
  return <spotLight ref={light} position={SPILL_POS} color={HEADLIGHTS} intensity={0} angle={0.8} penumbra={0.85} distance={9} decay={1.2} />;
}

export function Lights({ tier }: { tier: Tier }) {
  const lamp = useRef<PointLight>(null);
  const bulb = useRef<MeshBasicMaterial>(null);
  useFrame(() => {
    const on = garageRuntime.launch.lamp;
    if (lamp.current) lamp.current.intensity = LAMP_INTENSITY * on;
    if (bulb.current) bulb.current.color.set(LAMP).multiplyScalar(on);
  });
  return (
    <group name="lights">
      <hemisphereLight args={['#3b3f45', '#1a1816', 0.35]} />
      <pointLight
        ref={lamp}
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
        <meshBasicMaterial ref={bulb} color={LAMP} />
      </mesh>
      {HEADLIGHT_X.map((x) => (
        <Headlight key={x} x={CAR_SPOT.x + x} />
      ))}
      <Beams xs={BEAM_XS} />
      <Spill />
      <Environment resolution={32} frames={1}>
        <Lightformer form="rect" color={LAMP} intensity={2} position={[-2, 3, 2]} scale={[3, 1, 1]} />
        <Lightformer form="rect" color={HEADLIGHTS} intensity={3} position={[3, 1, -4]} scale={[4, 1.5, 1]} />
      </Environment>
    </group>
  );
}
