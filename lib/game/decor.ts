import { mulberry32 } from './rng';
import { ZONES } from './zones';
import type { ZoneId } from './types';

/**
 * Static scenery layout for the hub (pure, deterministic). The scene components
 * only turn these numbers into meshes, so the layout is unit-testable and the
 * world looks the same on every visit.
 */

export const DECOR_SEED = 5;
export const TOWER_COUNT = 22;
export const CONE_COUNT = 46;

/** Cones keep this distance from the spawn point and from every zone center. */
const CONE_CLEAR_SPAWN = 14;
const CONE_CLEAR_ZONE = 20;
/** Cones stay this far inside the map edge so none pokes through the neon border. */
const CONE_EXTENT = 72;
/** The follow camera sits this far south (+z) of the car (CameraRig). */
const PARKED_CAMERA_BACK = 20;

export const COLORS = {
  magenta: '#ff3ea5',
  cyan: '#3ee8ff',
  sun: '#ffb347',
  towerBlue: '#2f78a8',
  conePurple: '#5a2a8f',
  post: '#3a2a5e',
} as const;

/** Axis-aligned box standing on the ground; (x, z) is its footprint center. */
export interface BoxDecor {
  x: number;
  z: number;
  w: number;
  h: number;
  d: number;
  color: string;
}

export interface ConeDecor {
  x: number;
  z: number;
  /** Height; the 4-sided base radius is 0.6 * h. */
  h: number;
  rotY: number;
  color: string;
}

export interface Point {
  x: number;
  z: number;
}

export interface DecorLayout {
  /** Wireframe district around the cases zone. */
  towers: BoxDecor[];
  /** Oficina garage frame (outline only, door facing the zone). */
  garage: BoxDecor;
  /** Three serviços pylons, one per offer. */
  pylons: BoxDecor[];
  /** Four experiência signposts, oldest company first along the arc. */
  signposts: Point[];
  /** Contato half-sun: center of the disc's straight edge (on the ground) and its yaw. */
  sun: Point & { radius: number; rotY: number };
  cones: ConeDecor[];
}

function zoneAt(id: ZoneId): Point {
  const zone = ZONES.find((z) => z.id === id);
  if (!zone) throw new Error(`unknown zone ${id}`);
  return { x: zone.x, z: zone.z };
}

export function buildDecor(seed: number = DECOR_SEED): DecorLayout {
  const rand = mulberry32(seed);

  const cases = zoneAt('cases');
  const towers: BoxDecor[] = [];
  for (let i = 0; i < TOWER_COUNT; i++) {
    const a = rand() * Math.PI * 2;
    const r = 10 + rand() * 9;
    towers.push({
      x: cases.x + Math.cos(a) * r,
      z: cases.z + Math.sin(a) * r,
      w: 1.4 + rand() * 1.4,
      h: 2 + rand() ** 2 * 10,
      d: 1.4 + rand() * 1.4,
      color: i % 4 === 0 ? COLORS.magenta : COLORS.towerBlue,
    });
  }

  // Zone props stand north (-z) of their zone: the camera sits south of the car
  // and looks north, so anything south of a zone would block the view of it.
  const oficina = zoneAt('oficina');
  const garage: BoxDecor = { x: oficina.x, z: oficina.z - 10, w: 12, h: 5, d: 8, color: COLORS.sun };

  const servicos = zoneAt('servicos');
  const pylons: BoxDecor[] = [-6, 0, 6].map((dx, i) => ({
    x: servicos.x + dx,
    z: servicos.z - 10,
    w: 2,
    h: 5 + i * 3,
    d: 2,
    color: COLORS.cyan,
  }));

  const experiencia = zoneAt('experiencia');
  const signposts: Point[] = [0, 1, 2, 3].map((i) => {
    const a = -0.6 + i * 0.75;
    return { x: experiencia.x + Math.cos(a) * 11, z: experiencia.z + Math.sin(a) * 11 };
  });

  // Beside the contato lookout (straight behind it the zone sign would hide it),
  // clear of the legs into contato (from serviços) and out of it (to experiência),
  // turned toward where the follow camera sits when the car is parked there.
  const contato = zoneAt('contato');
  const sunX = contato.x - 14;
  const sunZ = contato.z - 6;
  const sun = {
    x: sunX,
    z: sunZ,
    radius: 6,
    rotY: Math.atan2(contato.x - sunX, contato.z + PARKED_CAMERA_BACK - sunZ),
  };

  const cones: ConeDecor[] = [];
  // Rejection sampling; the guard only matters if the constants ever make the map too crowded.
  for (let attempt = 0; cones.length < CONE_COUNT && attempt < 2000; attempt++) {
    const x = (rand() - 0.5) * 2 * CONE_EXTENT;
    const z = (rand() - 0.5) * 2 * CONE_EXTENT;
    if (Math.hypot(x, z) < CONE_CLEAR_SPAWN) continue;
    if (ZONES.some((zone) => Math.hypot(zone.x - x, zone.z - z) < CONE_CLEAR_ZONE)) continue;
    const h = 1.5 + rand() * 4;
    cones.push({
      x,
      z,
      h,
      rotY: rand() * Math.PI,
      color: cones.length % 3 === 0 ? COLORS.cyan : COLORS.conePurple,
    });
  }

  return { towers, garage, pylons, signposts, sun, cones };
}
