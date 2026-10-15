'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { isTypingTarget } from '@/lib/game/input';
import { inputQueue, runtime } from '@/lib/game/runtime';
import type { ZoneId } from '@/lib/game/types';
import { ZONES } from '@/lib/game/zones';
import { useGameStore } from '@/lib/store';
import { useRuntimeFrame } from './useRuntimeFrame';

/** The map shows world x/z in [-80, 80]; the neon border is at ±78. */
const HALF = 80;
const BORDER = 78;
const GRID = [-60, -40, -20, 0, 20, 40, 60];
/** Arrowhead pointing up (world -z, the car's forward at heading 0), in world units. */
const CAR_POINTS = '0,-7 5,6 0,3 -5,6';

/** World coordinate to a percentage of the map's width / height. */
const pct = (v: number) => `${((v + HALF) / (2 * HALF)) * 100}%`;

/**
 * Overview map: the hub, one button per stop (sends the car there) and a car
 * marker moved every frame through a ref. Bottom-right above the pit stop
 * toggle on wide screens, top-left under 700px. `M` focuses the first stop.
 * Stops are numbered in tour order, like the panel's "Parada N de 5".
 */
export function Minimap({ names }: { names: Record<ZoneId, string> }) {
  const t = useTranslations('Game');
  const zone = useGameStore((s) => s.zone);
  const carRef = useRef<SVGPolygonElement>(null);
  const firstRef = useRef<HTMLButtonElement>(null);

  useRuntimeFrame(() => {
    const el = carRef.current;
    if (el === null) return;
    const { x, z, heading } = runtime.car;
    // SVG y is world z; forward is (-sin h, -cos h), i.e. the "up" arrow turned by -h.
    const transform = `translate(${x.toFixed(1)} ${z.toFixed(1)}) rotate(${((-heading * 180) / Math.PI).toFixed(1)})`;
    if (el.getAttribute('transform') !== transform) el.setAttribute('transform', transform);
  });

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (typeof e.key !== 'string' || e.key.toLowerCase() !== 'm') return;
      if (e.repeat || e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target) || document.querySelector('dialog[open]') !== null) return;
      e.preventDefault();
      firstRef.current?.focus();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <nav
      data-minimap
      aria-label={t('minimap')}
      className="absolute top-4 left-4 z-10 size-24 border border-line bg-night/75 backdrop-blur-sm md:top-auto md:right-4 md:bottom-[4.5rem] md:left-auto md:size-[132px]"
    >
      <svg viewBox={`${-HALF} ${-HALF} ${2 * HALF} ${2 * HALF}`} aria-hidden="true" className="absolute inset-0 size-full">
        {GRID.map((v) => (
          <g key={v} stroke="var(--line)" strokeWidth={v === 0 ? 1.2 : 0.8}>
            <line x1={v} y1={-BORDER} x2={v} y2={BORDER} />
            <line x1={-BORDER} y1={v} x2={BORDER} y2={v} />
          </g>
        ))}
        <rect
          x={-BORDER}
          y={-BORDER}
          width={2 * BORDER}
          height={2 * BORDER}
          fill="none"
          stroke="var(--magenta)"
          strokeOpacity={0.55}
          strokeWidth={1.5}
        />
        {/* Under the stop buttons: parked on a stop, the filled button is the marker and its letter stays readable. */}
        <polygon ref={carRef} points={CAR_POINTS} fill="var(--ink)" stroke="var(--night)" strokeWidth={1.5} strokeLinejoin="round" />
      </svg>

      <ul>
        {ZONES.map((z, i) => {
          const name = names[z.id];
          const here = zone === z.id;
          return (
            <li key={z.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: pct(z.x), top: pct(z.z) }}>
              <button
                ref={i === 0 ? firstRef : undefined}
                type="button"
                aria-label={t('travelTo', { zone: name })}
                aria-current={here ? 'location' : undefined}
                aria-keyshortcuts={i === 0 ? 'M' : undefined}
                onClick={() => inputQueue.goto(z.id)}
                className="grid size-6 cursor-pointer place-items-center rounded-full border-2 font-mono text-[0.6875rem] leading-none font-medium md:size-7 md:text-xs"
                style={
                  here
                    ? { borderColor: z.color, backgroundColor: z.color, color: 'var(--night)' }
                    : { borderColor: z.color, backgroundColor: 'rgb(12 7 23 / 0.85)', color: z.color }
                }
              >
                <span aria-hidden="true">{i + 1}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <span aria-hidden="true" className="absolute top-0.5 right-1 font-mono text-[0.625rem] text-muted pointer-coarse:hidden">
        M
      </span>
    </nav>
  );
}
