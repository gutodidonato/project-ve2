import { expect, test } from '@playwright/test';

// Generic phone-absence pattern (Ruling R5): never put real phone digits in tests.
const PHONE = /tel:|\+55|\(11\)\s?9/;
const SECTION_IDS = ['experiencia', 'cases', 'oficina', 'servicos', 'contato'];
const EMAIL = 'gutodidonato@gmail.com';
const EMAIL_OBFUSCATED = 'gutodidonato [at] gmail [dot] com';
const MODEL_CREDIT =
  '"DeLorean DMC12 || Retro wave art" by dark_igorek (https://sketchfab.com/3d-models/delorean-dmc12-retro-wave-art-6b18d3a8859749379987380bf2ac34ab), CC BY 4.0, modified (optimized).';

test.describe('pit stop, server HTML only (JS disabled)', () => {
  test.use({ javaScriptEnabled: false });

  test('/pt renders name, role, companies, impact, cases and model credit', async ({ page }) => {
    await page.goto('/pt');
    const text = await page.locator('main#pitstop.pitstop').innerText();
    for (const s of [
      'Luis Didonato',
      'CTO / Tech Lead',
      'EVIG',
      'Colmeia',
      'ValiantGroup',
      'RedBit',
      '−80%',
      'Oceans-20',
      'dark_igorek',
    ]) {
      expect(text, s).toContain(s);
    }
    expect(text).toContain(MODEL_CREDIT);
  });

  test('/en renders the English title and headline', async ({ page }) => {
    await page.goto('/en');
    const text = await page.locator('main#pitstop.pitstop').innerText();
    expect(text).toContain('Software Engineer');
    expect(text).toContain('CTO / Tech Lead at EVIG');
    expect(text).toContain(MODEL_CREDIT);
  });

  for (const locale of ['pt', 'en']) {
    test(`/${locale} has every zone anchor`, async ({ page }) => {
      await page.goto(`/${locale}`);
      for (const id of SECTION_IDS) {
        await expect(page.locator(`main#pitstop section#${id}`), id).toHaveCount(1);
      }
    });

    test(`/${locale} server HTML has no phone and no mailto, only the obfuscated email`, async ({
      request,
    }) => {
      const res = await request.get(`/${locale}`);
      expect(res.status()).toBe(200);
      const html = await res.text();
      expect(html).not.toMatch(PHONE);
      expect(html).not.toContain('mailto:');
      expect(html).toContain(EMAIL_OBFUSCATED);
    });
  }
});

test.describe('pit stop with JS', () => {
  // Game mode hides the one-pager and locks scrolling; these specs are about the pit stop itself.
  test.use({ reducedMotion: 'reduce' });

  test('/pt reveals a mailto link after hydration', async ({ page }) => {
    await page.goto('/pt');
    const link = page.locator(`#contato a[href="mailto:${EMAIL}"]`);
    await expect(link).toBeAttached();
    await expect(link).toHaveText(EMAIL);
    expect(await page.content()).not.toMatch(PHONE);
  });

  test('no horizontal overflow on mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile viewport only');
    for (const width of [page.viewportSize()?.width ?? 412, 375, 320]) {
      await page.setViewportSize({ width, height: 812 });
      for (const locale of ['pt', 'en']) {
        await page.goto(`/${locale}`);
        await page.evaluate(() => document.fonts.ready);
        const m = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(m.scrollWidth, `${locale} @ ${width}px`).toBeLessThanOrEqual(m.innerWidth);
        expect(m.scrollWidth, `${locale} @ ${width}px`).toBeLessThanOrEqual(m.clientWidth);
      }
    }
  });
});
