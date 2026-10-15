export const PITSTOP_KEY = 'rodovia:pitstop';

export interface PitstopInputs {
  webgl: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  stored: 'on' | 'off' | null;
}

/**
 * Initial pit stop (plain page) decision. Precedence: no WebGL forces it on
 * (and the user cannot leave it), then an explicit stored choice, then the
 * reduced-motion / save-data hints.
 */
export function initialPitstop(o: PitstopInputs): { pitstop: boolean; forced: boolean } {
  if (!o.webgl) return { pitstop: true, forced: true };
  if (o.stored === 'on') return { pitstop: true, forced: false };
  if (o.stored === 'off') return { pitstop: false, forced: false };
  return { pitstop: o.reducedMotion || o.saveData, forced: false };
}
