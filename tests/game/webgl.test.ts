// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { detectWebgl } from '@/components/game/useWebglSupport';

type GetContext = (id: string) => unknown;

/** Replaces `canvas.getContext` for the next `document.createElement('canvas')`. */
function stubGetContext(impl: GetContext) {
  return vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(impl as never);
}

describe('detectWebgl', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is false when neither webgl2 nor webgl can be created', () => {
    const spy = stubGetContext(() => null);
    expect(detectWebgl()).toBe(false);
    expect(spy.mock.calls.map((c) => c[0])).toEqual(['webgl2', 'webgl']);
  });

  it('is true with webgl2 and does not probe webgl', () => {
    const spy = stubGetContext((id) => (id === 'webgl2' ? { getExtension: () => null } : null));
    expect(detectWebgl()).toBe(true);
    expect(spy.mock.calls.map((c) => c[0])).toEqual(['webgl2']);
  });

  it('falls back to webgl when webgl2 is unavailable', () => {
    const spy = stubGetContext((id) => (id === 'webgl' ? { getExtension: () => null } : null));
    expect(detectWebgl()).toBe(true);
    expect(spy.mock.calls.map((c) => c[0])).toEqual(['webgl2', 'webgl']);
  });

  it('releases the probe context through WEBGL_lose_context', () => {
    const loseContext = vi.fn();
    stubGetContext(() => ({
      getExtension: (name: string) => (name === 'WEBGL_lose_context' ? { loseContext } : null),
    }));
    expect(detectWebgl()).toBe(true);
    expect(loseContext).toHaveBeenCalledTimes(1);
  });

  it('is false, without throwing, when getContext throws', () => {
    stubGetContext(() => {
      throw new Error('blocked');
    });
    expect(detectWebgl()).toBe(false);
  });

  it('is still true when releasing the context throws', () => {
    stubGetContext(() => ({
      getExtension: () => ({
        loseContext: () => {
          throw new Error('lost');
        },
      }),
    }));
    expect(detectWebgl()).toBe(true);
  });
});
