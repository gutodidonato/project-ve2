'use client';

import { useId, useRef, type ReactNode } from 'react';
import { CASCADE, MENU_H } from '@/lib/garage/desktop';

export interface WindowProps {
  /** The program, for focus management (`data-program`). */
  program: string;
  title: string;
  x: number;
  y: number;
  /** Stacking: later windows draw over earlier ones. */
  z: number;
  focused: boolean;
  /** Phone held upright: the window fills the desktop under the menu bar. */
  compact: boolean;
  /** A dialog: narrower, and only as tall as its content. */
  small?: boolean;
  size: { width: number; height: number };
  closeLabel: string;
  onClose(): void;
  onFocus(): void;
  onMove(x: number, y: number): void;
  children: ReactNode;
}

/**
 * A LuisOS window: striped title bar (close on the left, name in the middle),
 * dragged by the bar, scrolling content. A non-modal dialog named by its title.
 */
export function Window({ program, title, x, y, z, focused, compact, small = false, size, closeLabel, onClose, onFocus, onMove, children }: WindowProps) {
  const titleId = useId();
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);

  const width = Math.min(small ? 440 : 640, size.width - CASCADE.x - 16);
  const frame = compact
    ? { left: 0, top: MENU_H, width: size.width, height: size.height - MENU_H }
    : small
      ? { left: x, top: y, width }
      : { left: x, top: y, width, height: Math.min(460, size.height - MENU_H - 48) };

  return (
    <div
      role="dialog"
      aria-labelledby={titleId}
      data-program={program}
      className={`os-window${focused ? ' os-window--focused' : ''}`}
      style={{ ...frame, zIndex: z }}
      onPointerDown={onFocus}
    >
      <div
        className="os-titlebar"
        onPointerDown={(e) => {
          if (compact || e.button !== 0 || (e.target as HTMLElement).closest('button')) return;
          drag.current = { px: e.clientX, py: e.clientY, x, y };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (d === null) return;
          // The button came up somewhere this bar never heard of: the drag is over.
          if (e.buttons === 0) {
            drag.current = null;
            return;
          }
          onMove(d.x + e.clientX - d.px, d.y + e.clientY - d.py);
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
        onPointerUp={(e) => {
          drag.current = null;
          if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
        }}
      >
        <button type="button" className="os-close" aria-label={closeLabel} onClick={onClose}>
          <span aria-hidden="true">□</span>
        </button>
        <span id={titleId} className="os-title" tabIndex={-1}>
          {title}
        </span>
      </div>
      <div className="os-content">{children}</div>
    </div>
  );
}
