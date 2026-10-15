import { expect, test } from '@playwright/test';

test.describe('404', () => {
  test('/pt/nao-existe answers 404 with a branded page that links back to /pt', async ({ page }) => {
    const res = await page.goto('/pt/nao-existe');
    expect(res?.status()).toBe(404);

    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page).toHaveTitle('404 · Rodovia 2026');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fim da estrada');
    // Bilingual: the visitor's language is unknown here.
    await expect(page.getByText('This page does not exist or has moved.')).toBeVisible();

    const pt = page.getByRole('link', { name: 'Voltar ao início' });
    const en = page.getByRole('link', { name: 'Back to home' });
    await expect(pt).toHaveAttribute('href', '/pt');
    await expect(en).toHaveAttribute('href', '/en');

    // The brand fonts are loaded, not the browser default (the 404 owns its own <html>).
    const display = await page.getByRole('heading', { level: 1 }).evaluate((el) => getComputedStyle(el).fontFamily);
    expect(display).toMatch(/Michroma/i);

    await pt.click();
    await expect(page).toHaveURL(/\/pt$/);
    await expect(page.locator('main#pitstop')).toBeAttached();
  });

  test('/en/nao-existe and an unknown top-level path get the same page', async ({ request }) => {
    for (const path of ['/en/nao-existe', '/pt/a/b/c']) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(404);
      const html = await res.text();
      expect(html, path).toContain('Fim da estrada');
      expect(html, path).toContain('href="/en"');
    }
  });

  test('the 404 page stays free of the 3D layer and the phone number', async ({ request }) => {
    const html = await (await request.get('/pt/nao-existe')).text();
    expect(html).not.toContain('WebGLRenderer');
    expect(html).not.toMatch(/tel:|\+55|\(11\)\s?9/);
  });
});
