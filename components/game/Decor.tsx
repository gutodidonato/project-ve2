'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { Color, DoubleSide, Matrix4, Quaternion, Shape, Vector3, type InstancedMesh } from 'three';
import { COLORS, buildDecor, type BoxDecor, type ConeDecor, type Point } from '@/lib/game/decor';
import { SignLabel } from './SignLabel';

export interface Company {
  name: string;
  /** Start year, shown under the name. */
  since: string;
}

const FILL = '#0c0a22';
const Y_AXIS = new Vector3(0, 1, 0);

/** Corner pairs of a box's 12 edges, corners indexed by bits (x, y, z). */
const BOX_EDGES: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [2, 3], [4, 5], [6, 7], // along z
  [0, 2], [1, 3], [4, 6], [5, 7], // along y
  [0, 4], [1, 5], [2, 6], [3, 7], // along x
];

type Vec3 = readonly [number, number, number];
/** A colored line segment, in world space. */
type Segment = readonly [Vec3, Vec3, string];

function boxSegments(b: BoxDecor): Segment[] {
  const corner = (i: number): Vec3 => [
    b.x + (i & 4 ? b.w / 2 : -b.w / 2),
    i & 2 ? b.h : 0,
    b.z + (i & 1 ? b.d / 2 : -b.d / 2),
  ];
  return BOX_EDGES.map(([a, c]) => [corner(a), corner(c), b.color]);
}

/** Roll-up door slats on the garage's south face (the side facing the oficina zone and the camera). */
function doorSegments(g: BoxDecor): Segment[] {
  const half = g.w * 0.3;
  const z = g.z + g.d / 2;
  return [0.7, 1.4, 2.1, 2.8, 3.5].map((y) => [[g.x - half, y, z], [g.x + half, y, z], g.color]);
}

/** Every outline as one vertex-colored line list (a single draw call). */
function lineBuffers(segments: readonly Segment[]): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(segments.length * 2 * 3);
  const colors = new Float32Array(positions.length);
  const color = new Color();
  segments.forEach(([from, to, hex], i) => {
    color.set(hex);
    positions.set([...from, ...to], i * 6);
    colors.set([color.r, color.g, color.b, color.r, color.g, color.b], i * 6);
  });
  return { positions, colors };
}

/** Dark instanced box faces, so the wireframe buildings occlude what is behind them. */
function BoxFills({ boxes }: { boxes: readonly BoxDecor[] }) {
  const ref = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new Matrix4();
    const q = new Quaternion();
    boxes.forEach((b, i) => {
      // Slightly inset so the outlines never z-fight with the faces.
      m.compose(new Vector3(b.x, b.h / 2, b.z), q, new Vector3(b.w * 0.995, b.h * 0.995, b.d * 0.995));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [boxes]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, boxes.length]}>
      <boxGeometry />
      <meshBasicMaterial color={FILL} />
    </instancedMesh>
  );
}

function Outlines({ segments }: { segments: readonly Segment[] }) {
  const { positions, colors } = useMemo(() => lineBuffers(segments), [segments]);
  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <lineBasicMaterial vertexColors transparent opacity={0.85} />
    </lineSegments>
  );
}

/** Low wireframe pyramids scattered between the zones (instanced). */
function Cones({ cones }: { cones: readonly ConeDecor[] }) {
  const ref = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new Matrix4();
    const q = new Quaternion();
    const color = new Color();
    cones.forEach((c, i) => {
      q.setFromAxisAngle(Y_AXIS, c.rotY);
      m.compose(new Vector3(c.x, c.h / 2, c.z), q, new Vector3(c.h, c.h, c.h));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, color.set(c.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [cones]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, cones.length]}>
      <coneGeometry args={[0.6, 1, 4]} />
      <meshBasicMaterial wireframe transparent opacity={0.6} />
    </instancedMesh>
  );
}

/** Retro sun bands (bottom to top, as fractions of the radius): gaps widen toward the ground. */
const SUN_BANDS: ReadonlyArray<readonly [number, number]> = [
  [0.02, 0.08],
  [0.13, 0.21],
  [0.27, 0.37],
  [0.43, 0.55],
  [0.6, 1],
];
const SUN_TOP = new Color(COLORS.sun);
const SUN_BOTTOM = new Color(COLORS.magenta);

function bandShape(radius: number, from: number, to: number): Shape {
  const y0 = from * radius;
  const y1 = to * radius;
  const a0 = Math.asin(y0 / radius);
  const a1 = Math.asin(y1 / radius);
  const shape = new Shape();
  shape.moveTo(-Math.cos(a0) * radius, y0);
  shape.lineTo(Math.cos(a0) * radius, y0);
  shape.absarc(0, 0, radius, a0, a1, false);
  shape.lineTo(-Math.cos(a1) * radius, y1);
  shape.absarc(0, 0, radius, Math.PI - a1, Math.PI - a0, false);
  return shape;
}

/** Striped half-sun standing beside the contato lookout. */
function HalfSun({ x, z, radius, rotY }: Point & { radius: number; rotY: number }) {
  const bands = useMemo(
    () =>
      SUN_BANDS.map(([from, to]) => ({
        key: `${from}`,
        shape: bandShape(radius, from, to),
        color: `#${SUN_BOTTOM.clone().lerp(SUN_TOP, (from + to) / 2).getHexString()}`,
      })),
    [radius],
  );
  return (
    <group position={[x, 0, z]} rotation-y={rotY}>
      {bands.map((band) => (
        <mesh key={band.key}>
          <shapeGeometry args={[band.shape, 24]} />
          <meshBasicMaterial color={band.color} side={DoubleSide} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/** The four companies on posts along an arc next to the experiência zone. */
function Signposts({ points, companies }: { points: readonly Point[]; companies: readonly Company[] }) {
  return (
    <>
      {companies.slice(0, points.length).map((company, i) => {
        const { x, z } = points[i];
        return (
          <group key={company.name} position={[x, 0, z]}>
            <mesh position-y={1.5}>
              <boxGeometry args={[0.15, 3, 0.15]} />
              <meshBasicMaterial color={COLORS.post} />
            </mesh>
            <SignLabel
              text={company.name.toUpperCase()}
              sub={company.since}
              color={COLORS.cyan}
              size={0.42}
              position={[0, 3.6, 0]}
            />
          </group>
        );
      })}
    </>
  );
}

/** Deterministic hub scenery (seeded layout from `lib/game/decor`). */
export function Decor({ companies }: { companies: readonly Company[] }) {
  const layout = useMemo(() => buildDecor(), []);
  const solids = useMemo(() => [...layout.towers, ...layout.pylons], [layout]);
  const segments = useMemo(
    () => [...solids, layout.garage].flatMap(boxSegments).concat(doorSegments(layout.garage)),
    [solids, layout],
  );
  return (
    <>
      <BoxFills boxes={solids} />
      <Outlines segments={segments} />
      <Cones cones={layout.cones} />
      <HalfSun {...layout.sun} />
      <Signposts points={layout.signposts} companies={companies} />
    </>
  );
}
