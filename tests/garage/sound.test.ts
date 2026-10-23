// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { SOUND_KEY, createGarageSound } from '@/lib/garage/sound';

/** A stand-in AudioContext that counts the sources it is asked to create. */
function fakeContext() {
  const made = { sources: 0, contexts: 0 };
  const param = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} });
  const node = () => ({ connect: () => node(), gain: param(), frequency: param(), Q: param(), type: '' });
  const ctor = () => {
    made.contexts++;
    return {
      currentTime: 0,
      sampleRate: 8000,
      destination: {},
      state: 'running',
      resume: () => Promise.resolve(),
      createGain: node,
      createBiquadFilter: node,
      createBuffer: (_c: number, length: number) => ({ getChannelData: () => new Float32Array(length) }),
      createBufferSource: () => {
        made.sources++;
        return { ...node(), buffer: null, start() {}, stop() {} };
      },
      createOscillator: () => {
        made.sources++;
        return { ...node(), start() {}, stop() {} };
      },
    } as unknown as AudioContext;
  };
  return { made, ctor };
}

describe('garage sound', () => {
  beforeEach(() => localStorage.clear());

  it('plays nothing before the first gesture unlocks it', () => {
    const { made, ctor } = fakeContext();
    const sound = createGarageSound(ctor);
    sound.key();
    sound.door();
    expect(made.contexts).toBe(0);
    expect(made.sources).toBe(0);
  });

  it('plays once unlocked', () => {
    const { made, ctor } = fakeContext();
    const sound = createGarageSound(ctor);
    sound.unlock();
    sound.key();
    expect(made.sources).toBeGreaterThan(0);
  });

  it('remembers mute and stays quiet', () => {
    const { made, ctor } = fakeContext();
    const sound = createGarageSound(ctor);
    sound.unlock();
    sound.setMuted(true);
    expect(localStorage.getItem(SOUND_KEY)).toBe('off');
    expect(sound.muted()).toBe(true);
    sound.key();
    sound.engine();
    expect(made.sources).toBe(0);
    expect(createGarageSound(ctor).muted()).toBe(true);
  });
});
