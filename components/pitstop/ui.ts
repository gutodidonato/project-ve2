/** Class strings shared by the pit stop sections (kept literal so Tailwind sees them). */

/** Zone anchors, fixed in both locales (also the game's zone ids). */
export const SECTION_IDS = ['experiencia', 'cases', 'oficina', 'servicos', 'contato'] as const;

export const sectionClass = 'flex scroll-mt-8 flex-col gap-8';

export const linkClass =
  'text-cyan underline decoration-cyan/40 underline-offset-4 hover:decoration-cyan';

const buttonBase =
  'inline-flex min-h-11 items-center gap-2 border px-4 py-2 font-display text-[0.8125rem] leading-tight tracking-[0.06em]';

export const buttonPrimaryClass = `${buttonBase} border-sun text-sun hover:bg-sun hover:text-night`;

export const buttonGhostClass = `${buttonBase} border-line text-ink hover:border-muted`;

/** Accent per position, cycling cyan → magenta → sun (artifact layer colors). */
export const accentBorders = ['border-cyan', 'border-magenta', 'border-sun'] as const;

/** `https://www.github.com/x/` → `github.com/x` */
export function displayUrl(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}
