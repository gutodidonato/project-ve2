'use client';

import { Suspense } from 'react';
import { Billboard, Text } from '@react-three/drei';

/** Served from public/ (latin subset, has the Portuguese accents); no font CDN. */
export const LABEL_FONT = '/fonts/ibm-plex-mono-500.woff';
/**
 * Where troika first looks up fallback fonts for glyphs the label font lacks
 * (its default is a jsDelivr CDN). This only moves that first lookup to our
 * origin: nothing is served there, and when the lookup fails troika still falls
 * back to its CDN. So a label with a glyph outside the bundled latin subset
 * would still reach the CDN; today every label string fits the subset.
 */
export const UNICODE_FONTS_URL = '/fonts/unicode/';
// Spread rather than written inline: troika reads this off its Text instance, drei's TextProps does not list it.
const TROIKA = { unicodeFontsURL: UNICODE_FONTS_URL };
/** IBM Plex Mono advance width, in em. Mono, so a label's width is known without measuring. */
const ADVANCE = 0.6;
const SUB_SCALE = 0.62;
const PANEL = '#0c0717';
const INK = '#efe8ff';

interface SignLabelProps {
  text: string;
  /** Optional second, smaller line in ink color. */
  sub?: string;
  color: string;
  /** Font size of the main line, in world units. */
  size: number;
  position: [number, number, number];
  /**
   * How far the sign sits toward the camera from `position`. Zone signs hang on
   * their light beam; the camera looks down ~47°, so the top of a beam passing
   * through the sign's center would show in front of it unless the sign is
   * pushed forward by more than ~0.74 per unit of beam above the center.
   */
  forward?: number;
}

/**
 * Camera-facing neon sign: a colored frame, a dark panel and mono text, after
 * the prototype's canvas sprites. The panel shows at once; the text pops in
 * when the font has loaded.
 */
export function SignLabel({ text, sub, color, size, position, forward = 0.3 }: SignLabelProps) {
  const subSize = size * SUB_SCALE;
  const textWidth = Math.max(text.length * size, (sub?.length ?? 0) * subSize) * ADVANCE;
  const padX = size * 0.55;
  const padY = size * 0.4;
  const width = textWidth + padX * 2;
  const height = (sub ? size + subSize * 1.35 : size) + padY * 2;
  const border = size * 0.09;
  const mainY = sub ? height / 2 - padY - size / 2 : 0;
  const subY = sub ? -height / 2 + padY + subSize / 2 : 0;

  return (
    <Billboard position={position}>
      <group position-z={forward}>
        <mesh position-z={-0.04}>
          <planeGeometry args={[width + border * 2, height + border * 2]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <mesh position-z={-0.02}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial color={PANEL} />
        </mesh>
        <Suspense fallback={null}>
          <Text
            {...TROIKA}
            font={LABEL_FONT}
            fontSize={size}
            color={color}
            anchorX="center"
            anchorY="middle"
            position-y={mainY}
          >
            {text}
          </Text>
          {sub ? (
            <Text
              {...TROIKA}
              font={LABEL_FONT}
              fontSize={subSize}
              color={INK}
              anchorX="center"
              anchorY="middle"
              position-y={subY}
            >
              {sub}
            </Text>
          ) : null}
        </Suspense>
      </group>
    </Billboard>
  );
}
