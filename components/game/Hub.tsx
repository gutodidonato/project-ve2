'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import {
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  type WebGLRenderer,
} from 'three';

export const NIGHT = '#0a0716';
const GROUND = '#0d0820';
const MAGENTA = '#ff3ea5';
const CYAN = '#3ee8ff';
/** Neon border half-size; the car is clamped at BOUND = 76 inside it. */
const BORDER = 78;
const BORDER_WIDTH = 0.3;
const BORDER_HEIGHT = 0.14;
/** How strongly the neon room shows in the car's PBR reflections. */
const ENV_INTENSITY = 0.45;

/** [x, z, sizeX, sizeZ] of the four border strips. */
const BORDER_STRIPS: ReadonlyArray<readonly [number, number, number, number]> = [
  [0, -BORDER, BORDER * 2 + BORDER_WIDTH, BORDER_WIDTH],
  [0, BORDER, BORDER * 2 + BORDER_WIDTH, BORDER_WIDTH],
  [-BORDER, 0, BORDER_WIDTH, BORDER * 2],
  [BORDER, 0, BORDER_WIDTH, BORDER * 2],
];

/**
 * A tiny procedural "neon room" (magenta and cyan strips on a night background)
 * prefiltered into an environment map, so the car's metal and clear coat have
 * something on-theme to reflect. No HDR files, nothing downloaded. Installs it
 * as `scene.environment` and returns the cleanup that removes and frees it.
 */
function installNeonEnvironment(gl: WebGLRenderer, scene: Scene): () => void {
  const room = new Scene();
  room.background = new Color(NIGHT);
  const geometry = new PlaneGeometry(1, 1);
  const materials: MeshBasicMaterial[] = [];
  const panel = (color: string, power: number, position: [number, number, number], w: number, h: number) => {
    const material = new MeshBasicMaterial({ color: new Color(color).multiplyScalar(power), side: DoubleSide });
    materials.push(material);
    const mesh = new Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.set(w, h, 1);
    mesh.lookAt(0, 0, 0);
    room.add(mesh);
  };
  panel(MAGENTA, 3, [-5, 2, -6], 9, 2.5);
  panel(CYAN, 2.2, [6, 2.5, 5], 9, 2);
  panel('#7a5cff', 1.2, [0, 9, 0], 12, 12);
  panel('#ffffff', 1.6, [0, 6, 7], 6, 0.8);

  const pmrem = new PMREMGenerator(gl);
  const target = pmrem.fromScene(room, 0.04);
  pmrem.dispose();
  geometry.dispose();
  for (const material of materials) material.dispose();

  scene.environment = target.texture;
  scene.environmentIntensity = ENV_INTENSITY;
  return () => {
    if (scene.environment === target.texture) scene.environment = null;
    target.dispose();
  };
}

function NeonEnvironment() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => installNeonEnvironment(gl, scene), [gl, scene]);

  return null;
}

/** Sky, fog, lights and the ground of the hub: night violet, magenta grid, neon cyan border. */
export function Hub() {
  return (
    <>
      <color attach="background" args={[NIGHT]} />
      <fog attach="fog" args={[NIGHT, 40, 115]} />
      <ambientLight color="#7a5cff" intensity={0.6} />
      <directionalLight color={MAGENTA} intensity={1.4} position={[-4, 6, -12]} />
      <directionalLight color={CYAN} intensity={0.8} position={[6, 5, 6]} />
      <NeonEnvironment />

      {/* Drawn first and without depth writes: the grid, rings and discs just above it
          never z-fight with it (some GPUs and SwiftShader dropped grid lines). */}
      <mesh rotation-x={-Math.PI / 2} renderOrder={-1}>
        <planeGeometry args={[170, 170]} />
        <meshBasicMaterial color={GROUND} depthWrite={false} />
      </mesh>
      <gridHelper
        args={[160, 80, MAGENTA, '#33205c']}
        position-y={0.01}
        material-transparent
        material-opacity={0.55}
        material-depthWrite={false}
      />
      {BORDER_STRIPS.map(([x, z, sx, sz]) => (
        <mesh key={`${x}:${z}`} position={[x, BORDER_HEIGHT / 2, z]}>
          <boxGeometry args={[sx, BORDER_HEIGHT, sz]} />
          <meshBasicMaterial color={CYAN} />
        </mesh>
      ))}
    </>
  );
}
