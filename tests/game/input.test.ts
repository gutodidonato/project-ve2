// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  DRAG_SCALE,
  MOVEMENT_CODES,
  isKeyboardActivatable,
  isTypingTarget,
  keysToControls,
  wheelPixels,
} from '@/lib/game/input';

describe('keysToControls', () => {
  it('maps W+A to full throttle and left steer', () => {
    expect(keysToControls(new Set(['KeyW', 'KeyA']))).toEqual({ throttle: 1, steer: 1 });
  });

  it('maps arrow keys like WASD', () => {
    expect(keysToControls(new Set(['ArrowUp', 'ArrowRight']))).toEqual({ throttle: 1, steer: -1 });
    expect(keysToControls(new Set(['ArrowDown', 'ArrowLeft']))).toEqual({ throttle: -1, steer: 1 });
    expect(keysToControls(new Set(['KeyS', 'KeyD']))).toEqual({ throttle: -1, steer: -1 });
  });

  it('cancels opposing keys and ignores unrelated ones', () => {
    expect(keysToControls(new Set(['KeyW', 'KeyS', 'KeyA', 'KeyD']))).toEqual({ throttle: 0, steer: 0 });
    expect(keysToControls(new Set(['KeyW', 'ArrowDown']))).toEqual({ throttle: 0, steer: 0 });
    expect(keysToControls(new Set(['KeyP', 'Space']))).toEqual({ throttle: 0, steer: 0 });
    expect(keysToControls(new Set())).toEqual({ throttle: 0, steer: 0 });
  });
});

describe('isTypingTarget', () => {
  it('is true for form fields and contenteditable elements', () => {
    expect(isTypingTarget(document.createElement('input'))).toBe(true);
    expect(isTypingTarget(document.createElement('textarea'))).toBe(true);
    expect(isTypingTarget(document.createElement('select'))).toBe(true);
    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    expect(isTypingTarget(editable)).toBe(true);
    const bare = document.createElement('div');
    bare.setAttribute('contenteditable', '');
    expect(isTypingTarget(bare)).toBe(true);
  });

  it('is true for an element nested in a contenteditable host', () => {
    const host = document.createElement('div');
    host.setAttribute('contenteditable', 'true');
    const span = document.createElement('span');
    host.appendChild(span);
    expect(isTypingTarget(span)).toBe(true);
  });

  it('is false for the canvas, plain elements, contenteditable=false and null', () => {
    expect(isTypingTarget(document.createElement('canvas'))).toBe(false);
    expect(isTypingTarget(document.createElement('div'))).toBe(false);
    expect(isTypingTarget(document.createElement('button'))).toBe(false);
    const off = document.createElement('div');
    off.setAttribute('contenteditable', 'false');
    expect(isTypingTarget(off)).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
    expect(isTypingTarget(window)).toBe(false);
    expect(isTypingTarget(document)).toBe(false);
  });
});

describe('MOVEMENT_CODES', () => {
  it('is exactly the eight driving codes, so Space and P can never be held', () => {
    expect([...MOVEMENT_CODES].sort()).toEqual(
      ['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'KeyA', 'KeyD', 'KeyS', 'KeyW'].sort(),
    );
    for (const code of MOVEMENT_CODES) {
      expect(keysToControls(new Set([code]))).not.toEqual({ throttle: 0, steer: 0 });
    }
  });
});

describe('wheelPixels', () => {
  it('passes pixel deltas through and scales lines and pages', () => {
    expect(wheelPixels(100, 0, 800)).toBe(100);
    expect(wheelPixels(-100, 0, 800)).toBe(-100);
    expect(wheelPixels(3, 1, 800)).toBe(48);
    expect(wheelPixels(1, 2, 800)).toBe(800);
  });
});

describe('DRAG_SCALE', () => {
  it('reaches full autopilot speed (~14.5 world units) at about 97 px of drag', () => {
    expect(97 * DRAG_SCALE).toBeCloseTo(14.5, 1);
  });
});

describe('isKeyboardActivatable', () => {
  it('is false for plain elements, the canvas and null', () => {
    expect(isKeyboardActivatable(document.createElement('div'))).toBe(false);
    expect(isKeyboardActivatable(document.createElement('canvas'))).toBe(false);
    expect(isKeyboardActivatable(null)).toBe(false);
    expect(isKeyboardActivatable(window)).toBe(false);
  });

  it('is false for a control that is not focused (no keyboard focus ring to honor)', () => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    expect(isKeyboardActivatable(button)).toBe(false);
    button.remove();
  });

  it('is false for a focused link, which Space does not activate', () => {
    const link = document.createElement('a');
    link.href = '#contato';
    link.textContent = 'Contato';
    document.body.appendChild(link);
    link.focus();
    expect(document.activeElement).toBe(link);
    expect(isKeyboardActivatable(link)).toBe(false);
    link.remove();
  });
});
