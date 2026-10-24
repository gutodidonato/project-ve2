import { describe, expect, it } from 'vitest';
import { CAR_POSE, WIDE_POSE, carPose, deskLayout, deskPose, deskRect, framingFor, glassDistance, widePose } from '@/lib/garage/camera';
import { GLASS } from '@/lib/garage/scene';

describe('framingFor', () => {
  it('is portrait only for tall windows', () => {
    expect(framingFor(1440, 900)).toBe('wide');
    expect(framingFor(390, 844)).toBe('portrait');
    expect(framingFor(667, 375)).toBe('wide');
  });
});

describe('glassDistance', () => {
  it('contains from farther away than it covers on a wide window', () => {
    expect(glassDistance(50, 16 / 9, 'contain')).toBeGreaterThan(glassDistance(50, 16 / 9, 'cover'));
  });

  it('is the same both ways on a 4:3 window, the shape of the glass', () => {
    expect(glassDistance(50, 4 / 3, 'contain')).toBeCloseTo(glassDistance(50, 4 / 3, 'cover'), 9);
  });

  it('fits the glass height exactly when height is the binding side', () => {
    const d = glassDistance(50, 16 / 9, 'contain');
    const halfHeight = d * Math.tan((50 * Math.PI) / 360);
    expect(halfHeight).toBeCloseTo(GLASS.height / 2, 9);
  });
});

describe('deskRect', () => {
  it('shows the glass on three quarters of a wide window, raised so the case shows below', () => {
    const { glass, page } = deskRect(1440, 900);
    expect(glass.height).toBeCloseTo(0.74 * 900, 6);
    expect(glass.width).toBeCloseTo((glass.height * 4) / 3, 6);
    expect(glass.x + glass.width / 2).toBeCloseTo(720, 6);
    expect(glass.y + glass.height / 2).toBeLessThan(450);
    expect(page).toEqual(glass);
  });

  it('covers a phone window', () => {
    const { glass, page } = deskRect(390, 844);
    expect(glass.height).toBeCloseTo(844, 6);
    expect(page.x).toBe(0);
    expect(page.y).toBeCloseTo(0, 6);
    expect(page.width).toBeCloseTo(390, 6);
    expect(page.height).toBeCloseTo(844, 6);
  });
});

describe('deskPose', () => {
  it('faces the monitor straight on, only moved down', () => {
    const pose = deskPose('wide', 1.6);
    expect(pose.position[0]).toBe(pose.target[0]);
    expect(pose.position[1]).toBe(pose.target[1]);
    expect(pose.target[0]).toBe(GLASS.center[0]);
    expect(pose.target[1]).toBeCloseTo(GLASS.center[1] - 0.05, 9);
    expect(pose.position[2]).toBeGreaterThan(GLASS.center[2]);
  });

  it('covers on phones with no drop', () => {
    const pose = deskPose('portrait', 390 / 844);
    expect(pose.target).toEqual(GLASS.center);
  });
});

describe('widePose and carPose', () => {
  /** Metres seen across at `distance` from a pose, for a window of this aspect. */
  const across = (fov: number, aspect: number, distance: number) => 2 * distance * Math.tan((fov * Math.PI) / 360) * aspect;
  const distance = (p: { position: number[]; target: number[] }) => Math.hypot(...p.position.map((v, i) => v - p.target[i]));

  it('keeps the wide-window poses as they are', () => {
    expect(widePose('wide')).toEqual(WIDE_POSE);
    expect(carPose('wide')).toEqual(CAR_POSE);
  });

  it('on a phone held upright the pull-back shows the computer, and the car fits across', () => {
    const aspect = 390 / 844;
    const wide = widePose('portrait');
    const half = across(wide.fov, aspect, distance(wide)) / 2;
    expect(Math.abs(GLASS.center[0] - wide.target[0])).toBeLessThan(half);
    const car = carPose('portrait');
    expect(across(car.fov, aspect, distance(car))).toBeGreaterThan(2.2);
  });
});

describe('deskLayout', () => {
  it('lays the desktop out on the glass, whole pixels', () => {
    const { size } = deskLayout(1440, 900, false);
    const { page } = deskRect(1440, 900);
    expect(size).toEqual({ width: Math.round(page.width), height: Math.round(page.height) });
  });

  it('is compact on a phone held upright, a short glass (a phone held sideways) or a touch screen', () => {
    expect(deskLayout(1440, 900, false).compact).toBe(false);
    expect(deskLayout(1366, 657, false).compact).toBe(false);
    expect(deskLayout(390, 844, false).compact).toBe(true);
    expect(deskLayout(844, 350, false).compact).toBe(true);
    expect(deskLayout(1024, 768, true).compact).toBe(true);
  });
});
