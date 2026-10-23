import { describe, expect, it } from 'vitest';
import { framingFor, glassDistance, screenPose } from '@/lib/garage/camera';
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

describe('screenPose', () => {
  it('looks straight at the glass from in front of it', () => {
    const pose = screenPose('wide', 16 / 9);
    expect(pose.target).toEqual(GLASS.center);
    expect(pose.position[0]).toBe(GLASS.center[0]);
    expect(pose.position[1]).toBe(GLASS.center[1]);
    expect(pose.position[2]).toBeGreaterThan(GLASS.center[2]);
  });

  it('leaves a thin bezel on wide windows and covers on phones', () => {
    const wide = screenPose('wide', 16 / 9);
    expect(wide.position[2] - GLASS.center[2]).toBeCloseTo(glassDistance(wide.fov, 16 / 9, 'contain') * 1.04, 9);
    const phone = screenPose('portrait', 390 / 844);
    expect(phone.position[2] - GLASS.center[2]).toBeCloseTo(glassDistance(phone.fov, 390 / 844, 'cover'), 9);
  });
});
