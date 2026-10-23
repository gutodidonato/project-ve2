import { readPref, writePref } from '@/lib/storage';

/** 'on' | 'off'; absent means on (once a gesture unlocked audio). */
export const SOUND_KEY = 'rodovia:sound';

export interface GarageSound {
  /** Create the audio context; browsers only allow it after a gesture. */
  unlock(): void;
  /** A mechanical key click. */
  key(): void;
  /** The roll-up door rumbling open (1.6 s). */
  door(): void;
  /** The DeLorean starting (1.2 s). */
  engine(): void;
  setMuted(m: boolean): void;
  muted(): boolean;
}

/** Output level: everything stays well under the browser's full scale. */
const MASTER = 0.3;

/**
 * Garage sounds made in Web Audio: no files to download, nothing before the
 * first gesture, and the mute choice remembered in storage.
 */
export function createGarageSound(ctor: () => AudioContext = () => new AudioContext()): GarageSound {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let isMuted = readPref(SOUND_KEY) === 'off';

  const out = (): { ctx: AudioContext; master: GainNode } | null =>
    ctx !== null && master !== null && !isMuted ? { ctx, master } : null;

  function noise(c: AudioContext, seconds: number): AudioBuffer {
    const buffer = c.createBuffer(1, Math.max(1, Math.round(c.sampleRate * seconds)), c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  /** Filtered noise with a gain envelope: attack, hold, then fall to silence at `seconds`. */
  function burst(seconds: number, filter: BiquadFilterType, frequency: number, peak: number) {
    const o = out();
    if (o === null) return;
    const t = o.ctx.currentTime;
    const src = o.ctx.createBufferSource();
    src.buffer = noise(o.ctx, seconds);
    const f = o.ctx.createBiquadFilter();
    f.type = filter;
    f.frequency.setValueAtTime(frequency, t);
    const g = o.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + Math.min(0.01, seconds / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
    src.connect(f).connect(g).connect(o.master);
    src.start(t);
    src.stop(t + seconds);
  }

  return {
    unlock() {
      if (ctx !== null) return;
      try {
        ctx = ctor();
        master = ctx.createGain();
        master.gain.value = MASTER;
        master.connect(ctx.destination);
        if (ctx.state === 'suspended') void ctx.resume();
      } catch {
        ctx = null;
        master = null;
      }
    },
    key() {
      burst(0.03, 'bandpass', 2400, 0.6);
    },
    door() {
      burst(1.6, 'lowpass', 320, 0.8);
    },
    engine() {
      const o = out();
      if (o === null) return;
      const t = o.ctx.currentTime;
      const osc = o.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(60, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 1.2);
      const f = o.ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(900, t);
      const g = o.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.5, t + 0.15);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
      osc.connect(f).connect(g).connect(o.master);
      osc.start(t);
      osc.stop(t + 1.2);
    },
    setMuted(m) {
      isMuted = m;
      writePref(SOUND_KEY, m ? 'off' : 'on');
    },
    muted: () => isMuted,
  };
}

let shared: GarageSound | null = null;

/** The one sound engine of the page, created on first use (in the browser only). */
export function garageSound(): GarageSound {
  shared ??= createGarageSound();
  return shared;
}
