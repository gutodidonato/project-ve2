// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { isTypingTarget } from '@/lib/game/input';

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
