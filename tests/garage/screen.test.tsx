// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { Screen } from '@/components/garage/screen/Screen';
import { getProfile } from '@/content';
import type { Locale } from '@/content/types';
import type { GarageAction, GarageState } from '@/lib/garage/state';
import en from '@/messages/en.json';
import pt from '@/messages/pt.json';

const MESSAGES = { pt, en };

function show(locale: Locale, state: GarageState, last: GarageAction | null = null, onAction = vi.fn()) {
  render(
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
      <Screen profile={getProfile(locale)} locale={locale} state={state} last={last} onAction={onAction} />
    </NextIntlClientProvider>,
  );
  return onAction;
}

const bench: GarageState = { view: 'bench', content: null };

afterEach(cleanup);

describe('screen menu', () => {
  it('lists the four keys in order', () => {
    show('pt', bench);
    const labels = screen.getAllByRole('button').map((b) => b.textContent ?? '');
    expect(labels).toHaveLength(4);
    ['Currículo', 'Jogar Salto 88', 'Contato', 'English'].forEach((text, i) => expect(labels[i]).toContain(text));
    cleanup();
    show('en', bench);
    const english = screen.getAllByRole('button').map((b) => b.textContent ?? '');
    ['Resume', 'Play Salto 88', 'Contact', 'Português'].forEach((text, i) => expect(english[i]).toContain(text));
  });

  it('sends the action of the clicked button', () => {
    const onAction = show('pt', bench);
    fireEvent.click(screen.getByRole('button', { name: /Contato/ }));
    expect(onAction).toHaveBeenCalledWith('contact');
  });

  it('shows the last action on the prompt', () => {
    show('pt', bench, 'cv');
    expect(screen.getByTestId('prompt').textContent).toContain('> currículo');
    cleanup();
    show('pt', bench, null);
    expect(screen.getByTestId('prompt').textContent?.startsWith('> _')).toBe(true);
  });

  it('shows the name and the headline', () => {
    show('pt', bench);
    expect(screen.getByText(getProfile('pt').name)).toBeTruthy();
    expect(screen.getByText(getProfile('pt').headline)).toBeTruthy();
  });
});

describe('screen resume', () => {
  const cv: GarageState = { view: 'screen', content: 'cv' };

  it('shows the profile sections in order, as written in the CV', () => {
    show('pt', cv);
    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(headings).toEqual(['Resumo', 'Experiência', 'Cases', 'Competências', 'Formação', 'Idiomas']);
    expect(screen.getAllByText(getProfile('pt').experience[0].role).length).toBeGreaterThan(0);
    expect(document.body.textContent).toContain('−80%');
  });

  it('labels the PDF in Portuguese while there is no English one', () => {
    show('en', cv);
    const pdf = screen.getByRole('link', { name: 'PDF (in Portuguese)' });
    expect(pdf.getAttribute('href')).toBe('/cv/luis-didonato-pt.pdf');
  });

  it('goes back with its button', () => {
    const onAction = show('pt', cv);
    fireEvent.click(screen.getByRole('button', { name: 'Voltar (Esc)' }));
    expect(onAction).toHaveBeenCalledWith('back');
  });
});

describe('screen contact', () => {
  const contact: GarageState = { view: 'screen', content: 'contact' };

  it('has no phone and lists consulting', () => {
    show('pt', contact);
    const text = document.body.textContent ?? '';
    expect(text).not.toMatch(/\+?\d[\d\s()-]{8,}/);
    expect(text).toContain('Consultoria:');
    expect(screen.queryByText('Agendar conversa')).toBeNull();
    expect(screen.getByRole('link', { name: /linkedin/i })).toBeTruthy();
  });
});

describe('screen launch', () => {
  const launch: GarageState = { view: 'launch', content: null };

  it('shows the destination, and the language notice only in English', () => {
    show('pt', launch);
    expect(document.body.textContent).toContain('Destino: fev 2019');
    expect(document.body.textContent).not.toContain('Game in Portuguese');
    cleanup();
    show('en', launch);
    expect(document.body.textContent).toContain('Destination: Feb 2019');
    expect(document.body.textContent).toContain('Game in Portuguese for now');
  });
});
