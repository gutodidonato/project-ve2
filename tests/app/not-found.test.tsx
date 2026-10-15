import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import NotFound, { metadata } from '@/app/not-found';

// next/font only works inside the Next compiler.
vi.mock('@/app/fonts', () => ({ fontVariables: 'font-vars' }));

describe('app/not-found.tsx', () => {
  const markup = renderToStaticMarkup(<NotFound />);

  it('brings its own document, since no layout above it owns <html> and <body>', () => {
    expect(markup).toMatch(/^<html lang="pt-BR" class="font-vars">(<head><\/head>)?<body>/);
    expect(markup.endsWith('</body></html>')).toBe(true);
  });

  it('says it in Portuguese and in English, each marked with its language', () => {
    expect(markup).toContain('Fim da estrada');
    expect(markup).toContain('Esta página não existe');
    expect(markup).toMatch(/<section lang="en"[^>]*>[\s\S]*End of the road[\s\S]*<\/section>/);
  });

  it('links back to both homes', () => {
    expect(markup).toMatch(/<a [^>]*href="\/pt"[^>]*>Voltar ao início<\/a>/);
    expect(markup).toMatch(/<a [^>]*href="\/en"[^>]*>Back to home<\/a>/);
  });

  it('has a title of its own and one h1', () => {
    expect(metadata.title).toBe('404 · Rodovia 2026');
    expect(markup.match(/<h1[ >]/g)).toHaveLength(1);
  });
});
