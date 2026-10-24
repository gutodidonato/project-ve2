/** next/font exposes IBM Plex Sans under a hashed family name, through this variable on <html>. */
const PLEX_SANS_VAR = '--font-plex-sans';
const FALLBACK = '"Segoe UI", sans-serif';

/**
 * The font-family for text drawn on a canvas (the key legends): canvas text
 * cannot read CSS variables, so the hashed name next/font registered is read
 * from the root's computed style. Without it, the plain family name.
 */
export function legendFontFamily(root: HTMLElement): string {
  const value = (getComputedStyle(root).getPropertyValue(PLEX_SANS_VAR) || root.style.getPropertyValue(PLEX_SANS_VAR)).trim();
  return value === '' ? `"IBM Plex Sans", ${FALLBACK}` : `${value}, ${FALLBACK}`;
}
