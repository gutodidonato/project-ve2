import { expect, test } from '@playwright/test';

const GITHUB = 'https://github.com/gutodidonato';
const EMAIL = 'gutodidonato@gmail.com';
// Generic phone-absence pattern (Ruling R5): never put real phone digits in tests.
const PHONE = /tel:|telephone|\+55|\(11\)\s?9/i;

test.describe('sitemap, robots and CV', () => {
  test('/sitemap.xml lists /pt and /en with alternates', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();
    expect(xml).toMatch(/<loc>[^<]*\/pt<\/loc>/);
    expect(xml).toMatch(/<loc>[^<]*\/en<\/loc>/);
    expect(xml).toMatch(/hreflang="en"/);
    expect(xml).toMatch(/hreflang="pt-BR"/);
  });

  test('/robots.txt allows all and points at the sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const txt = await res.text();
    expect(txt).toMatch(/Allow: \//);
    expect(txt).toMatch(/Sitemap: \S+\/sitemap\.xml/);
  });

  test('the CV PDF is served as application/pdf', async ({ request }) => {
    const res = await request.get('/cv/luis-didonato-pt.pdf');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/pdf');
  });
});

test.describe('metadata', () => {
  test('/pt: title, description, canonical, hreflang alternates and Open Graph', async ({
    page,
  }) => {
    await page.goto('/pt');
    await expect(page).toHaveTitle('Luis Didonato · CTO / Tech Lead');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /Engenheiro de software com experiência em backend/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/pt$/);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
      'href',
      /\/en$/,
    );
    await expect(page.locator('link[rel="alternate"][hreflang="pt-BR"]')).toHaveAttribute(
      'href',
      /\/pt$/,
    );
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
      'href',
      /\/pt$/,
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'profile');
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'pt_BR');
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /\/pt$/);
  });

  test('/en: title, description, canonical and Open Graph locale', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveTitle('Luis Didonato · CTO / Tech Lead');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /Software engineer with experience in backend/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en$/);
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US');
  });
});

test.describe('structured data', () => {
  for (const locale of ['pt', 'en'] as const) {
    test(`/${locale}: JSON-LD Person with role and sameAs, no phone and no email`, async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      const blocks = page.locator('script[type="application/ld+json"]');
      await expect(blocks).toHaveCount(1);
      const raw = (await blocks.first().textContent()) ?? '';
      const ld = JSON.parse(raw);

      expect(ld['@context']).toBe('https://schema.org');
      expect(ld['@type']).toBe('Person');
      expect(ld.name).toBe('Luis Augusto de Petta Didonato');
      expect(ld.alternateName).toBe('Luis Didonato');
      expect(ld.jobTitle).toBe('CTO / Tech Lead');
      expect(ld.worksFor).toEqual({ '@type': 'Organization', name: 'EVIG' });
      expect(ld.url).toMatch(new RegExp(`/${locale}$`));
      expect(ld.sameAs).toContain(GITHUB);
      expect(ld).not.toHaveProperty('telephone');
      expect(ld).not.toHaveProperty('email');
      expect(raw).not.toContain(EMAIL);
      expect(raw).not.toMatch(PHONE);
    });
  }
});
