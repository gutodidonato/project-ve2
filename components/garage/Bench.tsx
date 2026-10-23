'use client';

import { BENCH_TOP_Y, DOOR } from '@/lib/garage/scene';

const CONCRETE = '#3A403F';
const WALL = '#454b49';
const WOOD = '#5a3b26';
const MASONITE = '#7a5a3e';
const STEEL = '#8d918f';
const HANDLE = '#9a2f22';

const BENCH = { x0: -1.6, x1: 1.2, z0: -0.5, z1: 0.2, thickness: 0.05 };
const BENCH_W = BENCH.x1 - BENCH.x0;
const BENCH_CX = (BENCH.x0 + BENCH.x1) / 2;
const BENCH_CZ = (BENCH.z0 + BENCH.z1) / 2;

/** Room shell: concrete floor, back wall with the door opening, the left wall, and the driveway outside. */
function Room() {
  const wallHeight = 3.2;
  const leftWidth = DOOR.x0 + 3;
  return (
    <group name="room">
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.2, 0, -1.5]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.95} />
      </mesh>
      {/* Back wall, left of the door. */}
      <mesh position={[DOOR.x0 - leftWidth / 2, wallHeight / 2, DOOR.z - 0.05]} receiveShadow>
        <boxGeometry args={[leftWidth, wallHeight, 0.1]} />
        <meshStandardMaterial color={WALL} roughness={0.9} />
      </mesh>
      {/* Above the door, and right of it. */}
      <mesh position={[(DOOR.x0 + DOOR.x1) / 2, (DOOR.height + wallHeight) / 2, DOOR.z - 0.05]}>
        <boxGeometry args={[DOOR.x1 - DOOR.x0, wallHeight - DOOR.height, 0.1]} />
        <meshStandardMaterial color={WALL} roughness={0.9} />
      </mesh>
      <mesh position={[DOOR.x1 + 0.8, wallHeight / 2, DOOR.z - 0.05]}>
        <boxGeometry args={[1.6, wallHeight, 0.1]} />
        <meshStandardMaterial color={WALL} roughness={0.9} />
      </mesh>
      {/* Left wall. */}
      <mesh position={[-3, wallHeight / 2, 1.5]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[4, wallHeight, 0.1]} />
        <meshStandardMaterial color={WALL} roughness={0.9} />
      </mesh>
    </group>
  );
}

/** One wall tool on the pegboard: a handle and a steel head. */
function Tool({ x, y, handle, head, tilt = 0 }: { x: number; y: number; handle: [number, number]; head: [number, number]; tilt?: number }) {
  return (
    <group position={[x, y, BENCH.z0 + 0.03]} rotation={[0, 0, tilt]}>
      <mesh position={[0, -handle[1] / 2, 0]}>
        <boxGeometry args={[handle[0], handle[1], 0.025]} />
        <meshStandardMaterial color={HANDLE} roughness={0.6} />
      </mesh>
      <mesh position={[0, head[1] / 2, 0]}>
        <boxGeometry args={[head[0], head[1], 0.02]} />
        <meshStandardMaterial color={STEEL} metalness={0.7} roughness={0.35} />
      </mesh>
    </group>
  );
}

/** The workbench: dark wood top on four legs, and the pegboard of tools on the wall behind it. */
export function Bench() {
  const legH = BENCH_TOP_Y - BENCH.thickness;
  return (
    <group name="bench">
      <Room />
      <mesh position={[BENCH_CX, BENCH_TOP_Y - BENCH.thickness / 2, BENCH_CZ]} castShadow receiveShadow>
        <boxGeometry args={[BENCH_W, BENCH.thickness, BENCH.z1 - BENCH.z0]} />
        <meshStandardMaterial color={WOOD} roughness={0.8} />
      </mesh>
      {[BENCH.x0 + 0.08, BENCH.x1 - 0.08].flatMap((x) =>
        [BENCH.z0 + 0.08, BENCH.z1 - 0.08].map((z) => (
          <mesh key={`${x}:${z}`} position={[x, legH / 2, z]}>
            <boxGeometry args={[0.07, legH, 0.07]} />
            <meshStandardMaterial color={WOOD} roughness={0.85} />
          </mesh>
        )),
      )}
      <mesh position={[0.1, 1.75, BENCH.z0 + 0.01]}>
        <boxGeometry args={[2.2, 1.0, 0.02]} />
        <meshStandardMaterial color={MASONITE} roughness={0.9} />
      </mesh>
      <Tool x={0.25} y={1.75} handle={[0.035, 0.22]} head={[0.12, 0.05]} />
      <Tool x={0.5} y={1.78} handle={[0.03, 0.14]} head={[0.022, 0.16]} />
      <Tool x={0.72} y={1.72} handle={[0.028, 0.12]} head={[0.012, 0.18]} tilt={0.08} />
      <Tool x={0.95} y={1.8} handle={[0.04, 0.12]} head={[0.03, 0.2]} tilt={-0.1} />
    </group>
  );
}
