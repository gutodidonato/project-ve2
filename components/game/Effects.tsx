'use client';

import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';

/**
 * Tier A post-processing: a soft bloom that only catches the bright neon
 * (rings, beams, border, signs) and a light vignette. Tier B renders without it.
 */
export function Effects() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur radius={0.7} intensity={0.5} luminanceThreshold={0.3} luminanceSmoothing={0.25} />
      <Vignette offset={0.3} darkness={0.55} />
    </EffectComposer>
  );
}
