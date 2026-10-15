// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { PitstopToggle } from '@/components/game/PitstopToggle';
import en from '@/messages/en.json';
import pt from '@/messages/pt.json';
import { useGameStore } from '@/lib/store';

function renderToggle(locale: 'pt' | 'en' = 'en') {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === 'en' ? en : pt}>
      <PitstopToggle />
    </NextIntlClientProvider>,
  );
}

describe('PitstopToggle', () => {
  beforeEach(() => {
    useGameStore.setState({ pitstop: false, pitstopForced: false, pitstopReason: null, pitstopReady: true });
  });

  afterEach(cleanup);

  it('renders nothing until the initial decision is made', () => {
    useGameStore.setState({ pitstopReady: false });
    const { container } = renderToggle();
    expect(container.firstChild).toBeNull();
  });

  it('swaps its label instead of announcing a pressed state', () => {
    renderToggle();
    const button = screen.getByRole('button', { name: 'Pit stop mode (P)' });
    expect(button.hasAttribute('aria-pressed')).toBe(false);
    cleanup();

    useGameStore.setState({ pitstop: true });
    renderToggle();
    expect(screen.getByRole('button', { name: 'Enter the game' }).hasAttribute('aria-pressed')).toBe(false);
  });

  it('shows no note while the game can be entered', () => {
    renderToggle();
    const button = screen.getByRole('button');
    expect(button.hasAttribute('aria-disabled')).toBe(false);
    expect(button.hasAttribute('aria-describedby')).toBe(false);
    expect(document.querySelector('[aria-live="polite"]')?.textContent ?? '').toBe('');
    // Not a status landmark: the contact form's confirmation is the page's one `role="status"`.
    expect(document.querySelector('[role="status"]')).toBeNull();
  });

  it('explains a missing WebGL in visible text tied to the button, not only in a title', () => {
    useGameStore.setState({ pitstop: true, pitstopForced: true, pitstopReason: 'webgl' });
    renderToggle();
    const button = screen.getByRole('button', { name: 'Enter the game' });
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.hasAttribute('title')).toBe(false);
    const note = screen.getByText('Your browser has no WebGL, so game mode is unavailable.');
    expect(button.getAttribute('aria-describedby')).toBe(note.id);
    expect(note.id).not.toBe('');
    // Polite and atomic: a failure while the page is open is announced as a whole sentence.
    expect(note.getAttribute('aria-live')).toBe('polite');
    expect(note.getAttribute('aria-atomic')).toBe('true');
  });

  it('explains a game that failed to load generically, in either language', () => {
    useGameStore.setState({ pitstop: true, pitstopForced: true, pitstopReason: 'error' });
    renderToggle('en');
    expect(screen.getByText('The game could not load.')).toBeTruthy();
    expect(screen.queryByText(/WebGL/)).toBeNull();
    cleanup();

    renderToggle('pt');
    expect(screen.getByText('O jogo não pôde carregar.')).toBeTruthy();
  });
});
