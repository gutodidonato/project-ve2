/** Optimized DeLorean (meshopt + WebP), built by `npm run assets`. */
export const CAR_GLB = '/models/delorean.glb';

/**
 * Yaw (radians, about +Y) applied to the raw GLB before normalizing it. The
 * Sketchfab scene left the car turned ~-45° (its long axis lies on the x/z
 * diagonal); this turns it so the nose points to -z, the game's forward at
 * heading 0. Measured from the mesh (the yaw that minimizes the horizontal
 * bounding box is -0.787 rad, long axis on x) plus a quarter turn, and checked
 * in the running scene: the headlights lead in demo mode.
 */
export const CAR_MODEL_YAW = -0.787 - Math.PI / 2;

/** Longest horizontal extent of the car in world units (the primitive car is 3.8 long too). */
export const CAR_LENGTH = 3.8;
