// Asset pipeline: turns the 29 MB Sketchfab export in assets-src/ into the
// optimized car model served from public/models/.
//
//   npm run assets            build public/models/delorean.glb (+ copy the HUD font)
//   npm run assets -- --inspect   print the node table with world bounding boxes, write nothing
//
// Model credit: "DeLorean DMC12 || Retro wave art" by dark_igorek, CC BY 4.0.
// The credit lives in asset.extras of the source and is copied verbatim to the output.

import { copyFileSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
  dedup,
  flatten,
  getBounds,
  join,
  meshopt,
  prune,
  resample,
  simplify,
  textureCompress,
  weld,
} from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'assets-src/delorean.source.glb');
const OUT = resolve(ROOT, 'public/models/delorean.glb');
const FONT_SRC = resolve(
  ROOT,
  'node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff',
);
const FONT_OUT = resolve(ROOT, 'public/fonts/ibm-plex-mono-500.woff');

/** Size budget for the output GLB (1.5 MiB). */
const MAX_BYTES = 1_572_864;
/** Texture size limits tried in order until the output fits the budget. */
const TEXTURE_SIZES = [1024, 512];
/**
 * The source car is ~415k triangles / ~244k vertices, which alone is ~2.9 MiB after
 * meshopt (textures are only ~0.15-0.4 MiB), so texture downscaling cannot reach the
 * budget. Geometry is simplified to keep ~35% of the triangles (meshopt simplifier,
 * seams preserved by the algorithm). At the game camera (24 m up, fov 48) the car is
 * visually indistinguishable from the original; raise the ratio if more detail is
 * wanted and the budget allows.
 */
const SIMPLIFY_RATIO = 0.35;
/** Simplifier error cap, as a fraction of the mesh radius (1%). */
const SIMPLIFY_ERROR = 0.01;

/**
 * Nodes of the "retro wave art" scene that are not part of the car. Every one of
 * them sits far outside the car cluster (car is ~10 m across, x -1.8..7.9,
 * z -5.5..4.1) and several are 100+ m wide. Matched by node name; the whole
 * subtree is disposed.
 */
const PRUNE_NODES = [
  'f_12', // ground grid plane (scale 52, bbox ~104 x 52 x 104)
  'f_border.001_13', // neon border lines of the ground grid
  'm_41', // mountain range backdrop (bbox ~104 wide)
  'm_border.001_43', // neon outline of the mountain range
  'sun_51', // retro sun disc far behind the car (z -53)
  'sky_52', // sky dome (scale 52, bbox ~104 x 17 x 104)
  'fog_14', // fog sprites around the arena, 40+ m from the car
  'fog.001_15',
  'fog.002_16',
  'fog.003_17',
  'fog.004_18',
  'fog.005_19',
  'fog.006_20',
];

const fmt = (v) => v.map((n) => n.toFixed(2)).join(', ');
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;

function createIO() {
  return new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
}

/**
 * Logs every "part" node with its world bbox. A part is a node that carries a mesh or
 * whose child does (the exporter puts each mesh on an `Object_N` child of the named node,
 * so those children are skipped to keep one row per part).
 */
function logNodeTable(document, pruneSet) {
  const scene = document.getRoot().getDefaultScene() ?? document.getRoot().listScenes()[0];
  console.log('name | world bbox min | world bbox max | action');
  scene.traverse((node) => {
    const hasMesh = node.getMesh() || node.listChildren().some((c) => c.getMesh());
    if (!hasMesh) return;
    const parent = node.getParentNode();
    const isMeshChildOfPart =
      node.getMesh() && parent && parent.listChildren().every((c) => c.getMesh());
    if (isMeshChildOfPart) return;
    const { min, max } = getBounds(node);
    const action = pruneSet.has(node.getName()) ? 'PRUNE' : 'keep';
    console.log(`${node.getName()} | [${fmt(min)}] | [${fmt(max)}] | ${action}`);
  });
}

function disposeSubtree(node) {
  const nodes = [];
  node.traverse((n) => nodes.push(n));
  for (const n of nodes) n.dispose();
}

async function build(textureSize) {
  const io = createIO();
  const document = await io.read(SRC);
  const root = document.getRoot();

  // The credit must survive every transform, so snapshot it up front.
  const extras = structuredClone(root.getAsset().extras ?? {});

  // 1. Remove scenery (everything that is not the car).
  const pruneSet = new Set(PRUNE_NODES);
  const matched = new Set();
  for (const node of [...root.listNodes()]) {
    if (!pruneSet.has(node.getName())) continue;
    matched.add(node.getName());
    disposeSubtree(node);
  }
  const missing = PRUNE_NODES.filter((name) => !matched.has(name));
  if (missing.length > 0) {
    throw new Error(`PRUNE_NODES not found in source: ${missing.join(', ')}`);
  }

  const scene = root.getDefaultScene() ?? root.listScenes()[0];
  const carBounds = getBounds(scene);
  console.log(
    `car bbox after prune: min [${fmt(carBounds.min)}] max [${fmt(carBounds.max)}]`,
  );

  // 2. Optimize. flatten() lifts the per-part mesh nodes to the scene root so that
  //    join() can merge primitives that share a material.
  await document.transform(
    flatten(),
    dedup(),
    weld(),
    join(),
    simplify({ simplifier: MeshoptSimplifier, ratio: SIMPLIFY_RATIO, error: SIMPLIFY_ERROR }),
    prune(),
    resample(),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [textureSize, textureSize] }),
    meshopt({ encoder: MeshoptEncoder, level: 'high' }),
  );

  root.getAsset().extras = extras;

  const glb = await io.writeBinary(document);
  return { glb, document };
}

async function main() {
  if (process.argv.includes('--inspect')) {
    const document = await createIO().read(SRC);
    logNodeTable(document, new Set(PRUNE_NODES));
    return;
  }

  await MeshoptEncoder.ready;

  let result;
  let usedSize;
  for (const size of TEXTURE_SIZES) {
    console.log(`\n== building with textures <= ${size}px ==`);
    result = await build(size);
    usedSize = size;
    console.log(`output: ${kb(result.glb.byteLength)} (${result.glb.byteLength} bytes)`);
    if (result.glb.byteLength <= MAX_BYTES) break;
    console.log(`over budget (${MAX_BYTES} bytes), trying a smaller texture size`);
  }

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, result.glb);

  mkdirSync(dirname(FONT_OUT), { recursive: true });
  copyFileSync(FONT_SRC, FONT_OUT);

  const finalBytes = statSync(OUT).size;
  const root = result.document.getRoot();
  console.log(
    `\nwrote ${OUT}\n  size: ${finalBytes} bytes (${kb(finalBytes)}), textures <= ${usedSize}px` +
      `\n  meshes: ${root.listMeshes().length}, materials: ${root.listMaterials().length}, textures: ${root.listTextures().length}` +
      `\n  extensionsUsed: ${root.listExtensionsUsed().map((e) => e.extensionName).join(', ')}`,
  );
  if (finalBytes > MAX_BYTES) {
    console.error(`WARNING: output exceeds budget of ${MAX_BYTES} bytes`);
    process.exitCode = 1;
  }
}

await main();
