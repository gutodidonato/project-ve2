// Shrinks the Salto 88 build inputs that ship in public/salto88 (budget: the folder ≤ 30 MB).
//
//   node scripts/shrink-game.mjs <lab>/proto        writes <lab>/proto/min/{models,music}
//
// Models: the game's glTF JSON files carry their geometry as base64 (a third larger than the
// bytes); the textures are already small WebP. Each one is rewritten as binary .glb with the
// same content: no meshopt or Draco, the game's r128 GLTFLoader has no decoder for them.
// Music: re-encoded with ffmpeg (Vorbis q2 for .ogg, 128 kbps for .mp3), same file names, so
// the station gains measured on the whole track still apply (checked by e2e/audio-check.mjs).
// The originals are not in the lab's git: they are never touched.
//
// ffmpeg: from the FFMPEG environment variable, else `ffmpeg` on the PATH.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';

const proto = resolve(process.argv[2] ?? '');
if (!process.argv[2]) {
  console.error('usage: node scripts/shrink-game.mjs <lab>/proto');
  process.exit(1);
}
const ffmpeg = process.env.FFMPEG || 'ffmpeg';
const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
let before = 0;
let after = 0;

function report(from, to) {
  const a = statSync(from).size;
  const b = statSync(to).size;
  before += a;
  after += b;
  console.log(`${basename(from).padEnd(24)} ${mb(a).padStart(9)} -> ${mb(b).padStart(9)}`);
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const modelsIn = join(proto, 'models-json');
const modelsOut = join(proto, 'min', 'models');
mkdirSync(modelsOut, { recursive: true });
for (const file of readdirSync(modelsIn).filter((f) => f.endsWith('.json'))) {
  const doc = await io.read(join(modelsIn, file));
  const out = join(modelsOut, basename(file, '.json') + '.glb');
  writeFileSync(out, await io.writeBinary(doc));
  report(join(modelsIn, file), out);
}

const musicIn = join(proto, 'music');
const musicOut = join(proto, 'min', 'music');
mkdirSync(musicOut, { recursive: true });
for (const file of readdirSync(musicIn)) {
  const ext = extname(file).toLowerCase();
  const codec = ext === '.ogg' ? ['-c:a', 'libvorbis', '-q:a', '2'] : ext === '.mp3' ? ['-c:a', 'libmp3lame', '-b:a', '128k'] : null;
  if (codec === null) continue;
  const out = join(musicOut, file);
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', join(musicIn, file), '-map_metadata', '0', ...codec, out]);
  report(join(musicIn, file), out);
}

console.log(`${'total'.padEnd(24)} ${mb(before).padStart(9)} -> ${mb(after).padStart(9)}`);
