import type { Rect } from './runtime';
import type { GarageView, ScreenContent } from './state';

/** Read-only view of the garage for e2e tests and the console. */
export interface GarageSnapshot {
  view: GarageView;
  content: ScreenContent | null;
  door: number;
  /** The launch's white flash, 0..1. */
  whiteout: number;
  camera: [number, number, number];
  arrived: boolean;
  drawCalls: number;
  glassRect: Rect;
  keyRects: { code: string; rect: Rect }[];
}

export interface GarageDebug {
  snapshot(): GarageSnapshot;
  /** Freeze the launch timeline at `ms` after J (null lets it run): for the shot list. */
  holdLaunch(ms: number | null): void;
}

declare global {
  interface Window {
    /** Present only while the garage scene is mounted. */
    __garage?: GarageDebug;
  }
}

/** Publish `window.__garage`; `read` must return copies, never live objects. Returns the cleanup. */
export function registerGarageDebug(read: () => GarageSnapshot, hold: (ms: number | null) => void): () => void {
  const api: GarageDebug = { snapshot: read, holdLaunch: hold };
  window.__garage = api;
  return () => {
    if (window.__garage === api) delete window.__garage;
  };
}
