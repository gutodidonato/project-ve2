// Garage measures in metres. Starting values: the shots loop tunes them.

/** The CRT glass: centre, and its 4:3 size. It faces +z. */
export const GLASS: { center: [number, number, number]; width: number; height: number } = {
  center: [-0.6, 1.25, 0.02],
  width: 0.4,
  height: 0.3,
};

export const BENCH_TOP_Y = 0.9;

/** The roll-up door opening in the back wall. */
export const DOOR = { x0: 1.6, x1: 4.6, z: -0.5, height: 2.4 };

/** Where the DeLorean waits behind the door; heading π turns its nose (-z at 0) to the garage. */
export const CAR_SPOT = { x: 3.1, z: -3.2, heading: Math.PI };
