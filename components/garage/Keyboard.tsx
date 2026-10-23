'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { CanvasTexture, Matrix4, SRGBColorSpace, Vector3, type InstancedMesh, type PerspectiveCamera } from 'three';
import { framingFor, type Framing } from '@/lib/garage/camera';
import { ACTION_CODES, KEY_ROWS, PORTRAIT_CODES, codeToAction, legendOf } from '@/lib/garage/keys';
import { garageRuntime } from '@/lib/garage/runtime';
import { garageSound } from '@/lib/garage/sound';
import { BENCH_TOP_Y, GLASS } from '@/lib/garage/scene';
import type { GarageAction } from '@/lib/garage/state';

const BEIGE = '#D6CBB0';
const BASE = '#bdb193';
const LEGEND = '#4A3F2C';
const LEGEND_ACTION = '#FFB000';
const PRESS_MS = 120;
const PRESS_DEPTH = 0.004;

interface Cap {
  code: string;
  x: number;
  z: number;
  width: number;
}

interface Layout {
  caps: Cap[];
  cap: { depth: number; height: number };
  base: { width: number; depth: number };
  /** Tilt of the whole board towards the camera (phones), radians about x. */
  tilt: number;
  z: number;
}

/** A 1988 keyboard on the bench; on phones, four big keys on a stand. */
function layoutFor(framing: Framing): Layout {
  if (framing === 'portrait') {
    const pitch = 0.085;
    return {
      caps: PORTRAIT_CODES.map((code, i) => ({ code, x: (i - 1.5) * pitch, z: 0, width: 0.072 })),
      cap: { depth: 0.072, height: 0.03 },
      base: { width: 0.36, depth: 0.1 },
      tilt: 0.7,
      z: 0.17,
    };
  }
  const pitch = 0.03;
  const stagger = [0, 0.008, 0.013, 0.022, 0];
  const caps = KEY_ROWS.flatMap((row, r) =>
    row.map((code, i) => {
      const width = code === 'Space' ? pitch * 5.5 : pitch * 0.86;
      const x = code === 'Space' ? 0 : (i - (row.length - 1) / 2) * pitch + stagger[r];
      return { code, x, z: (r - 2) * pitch, width };
    }),
  );
  return { caps, cap: { depth: pitch * 0.86, height: 0.012 }, base: { width: 0.39, depth: 0.17 }, tilt: 0, z: 0.17 };
}

/** One canvas texture with every legend, laid out like the caps (it sits on top of them). */
function legendTexture(layout: Layout): CanvasTexture {
  const scale = 2048 / layout.base.width;
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = Math.round(layout.base.depth * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const cap of layout.caps) {
    const label = legendOf(cap.code);
    if (label === '') continue;
    const action = codeToAction(cap.code) !== null;
    const size = layout.cap.depth * scale * (label.length > 1 ? 0.32 : 0.48);
    ctx.font = `500 ${size}px "IBM Plex Sans", "Segoe UI", sans-serif`;
    ctx.fillStyle = action ? LEGEND_ACTION : LEGEND;
    ctx.fillText(label, (cap.x + layout.base.width / 2) * scale, (cap.z + layout.base.depth / 2) * scale);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

const m4 = new Matrix4();
const v3 = new Vector3();
const ACTION_SET = new Set(Object.values(ACTION_CODES));

/**
 * The keyboard: every cap in one instanced mesh, the legends in one decal.
 * Caps sink for 120 ms when their key is pressed (the real keyboard or a
 * click); clicking a menu key acts like typing it. Projects the action keys
 * for the e2e hook.
 */
export function Keyboard({ act }: { act(a: GarageAction): void }) {
  const size = useThree((s) => s.size);
  const framing = framingFor(size.width, size.height);
  const layout = useMemo(() => layoutFor(framing), [framing]);
  const texture = useMemo(() => legendTexture(layout), [layout]);
  const caps = useRef<InstancedMesh>(null);
  const sunk = useRef<boolean[]>([]);

  const topY = BENCH_TOP_Y + 0.02;
  const capY = layout.cap.height / 2;

  const place = (i: number, down: boolean) => {
    const cap = layout.caps[i];
    caps.current?.setMatrixAt(i, m4.makeTranslation(cap.x, capY - (down ? PRESS_DEPTH : 0), cap.z).scale(v3.set(cap.width, 1, 1)));
  };

  useLayoutEffect(() => {
    sunk.current = layout.caps.map(() => false);
    layout.caps.forEach((_, i) => place(i, false));
    if (caps.current) caps.current.instanceMatrix.needsUpdate = true;
    return () => texture.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- place reads the same layout
  }, [layout, texture]);

  useFrame(({ camera }) => {
    const mesh = caps.current;
    if (!mesh) return;
    const now = performance.now();
    let dirty = false;
    layout.caps.forEach((cap, i) => {
      const t = garageRuntime.pressed.get(cap.code);
      const down = t !== undefined && now - t < PRESS_MS;
      if (down !== sunk.current[i]) {
        sunk.current[i] = down;
        place(i, down);
        dirty = true;
      }
    });
    if (dirty) mesh.instanceMatrix.needsUpdate = true;

    // Projected boxes of the action keys (world corners of each cap).
    mesh.updateMatrixWorld();
    const rects: typeof garageRuntime.keyRects = [];
    layout.caps.forEach((cap, i) => {
      if (!ACTION_SET.has(cap.code)) return;
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      for (const sx of [-0.5, 0.5]) {
        for (const sy of [-0.5, 0.5]) {
          for (const sz of [-0.5, 0.5]) {
            mesh.getMatrixAt(i, m4);
            v3.set(sx, sy * layout.cap.height, sz * layout.cap.depth).applyMatrix4(m4).applyMatrix4(mesh.matrixWorld);
            v3.project(camera as PerspectiveCamera);
            const px = ((v3.x + 1) / 2) * size.width;
            const py = ((1 - v3.y) / 2) * size.height;
            x0 = Math.min(x0, px);
            x1 = Math.max(x1, px);
            y0 = Math.min(y0, py);
            y1 = Math.max(y1, py);
          }
        }
      }
      rects.push({ code: cap.code, rect: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 } });
    });
    garageRuntime.keyRects = rects;
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.instanceId === undefined) return;
    e.stopPropagation();
    const code = layout.caps[e.instanceId].code;
    garageRuntime.pressed.set(code, performance.now());
    garageSound().key();
    const action = codeToAction(code);
    if (action !== null) act(action);
  };

  return (
    <group name="keyboard" position={[GLASS.center[0], topY, layout.z]} rotation={[layout.tilt, 0, 0]}>
      <mesh position={[0, -0.006, 0]} castShadow receiveShadow>
        <boxGeometry args={[layout.base.width, 0.016, layout.base.depth]} />
        <meshStandardMaterial color={BASE} roughness={0.75} />
      </mesh>
      <instancedMesh
        key={framing}
        ref={caps}
        args={[undefined, undefined, layout.caps.length]}
        onClick={onClick}
        onPointerOver={(e) => {
          if (e.instanceId !== undefined && codeToAction(layout.caps[e.instanceId].code) !== null) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => (document.body.style.cursor = '')}
      >
        <boxGeometry args={[1, layout.cap.height, layout.cap.depth]} />
        <meshStandardMaterial color={BEIGE} roughness={0.6} />
      </instancedMesh>
      <mesh position={[0, layout.cap.height + 0.0005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[layout.base.width, layout.base.depth]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
