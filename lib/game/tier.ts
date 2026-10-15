export type Tier = 'A' | 'B';

/** Quality tier: 'A' (full effects) only for a capable GPU on a non-mobile device. */
export function tierFrom(gpuTier: number | undefined, isMobile: boolean): Tier {
  return gpuTier !== undefined && gpuTier >= 2 && !isMobile ? 'A' : 'B';
}
