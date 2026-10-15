import { expect, test } from '@playwright/test';

test.describe('locale routing', () => {
  test('/ with Accept-Language en-US redirects to /en', async ({ playwright, baseURL }) => {
    const ctx = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { 'Accept-Language': 'en-US' },
    });
    const res = await ctx.get('/');
    expect(new URL(res.url()).pathname).toMatch(/\/en\/?$/);
    expect(res.status()).toBe(200);
    await ctx.dispose();
  });

  test('/ with Accept-Language pt-BR redirects to /pt', async ({ playwright, baseURL }) => {
    const ctx = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { 'Accept-Language': 'pt-BR' },
    });
    const res = await ctx.get('/');
    expect(new URL(res.url()).pathname).toMatch(/\/pt\/?$/);
    expect(res.status()).toBe(200);
    await ctx.dispose();
  });

  test('/pt sets html lang pt-BR', async ({ page }) => {
    await page.goto('/pt');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  });

  test('/en sets html lang en', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('/de is handled by the proxy and redirected under the default locale', async ({
    playwright,
    baseURL,
  }) => {
    const ctx = await playwright.request.newContext({ baseURL });
    const res = await ctx.get('/de', { maxRedirects: 0 });
    expect([307, 308]).toContain(res.status());
    expect(res.headers()['location']).toMatch(/\/pt\/de$/);
    await ctx.dispose();
  });

  test('file-extension paths bypass the locale proxy', async ({
    playwright,
    baseURL,
  }) => {
    const ctx = await playwright.request.newContext({ baseURL });
    const res = await ctx.get('/cv/x.pdf', { maxRedirects: 0 });
    expect(res.status()).toBe(404);
    expect(res.headers()['location']).toBeUndefined();
    await ctx.dispose();
  });

  test('/de responds 404', async ({ page }) => {
    const res = await page.goto('/de');
    expect(res?.status()).toBe(404);
  });
});
