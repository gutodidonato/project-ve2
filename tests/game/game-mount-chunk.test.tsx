// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { GameMount } from '@/components/game/GameMount';
import { getProfile } from '@/content';
import en from '@/messages/en.json';
import { useGameStore } from '@/lib/store';

// A separate file from game-mount.test.tsx: next/dynamic caches a loaded (or failed)
// module for the life of the page, so each outcome needs a fresh module registry.

// Next resolves `next/dynamic` to its app-router build (React.lazy: a failed import throws into the
// nearest error boundary). Plain Node would pick the pages build, which swallows load errors.
vi.mock('next/dynamic', async () => {
  const appDynamic = await import('next/dist/shared/lib/app-dynamic');
  return { default: appDynamic.default };
});

// The mount-time probe says WebGL works: what fails below is the game layer itself.
vi.mock('@/components/game/useWebglSupport', () => ({ detectWebgl: () => true }));

// The dynamic import of the game layer rejects, like a chunk that never arrives.
vi.mock('@/components/game/GameLayer', () => {
  throw new Error('Loading chunk 42 failed');
});

describe('GameMount when the game layer chunk fails to load', () => {
  beforeEach(() => {
    useGameStore.setState({ pitstop: false, pitstopForced: false, pitstopReason: null, pitstopReady: false });
    window.history.replaceState(null, '', '/en');
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    delete document.documentElement.dataset.mode;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('forces a pit stop that stays instead of unmounting the page', async () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <main id="pitstop" inert>
          pit stop
        </main>
        <GameMount profile={getProfile('en')} locale="en" />
      </NextIntlClientProvider>,
    );
    await waitFor(() => expect(useGameStore.getState().pitstopForced).toBe(true));
    expect(useGameStore.getState().pitstop).toBe(true);
    expect(useGameStore.getState().pitstopReason).toBe('error');
    expect(document.documentElement.dataset.mode).toBe('pitstop');
    // The pit stop is still in the document, readable and not inert.
    expect(screen.getByText('pit stop')).toBeTruthy();
    expect(document.getElementById('pitstop')?.hasAttribute('inert')).toBe(false);
    expect(screen.getByRole('button', { name: 'Enter the game' }).getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByText('The game could not load.')).toBeTruthy();
  });
});
