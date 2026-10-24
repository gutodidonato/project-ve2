'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, type PerspectiveCamera } from 'three';
import { BENCH_POSE, CAR_POSE, framingFor, screenPose, type Pose } from '@/lib/garage/camera';
import { garageRuntime } from '@/lib/garage/runtime';
import { GLASS } from '@/lib/garage/scene';
import { placeSurface } from '@/lib/garage/surface';
import { useGameStore } from '@/lib/store';

/** Half-life of the camera ease, seconds: the fly into the monitor settles in about 0.9 s. */
const HALF_LIFE = 0.11;
const ARRIVED = 0.005;

const corner = new Vector3();
const goalPos = new Vector3();
const goalTarget = new Vector3();
/** Glass corners in GlassQuad order: top-left, top-right, bottom-right, bottom-left. */
const CORNERS: readonly [number, number][] = [
  [-1, 1],
  [1, 1],
  [1, -1],
  [-1, -1],
];

function mix(a: Pose, b: Pose, t: number): Pose {
  const m = (u: readonly number[], v: readonly number[]) => u.map((x, i) => x + (v[i] - x) * t) as [number, number, number];
  return { position: m(a.position, b.position), target: m(a.target, b.target), fov: a.fov + (b.fov - a.fov) * t };
}

/** The pose the current view asks for. */
function goalPose(width: number, height: number): Pose {
  const framing = framingFor(width, height);
  const { view } = useGameStore.getState().garage;
  if (view === 'screen') return screenPose(framing, width / height);
  if (view === 'launch' && garageRuntime.launchStart !== null) {
    return mix(BENCH_POSE[framing], CAR_POSE, garageRuntime.launch.camera);
  }
  return BENCH_POSE[framing];
}

/**
 * Eases the camera to the pose of the current view (snaps on the first frame
 * and always under reduced motion), then projects the glass corners for the
 * screen overlay and the e2e hook.
 */
export function GarageCamera() {
  const placed = useRef(false);
  const target = useRef(new Vector3());
  const reduced = useRef(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduced.current = query.matches;
    const onChange = () => (reduced.current = query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useFrame(({ camera, size }, dt) => {
    const cam = camera as PerspectiveCamera;
    const { view } = useGameStore.getState().garage;
    const goal = goalPose(size.width, size.height);
    goalPos.set(...goal.position);
    goalTarget.set(...goal.target);

    if (!placed.current || reduced.current) {
      cam.position.copy(goalPos);
      target.current.copy(goalTarget);
      cam.fov = goal.fov;
      placed.current = true;
    } else {
      const k = 1 - 0.5 ** (dt / HALF_LIFE);
      cam.position.lerp(goalPos, k);
      target.current.lerp(goalTarget, k);
      cam.fov += (goal.fov - cam.fov) * k;
    }
    cam.lookAt(target.current);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();

    garageRuntime.camera = [cam.position.x, cam.position.y, cam.position.z];
    garageRuntime.arrived =
      cam.position.distanceTo(goalPos) < ARRIVED &&
      target.current.distanceTo(goalTarget) < ARRIVED &&
      Math.abs(cam.fov - goal.fov) < 0.05;

    const [gx, gy, gz] = GLASS.center;
    let inFront = true;
    CORNERS.forEach(([sx, sy], i) => {
      corner.set(gx + (sx * GLASS.width) / 2, gy + (sy * GLASS.height) / 2, gz).project(cam);
      if (corner.z > 1 || corner.z < -1) inFront = false;
      const q = garageRuntime.glassQuad[i];
      q[0] = ((corner.x + 1) / 2) * size.width;
      q[1] = ((1 - corner.y) / 2) * size.height;
    });
    const xs = garageRuntime.glassQuad.map((q) => q[0]);
    const ys = garageRuntime.glassQuad.map((q) => q[1]);
    const x0 = Math.min(...xs);
    const y0 = Math.min(...ys);
    garageRuntime.glassRect = { x: x0, y: y0, width: Math.max(...xs) - x0, height: Math.max(...ys) - y0 };
    garageRuntime.glassInFront = inFront;

    // Same frame as the canvas: the DOM screen never lags behind the glass.
    placeSurface(garageRuntime.surface, view, garageRuntime, size.width, size.height);
  });

  return null;
}
