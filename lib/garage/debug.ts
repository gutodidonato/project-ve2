import type { Rect } from './runtime';
import type { GarageView, ScreenContent } from './state';

/** Read-only view of the garage for e2e tests and the console. */
export interface GarageSnapshot {
  view: GarageView;
  content: ScreenContent | null;
  door: number;
  camera: [number, number, number];
  arrived: boolean;
  drawCalls: number;
  glassRect: Rect;
  keyRects: { code: string; rect: Rect }[];
}

export interface GarageDebug {
  snapshot(): GarageSnapshot;
}

declare global {
  interface Window {
    /** Present only while the garage scene is mounted. */
    __garage?: GarageDebug;
  }
}

/** Publish `window.__garage`; `read` must return copies, never live objects. Returns the cleanup. */
export function registerGarageDebug(read: () => GarageSnapshot): () => void {
  const api: GarageDebug = { snapshot: read };
  window.__garage = api;
  return () => {
    if (window.__garage === api) delete window.__garage;
  };
}
