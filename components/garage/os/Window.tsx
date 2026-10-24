'use client';

import { useId, useRef, type ReactNode } from 'react';
import { MENU_H } from '@/lib/garage/desktop';

export interface WindowProps {
  title: string;
  x: number;
  y: number;
  /** Stacking: later windows draw over earlier ones. */
  z: number;
  focused: boolean;
  /** Phone held upright: the window fills the desktop under the menu bar. */
  compact: boolean;
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
export function Window({ title, x, y, z, focused, compact, size, closeLabel, onClose, onFocus, onMove, children }: WindowProps) {
  const titleId = useId();
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);

  const frame = compact
    ? { left: 0, top: MENU_H, width: size.width, height: size.height - MENU_H }
    : { left: x, top: y, width: Math.min(640, size.width - 48), height: Math.min(460, size.height - MENU_H - 48) };

  return (
    <div
      role="dialog"
      aria-labelledby={titleId}
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
          if (d) onMove(d.x + e.clientX - d.px, d.y + e.clientY - d.py);
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
