// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { useHashSync } from '@/components/game/useHashSync';
import { inputQueue, resetRuntime } from '@/lib/game/runtime';
import { useGameStore } from '@/lib/store';

const setZone = (zone: Parameters<ReturnType<typeof useGameStore.getState>['setZone']>[0]) =>
  act(() => useGameStore.getState().setZone(zone));

describe('useHashSync', () => {
  beforeEach(() => {
    useGameStore.setState({ zone: null });
    window.history.replaceState(null, '', '/pt');
    resetRuntime(null);
    inputQueue.consume();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('leaves a hash that is not a zone alone on mount, until the car moves', () => {
    window.history.replaceState(null, '', '/pt?x=1#foo');
    const spy = vi.spyOn(window.history, 'replaceState');
    renderHook(() => useHashSync());
    expect(spy).not.toHaveBeenCalled();
    expect(window.location.hash).toBe('#foo');
  });

  it('leaves the spawn hash alone on mount: the car was spawned from it', () => {
    resetRuntime('cases');
    window.history.replaceState(null, '', '/pt#cases');
    const spy = vi.spyOn(window.history, 'replaceState');
    renderHook(() => useHashSync());
    expect(spy).not.toHaveBeenCalled();
  });

  it('on mount, points a zone hash that disagrees with the car at the car', () => {
    resetRuntime('oficina');
    window.history.replaceState(null, '', '/pt?x=1#contato');
    renderHook(() => useHashSync());
    expect(window.location.hash).toBe('#oficina');
    cleanup();

    resetRuntime(null);
    window.history.replaceState(null, '', '/pt?x=1#contato');
    renderHook(() => useHashSync());
    expect(window.location.hash).toBe('');
    expect(window.location.href.endsWith('/pt?x=1')).toBe(true);
  });

  it('puts the zone in the hash and clears it on the road, without new history entries', () => {
    window.history.replaceState(null, '', '/pt?x=1');
    const length = window.history.length;
    renderHook(() => useHashSync());

    setZone('cases');
    expect(window.location.hash).toBe('#cases');
    expect(window.location.pathname + window.location.search).toBe('/pt?x=1');

    setZone('contato');
    expect(window.location.hash).toBe('#contato');

    setZone(null);
    expect(window.location.hash).toBe('');
    expect(window.location.href.endsWith('/pt?x=1')).toBe(true);
    expect(window.history.length).toBe(length);
  });

  it('does not rewrite a hash that already names the zone', () => {
    resetRuntime('cases');
    window.history.replaceState(null, '', '/pt#cases');
    renderHook(() => useHashSync());
    const spy = vi.spyOn(window.history, 'replaceState');
    setZone('cases');
    expect(spy).not.toHaveBeenCalled();
  });

  it('stops syncing once unmounted', () => {
    const { unmount } = renderHook(() => useHashSync());
    unmount();
    setZone('oficina');
    expect(window.location.hash).toBe('');
  });

  it('sends the car to a zone hash typed into the address bar, and ignores others', () => {
    renderHook(() => useHashSync());

    window.history.replaceState(null, '', '/pt#servicos');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    expect(inputQueue.consume().gotoZone).toBe('servicos');

    window.history.replaceState(null, '', '/pt#Cases');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    expect(inputQueue.consume().gotoZone).toBeNull();
  });
});
