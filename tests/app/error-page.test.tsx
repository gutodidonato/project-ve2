// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import ErrorPage from '@/app/[locale]/error';
import en from '@/messages/en.json';
import pt from '@/messages/pt.json';

function renderError(locale: 'pt' | 'en') {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === 'en' ? en : pt}>
      <ErrorPage error={new Error('boom')} reset={vi.fn()} />
    </NextIntlClientProvider>,
  );
}

describe('app/[locale]/error.tsx', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('reports the error to the console', () => {
    renderError('en');
    expect(console.error).toHaveBeenCalledWith(expect.objectContaining({ message: 'boom' }));
  });

  it('says something went wrong in Portuguese and links to a reload of /pt', () => {
    renderError('pt');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Algo deu errado');
    const link = screen.getByRole('link', { name: 'Recarregar a página' });
    expect(link.getAttribute('href')).toBe('/pt');
  });

  it('says something went wrong in English and links to a reload of /en', () => {
    renderError('en');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Something went wrong');
    const link = screen.getByRole('link', { name: 'Reload the page' });
    expect(link.getAttribute('href')).toBe('/en');
  });

  it('is a plain document link, so following it is a full reload', () => {
    renderError('en');
    // A client-side <Link> navigation could keep the broken React tree alive.
    expect(screen.getByRole('link').tagName).toBe('A');
  });
});
