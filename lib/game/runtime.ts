import { keysToControls } from './input';
import { createRuntime } from './tick';
import type { FrameInput, GameRuntime, ZoneId } from './types';

/**
 * Module singleton read and mutated by the frame loop. Consumers import the
 * binding once, so it must stay the same object: `resetRuntime` overwrites it
 * in place instead of reassigning.
 */
export const runtime: GameRuntime = createRuntime();

export function resetRuntime(spawn: ZoneId | null): void {
  Object.assign(runtime, createRuntime(spawn));
}

const heldKeys = new Set<string>();
let wheelAcc = 0;
let nextStopFlag = false;
let gotoRequest: ZoneId | null = null;
let dragVec: { x: number; z: number } | null = null;
/** Something happened since the last consume (a press, wheel, next stop, goto or drag move). */
let activity = false;

export interface InputQueue {
  press(code: string): void;
  release(code: string): void;
  /** Drop every held key (window blur, tab hidden). */
  releaseAll(): void;
  wheel(dy: number): void;
  /** Current drag vector since pointer-down, already in world units. */
  drag(dx: number, dz: number): void;
  endDrag(): void;
  nextStop(): void;
  goto(z: ZoneId): void;
  /** Read the input for this frame and clear the one-shot fields. */
  consume(): FrameInput;
}

/** Input producers (keyboard, wheel, pointer, minimap) write here; GameDirector consumes once per frame. */
export const inputQueue: InputQueue = {
  press(code) {
    heldKeys.add(code);
    activity = true;
  },
  release(code) {
    heldKeys.delete(code);
  },
  releaseAll() {
    heldKeys.clear();
  },
  wheel(dy) {
    wheelAcc += dy;
    activity = true;
  },
  drag(dx, dz) {
    dragVec = { x: dx, z: dz };
    activity = true;
  },
  endDrag() {
    dragVec = null;
  },
  nextStop() {
    nextStopFlag = true;
    activity = true;
  },
  goto(z) {
    gotoRequest = z;
    activity = true;
  },
  consume() {
    const out: FrameInput = {
      controls: keysToControls(heldKeys),
      drag: dragVec === null ? null : { x: dragVec.x, z: dragVec.z },
      wheel: wheelAcc,
      nextStop: nextStopFlag,
      gotoZone: gotoRequest,
      userActive: activity || heldKeys.size > 0 || dragVec !== null,
    };
    wheelAcc = 0;
    nextStopFlag = false;
    gotoRequest = null;
    activity = false;
    return out;
  },
};
