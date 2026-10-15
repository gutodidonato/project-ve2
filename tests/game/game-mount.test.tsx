// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { GameMount } from '@/components/game/GameMount';
import { getProfile } from '@/content';
import en from '@/messages/en.json';
import { useGameStore } from '@/lib/store';

// Next resolves `next/dynamic` to its app-router build (React.lazy: a failed import throws into the
// nearest error boundary). Plain Node would pick the pages build, which swallows load errors.
vi.mock('next/dynamic', async () => {
  const appDynamic = await import('next/dist/shared/lib/app-dynamic');
  return { default: appDynamic.default };
});

// The mount-time probe says WebGL works: what fails below is the game layer itself.
vi.mock('@/components/game/useWebglSupport', () => ({ detectWebgl: () => true }));

// What the mocked GameLayer does when it is loaded and rendered.
const layer = vi.hoisted(() => ({ mode: 'ok' as 'ok' | 'render-error' }));

vi.mock('@/components/game/GameLayer', () => ({
  default: function GameLayer() {
    if (layer.mode === 'render-error') throw new Error('HUD blew up');
    return <div data-testid="game-layer" />;
  },
}));

function mount() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <main id="pitstop" inert>
        pit stop
      </main>
      <GameMount profile={getProfile('en')} locale="en" />
    </NextIntlClientProvider>,
  );
}

const html = document.documentElement;

describe('GameMount resilience', () => {
  beforeEach(() => {
    useGameStore.setState({ pitstop: false, pitstopForced: false, pitstopReason: null, pitstopReady: false });
    window.history.replaceState(null, '', '/en');
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    // React logs every caught render error; the boundary is the thing under test.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    delete html.dataset.mode;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('runs the game layer when nothing fails', async () => {
    layer.mode = 'ok';
    mount();
    expect(await screen.findByTestId('game-layer')).toBeTruthy();
    expect(html.dataset.mode).toBe('game');
    expect(useGameStore.getState().pitstopForced).toBe(false);
  });

  it('a render error under the game layer forces a pit stop that stays', async () => {
    layer.mode = 'render-error';
    mount();
    await waitFor(() => expect(useGameStore.getState().pitstopForced).toBe(true));
    expect(useGameStore.getState().pitstop).toBe(true);
    expect(useGameStore.getState().pitstopReason).toBe('error');
    expect(html.dataset.mode).toBe('pitstop');
    expect(document.getElementById('pitstop')?.hasAttribute('inert')).toBe(false);
    expect(screen.queryByTestId('game-layer')).toBeNull();
    // The explanation is visible and generic: the browser may well have WebGL.
    expect(screen.getByText('The game could not load.')).toBeTruthy();
    expect(screen.queryByText(/WebGL/)).toBeNull();
  });
});
