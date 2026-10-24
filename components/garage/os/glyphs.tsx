import type { IconId } from '@/lib/garage/desktop';

/** A 16 × 16 pixel grid drawn at 32 × 32: each rect is [x, y, width, height] in grid cells. */
type Cells = readonly (readonly [number, number, number, number])[];

const SHEET: Cells = [
  [3, 1, 8, 1], [3, 1, 1, 14], [3, 14, 10, 1], [12, 4, 1, 11], [10, 1, 1, 3], [10, 3, 3, 1], [11, 2, 1, 1],
];

const GLYPHS: Record<IconId | 'file', Cells> = {
  // A sheet with lines of text.
  cv: [...SHEET, [5, 6, 6, 1], [5, 8, 6, 1], [5, 10, 6, 1], [5, 12, 4, 1]],
  // A folder: tab and body.
  projects: [[1, 3, 6, 1], [1, 3, 1, 11], [6, 4, 9, 1], [15, 4, 1, 10], [1, 13, 15, 1], [7, 3, 1, 1], [2, 6, 13, 1]],
  // An envelope (never a phone).
  contact: [[1, 4, 14, 1], [1, 4, 1, 9], [14, 4, 1, 9], [1, 12, 14, 1], [2, 5, 2, 1], [4, 6, 2, 1], [6, 7, 4, 1], [10, 6, 2, 1], [12, 5, 2, 1]],
  // A lightning bolt over "88".
  salto88: [[8, 0, 3, 1], [7, 1, 3, 1], [6, 2, 3, 1], [5, 3, 6, 1], [8, 4, 2, 1], [7, 5, 2, 1], [6, 6, 2, 1],
    [3, 9, 3, 1], [3, 9, 1, 5], [5, 9, 1, 5], [3, 11, 3, 1], [3, 13, 3, 1], [9, 9, 3, 1], [9, 9, 1, 5], [11, 9, 1, 5], [9, 11, 3, 1], [9, 13, 3, 1]],
  // Three sliders.
  control: [[3, 2, 1, 12], [7, 2, 1, 12], [11, 2, 1, 12], [2, 9, 3, 2], [6, 4, 3, 2], [10, 11, 3, 2]],
  // A note with an exclamation mark.
  readme: [...SHEET, [7, 5, 2, 5], [7, 11, 2, 2]],
  // A bin: lid, handle, ribbed body.
  trash: [[6, 1, 4, 1], [2, 2, 12, 1], [3, 4, 1, 11], [12, 4, 1, 11], [3, 14, 10, 1], [6, 6, 1, 7], [9, 6, 1, 7]],
  // A small document, for the files inside folders.
  file: SHEET,
};

/** A 32 × 32 pixel icon in the current text colour (amber on the glass, dark when the icon is selected). */
export function Glyph({ id }: { id: IconId | 'file' }) {
  return (
    <svg className="os-glyph" viewBox="0 0 16 16" width="32" height="32" aria-hidden="true" shapeRendering="crispEdges">
      {GLYPHS[id].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill="currentColor" />
      ))}
    </svg>
  );
}
