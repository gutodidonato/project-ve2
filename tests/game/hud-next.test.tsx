// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { Hud } from '@/components/game/Hud';
import { getProfile } from '@/content';
import { inputQueue } from '@/lib/game/runtime';
import { ZONES } from '@/lib/game/zones';
import en from '@/messages/en.json';
import pt from '@/messages/pt.json';

function renderHud(locale: 'pt' | 'en') {
  const messages = locale === 'en' ? en : pt;
  const names = Object.fromEntries(ZONES.map((z) => [z.id, messages.Game.zones[z.id]])) as Record<
    (typeof ZONES)[number]['id'],
    string
  >;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Hud profile={getProfile(locale)} locale={locale} names={names} />
    </NextIntlClientProvider>,
  );
}

describe('HUD next stop button (the touch control for "next stop", spec 3.4)', () => {
  beforeEach(() => {
    inputQueue.releaseAll();
    inputQueue.endDrag();
    inputQueue.consume();
  });

  afterEach(cleanup);

  it('sends the car to the next stop, like Space', () => {
    renderHud('pt');
    fireEvent.click(screen.getByRole('button', { name: 'Próxima parada' }));
    expect(inputQueue.consume().nextStop).toBe(true);
    // One tap is one request.
    expect(inputQueue.consume().nextStop).toBe(false);
  });

  it('reads "Próxima ›" in Portuguese and "Next ›" in English, naming the stop for screen readers', () => {
    renderHud('pt');
    const pt = screen.getByRole('button', { name: 'Próxima parada' });
    expect(pt.textContent?.replace(/\s+/g, ' ').trim()).toBe('Próxima ›');
    cleanup();

    renderHud('en');
    const en = screen.getByRole('button', { name: 'Next stop' });
    expect(en.textContent?.replace(/\s+/g, ' ').trim()).toBe('Next ›');
  });

  it('keeps the visible label inside the accessible name (WCAG 2.5.3)', () => {
    renderHud('pt');
    const button = screen.getByRole('button', { name: /Próxima/ });
    expect(button.getAttribute('aria-label')).toContain('Próxima');
  });
});
