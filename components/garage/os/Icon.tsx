'use client';

import type { IconId } from '@/lib/garage/desktop';
import { Glyph } from './glyphs';

/**
 * A desktop icon. Click selects it (on a phone, one tap opens), double click
 * opens, Enter opens straight away. Selected icons are drawn inverted.
 */
export function Icon({
  id,
  label,
  selected,
  compact,
  onSelect,
  onOpen,
}: {
  id: IconId | 'file';
  label: string;
  selected: boolean;
  compact: boolean;
  onSelect(): void;
  onOpen(): void;
}) {
  return (
    <button
      type="button"
      data-testid={id === 'file' ? 'os-file' : 'os-icon'}
      data-icon={id}
      className="os-icon"
      aria-pressed={selected}
      onClick={() => (compact ? onOpen() : onSelect())}
      onDoubleClick={onOpen}
      onKeyDown={(e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        onOpen();
      }}
    >
      <Glyph id={id} />
      <span className="os-label">{label}</span>
    </button>
  );
}
