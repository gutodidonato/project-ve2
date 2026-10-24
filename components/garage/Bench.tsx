'use client';

import { useLayoutEffect, useRef } from 'react';
import { Matrix4, Quaternion, Vector3, type InstancedMesh } from 'three';
import { BENCH_TOP_Y, DOOR } from '@/lib/garage/scene';

const CONCRETE = '#3A403F';
const WALL = '#454b49';
const WOOD = '#5a3b26';
const MASONITE = '#7a5a3e';
const STEEL = '#8d918f';
const HANDLE = '#9a2f22';

const BENCH = { x0: -1.6, x1: 1.2, z0: -0.5, z1: 0.32, thickness: 0.05 };
const BENCH_W = BENCH.x1 - BENCH.x0;
const BENCH_CX = (BENCH.x0 + BENCH.x1) / 2;
const BENCH_CZ = (BENCH.z0 + BENCH.z1) / 2;

/** Wall tools on the pegboard: x, y, handle (w, h), head (w, h), tilt. One mesh for the handles, one for the heads. */
const TOOLS: readonly { x: number; y: number; handle: [number, number]; head: [number, number]; tilt: number }[] = [
  { x: 0.25, y: 1.75, handle: [0.035, 0.22], head: [0.12, 0.05], tilt: 0 },
  { x: 0.5, y: 1.78, handle: [0.03, 0.14], head: [0.022, 0.16], tilt: 0 },
  { x: 0.72, y: 1.72, handle: [0.028, 0.12], head: [0.012, 0.18], tilt: 0.08 },
  { x: 0.95, y: 1.8, handle: [0.04, 0.12], head: [0.03, 0.2], tilt: -0.1 },
];

const m4 = new Matrix4();
const q = new Quaternion();
const axisZ = new Vector3(0, 0, 1);
const at = new Vector3();
const size = new Vector3();

/** Place unit boxes: one instance per item, positioned, turned about z and scaled. */
function placeBoxes(mesh: InstancedMesh | null, items: readonly { p: [number, number, number]; s: [number, number, number]; tilt?: number }[]) {
  if (!mesh) return;
  items.forEach((it, i) => mesh.setMatrixAt(i, m4.compose(at.set(...it.p), q.setFromAxisAngle(axisZ, it.tilt ?? 0), size.set(...it.s))));
  mesh.instanceMatrix.needsUpdate = true;
}

/** Room shell: the concrete floor, and the walls (back wall around the door opening, the left wall) as one instanced mesh. */
function Room() {
  const walls = useRef<InstancedMesh>(null);
  const wallHeight = 3.2;
  const leftWidth = DOOR.x0 + 3;
  useLayoutEffect(() => {
    placeBoxes(walls.current, [
      // Back wall, left of the door; above it; right of it.
      { p: [DOOR.x0 - leftWidth / 2, wallHeight / 2, DOOR.z - 0.05], s: [leftWidth, wallHeight, 0.1] },
      { p: [(DOOR.x0 + DOOR.x1) / 2, (DOOR.height + wallHeight) / 2, DOOR.z - 0.05], s: [DOOR.x1 - DOOR.x0, wallHeight - DOOR.height, 0.1] },
      { p: [DOOR.x1 + 0.8, wallHeight / 2, DOOR.z - 0.05], s: [1.6, wallHeight, 0.1] },
      // Left wall.
      { p: [-3, wallHeight / 2, 1.5], s: [0.1, wallHeight, 4] },
    ]);
  }, [leftWidth]);
  return (
    <group name="room">
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.2, 0, -1.5]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.95} />
      </mesh>
      <instancedMesh ref={walls} args={[undefined, undefined, 4]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={WALL} roughness={0.9} />
      </instancedMesh>
    </group>
  );
}

/** The workbench: dark wood top on four legs, and the pegboard of tools on the wall behind it. */
export function Bench() {
  const legH = BENCH_TOP_Y - BENCH.thickness;
  const legs = useRef<InstancedMesh>(null);
  const handles = useRef<InstancedMesh>(null);
  const heads = useRef<InstancedMesh>(null);

  // Draw calls are the garage budget: the four legs and the tool parts are three instanced meshes.
  useLayoutEffect(() => {
    placeBoxes(
      legs.current,
      [BENCH.x0 + 0.08, BENCH.x1 - 0.08].flatMap((x) =>
        [BENCH.z0 + 0.08, BENCH.z1 - 0.08].map((z) => ({ p: [x, legH / 2, z] as [number, number, number], s: [0.07, legH, 0.07] as [number, number, number] })),
      ),
    );
    const z = BENCH.z0 + 0.03;
    const turn = (t: (typeof TOOLS)[number], dy: number): [number, number, number] => [t.x - Math.sin(t.tilt) * dy, t.y + Math.cos(t.tilt) * dy, z];
    placeBoxes(handles.current, TOOLS.map((t) => ({ p: turn(t, -t.handle[1] / 2), s: [t.handle[0], t.handle[1], 0.025], tilt: t.tilt })));
    placeBoxes(heads.current, TOOLS.map((t) => ({ p: turn(t, t.head[1] / 2), s: [t.head[0], t.head[1], 0.02], tilt: t.tilt })));
  }, [legH]);

  return (
    <group name="bench">
      <Room />
      <mesh position={[BENCH_CX, BENCH_TOP_Y - BENCH.thickness / 2, BENCH_CZ]} castShadow receiveShadow>
        <boxGeometry args={[BENCH_W, BENCH.thickness, BENCH.z1 - BENCH.z0]} />
        <meshStandardMaterial color={WOOD} roughness={0.8} />
      </mesh>
      <instancedMesh ref={legs} args={[undefined, undefined, 4]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={WOOD} roughness={0.85} />
      </instancedMesh>
      <mesh position={[0.1, 1.75, BENCH.z0 + 0.01]}>
        <boxGeometry args={[2.2, 1.0, 0.02]} />
        <meshStandardMaterial color={MASONITE} roughness={0.9} />
      </mesh>
      <instancedMesh ref={handles} args={[undefined, undefined, TOOLS.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={HANDLE} roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, TOOLS.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={STEEL} metalness={0.7} roughness={0.35} />
      </instancedMesh>
    </group>
  );
}
