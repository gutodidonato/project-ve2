import { describe, expect, it } from 'vitest';
import { PITSTOP_KEY, initialPitstop } from '@/lib/pitstop';

const base = { webgl: true, reducedMotion: false, saveData: false, stored: null } as const;

describe('initialPitstop', () => {
  it('uses the documented storage key', () => {
    expect(PITSTOP_KEY).toBe('rodovia:pitstop');
  });

  it('forces pit stop on when WebGL is unavailable', () => {
    expect(initialPitstop({ ...base, webgl: false })).toEqual({ pitstop: true, forced: true });
  });

  it('forces pit stop on without WebGL even if the user stored off', () => {
    expect(initialPitstop({ ...base, webgl: false, stored: 'off' })).toEqual({ pitstop: true, forced: true });
  });

  it('a stored choice wins over reduced motion', () => {
    expect(initialPitstop({ ...base, reducedMotion: true, stored: 'off' })).toEqual({ pitstop: false, forced: false });
  });

  it('a stored choice wins over save-data', () => {
    expect(initialPitstop({ ...base, saveData: true, stored: 'off' })).toEqual({ pitstop: false, forced: false });
    expect(initialPitstop({ ...base, stored: 'on' })).toEqual({ pitstop: true, forced: false });
  });

  it('defaults on for save-data when nothing is stored', () => {
    expect(initialPitstop({ ...base, saveData: true })).toEqual({ pitstop: true, forced: false });
  });

  it('defaults on for reduced motion when nothing is stored', () => {
    expect(initialPitstop({ ...base, reducedMotion: true })).toEqual({ pitstop: true, forced: false });
  });

  it('defaults off when everything is fine', () => {
    expect(initialPitstop(base)).toEqual({ pitstop: false, forced: false });
  });
});
