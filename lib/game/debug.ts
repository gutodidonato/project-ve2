import type { CarState, GameRuntime, Mode, ZoneId } from './types';

/** Read-only view of the runtime for e2e tests and the console. */
export interface RodoviaSnapshot {
  car: CarState;
  mode: Mode;
  zone: ZoneId | null;
}

export interface RodoviaDebug {
  snapshot(): RodoviaSnapshot;
}

declare global {
  interface Window {
    /** Present only while the world scene is mounted (GameDirector). */
    __rodovia?: RodoviaDebug;
  }
}

/** A copy of the parts of the runtime worth observing; never the live objects. */
export function snapshotOf(rt: GameRuntime): RodoviaSnapshot {
  return { car: { ...rt.car }, mode: rt.mode, zone: rt.zone };
}

/** Publish `window.__rodovia` for `rt`. Returns the cleanup that removes it again. */
export function registerDebug(rt: GameRuntime): () => void {
  const api: RodoviaDebug = { snapshot: () => snapshotOf(rt) };
  window.__rodovia = api;
  return () => {
    // Only remove our own registration (a newer mount may have replaced it).
    if (window.__rodovia === api) delete window.__rodovia;
  };
}
