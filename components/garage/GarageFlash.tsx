'use client';

import { useRef } from 'react';
import { garageRuntime } from '@/lib/garage/runtime';
import { useRuntimeFrame } from '@/components/game/useRuntimeFrame';

/** The headlights flaring to white at the end of the launch, over the canvas and the screen. */
export function GarageFlash() {
  const ref = useRef<HTMLDivElement>(null);
  useRuntimeFrame(() => {
    const el = ref.current;
    if (el === null) return;
    const opacity = String(Math.round(garageRuntime.launch.whiteout * 1000) / 1000);
    if (el.style.opacity !== opacity) el.style.opacity = opacity;
  });
  return <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-[#f4f7ff]" style={{ opacity: 0 }} />;
}
