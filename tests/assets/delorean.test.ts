import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const GLB_PATH = resolve(process.cwd(), 'public/models/delorean.glb');
const MAX_BYTES = 1_572_864;

function readJsonChunk(path: string): {
  extensionsUsed?: string[];
  asset?: { extras?: { license?: string } };
} {
  const buf = readFileSync(path);
  // GLB header: magic(4) version(4) length(4); chunk0: length(4) type(4) data
  const jsonLength = buf.readUInt32LE(12);
  const json = buf.subarray(20, 20 + jsonLength).toString('utf8');
  return JSON.parse(json);
}

describe('public/models/delorean.glb', () => {
  it('exists', () => {
    expect(existsSync(GLB_PATH)).toBe(true);
  });

  it('is at most 1.5 MiB', () => {
    expect(statSync(GLB_PATH).size).toBeLessThanOrEqual(MAX_BYTES);
  });

  it('uses meshopt compression and WebP textures', () => {
    const gltf = readJsonChunk(GLB_PATH);
    expect(gltf.extensionsUsed).toContain('EXT_meshopt_compression');
    expect(gltf.extensionsUsed).toContain('EXT_texture_webp');
  });

  it('preserves the CC-BY-4.0 credit in asset.extras', () => {
    const gltf = readJsonChunk(GLB_PATH);
    expect(gltf.asset?.extras?.license).toContain('CC-BY-4.0');
  });
});
