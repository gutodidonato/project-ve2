export type ZoneId = 'experiencia' | 'cases' | 'oficina' | 'servicos' | 'contato';

export interface Zone {
  id: ZoneId;
  x: number;
  z: number;
  color: string;
}

/** Forward direction is (-sin heading, 0, -cos heading). */
export interface CarState {
  x: number;
  z: number;
  heading: number;
  speed: number;
}

/** Each axis in [-1, 1]; steer +1 = left. */
export interface Controls {
  throttle: number;
  steer: number;
}

export type Mode = 'demo' | 'manual' | 'tour' | 'goto' | 'idle';

export interface GameRuntime {
  car: CarState;
  mode: Mode;
  tourIndex: number;
  gotoIndex: number;
  budget: number;
  dwell: number;
  idleTime: number;
  zone: ZoneId | null;
}

export interface FrameInput {
  controls: Controls;
  drag: { x: number; z: number } | null;
  wheel: number;
  nextStop: boolean;
  gotoZone: ZoneId | null;
  userActive: boolean;
}

export type GameEvent = { type: 'zone'; zone: ZoneId | null } | { type: 'mode'; mode: Mode };
