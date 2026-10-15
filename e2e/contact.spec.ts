import { expect, test, type Page } from '@playwright/test';

const EMAIL = 'gutodidonato@gmail.com';

// The form lives in the pit stop one-pager, which is visually hidden in game mode:
// start in pit stop (reduced motion) rather than depend on the toggle.
test.use({ reducedMotion: 'reduce' });

/** Hydration is done once the obfuscated email has become a mailto link (same client pass as the form). */
async function openContact(page: Page, locale: 'pt' | 'en') {
  await page.goto(`/${locale}`);
  await expect(page.locator(`#contato a[href="mailto:${EMAIL}"]`)).toBeAttached();
  return page.locator('#contato form');
}

async function fill(page: Page, labels: { name: string; email: string; message: string }) {
  await page.getByLabel(labels.name).fill('Ada Lovelace');
  await page.getByLabel(labels.email).fill('ada@example.com');
  await page.getByLabel(labels.message).fill('Hello, I would like to talk about a project.');
}

const PT = { name: 'Nome', email: 'Email', message: 'Mensagem' };
const EN = { name: 'Name', email: 'Email', message: 'Message' };

test.describe('contact form', () => {
  test('/pt: sends the JSON and replaces the form with the confirmation', async ({ page }) => {
    let body: unknown;
    await page.route('**/api/contact', async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({ status: 200, json: { ok: true } });
    });
    const form = await openContact(page, 'pt');
    await fill(page, PT);
    await form.getByRole('button', { name: 'Enviar mensagem' }).click();

    await expect(page.getByRole('status')).toHaveText(/Mensagem enviada/);
    await expect(form).toHaveCount(0);
    expect(body).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'Hello, I would like to talk about a project.',
      website: '',
    });
  });

  test('/en: field errors from a 400 are shown in English next to the fields', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 400, json: { error: 'invalid', fields: ['email'] } }),
    );
    const form = await openContact(page, 'en');
    await fill(page, EN);
    await form.getByRole('button', { name: 'Send message' }).click();

    const email = page.getByLabel('Email');
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toBeFocused();
    await expect(page.getByText('Enter a valid email address.')).toBeVisible();
    await expect(page.getByLabel('Name')).not.toHaveAttribute('aria-invalid', 'true');
  });

  test('/pt: a 503 shows the email address as a mailto link', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 503, json: { error: 'unavailable' } }),
    );
    const form = await openContact(page, 'pt');
    await fill(page, PT);
    await form.getByRole('button', { name: 'Enviar mensagem' }).click();

    const alert = form.getByRole('alert');
    await expect(alert).toContainText('Não foi possível enviar agora');
    await expect(alert.locator(`a[href="mailto:${EMAIL}"]`)).toHaveText(EMAIL);
  });

  test('/en: a 429 asks the visitor to try again later', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 429, json: { error: 'rate_limited' } }),
    );
    const form = await openContact(page, 'en');
    await fill(page, EN);
    await form.getByRole('button', { name: 'Send message' }).click();
    await expect(form.getByRole('alert')).toContainText('Too many messages');
  });

  test('typing in the form never navigates or submits natively', async ({ page }) => {
    const form = await openContact(page, 'pt');
    await page.getByLabel('Nome').fill('Ada Lovelace');
    await page.getByLabel('Nome').press('Enter');
    await expect(page).toHaveURL(/\/pt$/);
    await expect(form).toBeVisible();
  });
});

test.describe('POST /api/contact (real build)', () => {
  test('400 names the missing fields', async ({ request }) => {
    const res = await request.post('/api/contact', { data: {} });
    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('invalid');
    expect([...json.fields].sort()).toEqual(['email', 'message', 'name']);
  });

  test('a filled honeypot is accepted silently', async ({ request }) => {
    const res = await request.post('/api/contact', {
      data: {
        name: 'Bot',
        email: 'bot@example.com',
        message: 'Buy my cheap pills right now',
        website: 'http://spam.example',
      },
    });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  test('a body over 10 000 bytes is refused', async ({ request }) => {
    const res = await request.post('/api/contact', {
      data: { name: 'Ada Lovelace', email: 'ada@example.com', message: 'x'.repeat(10_500) },
    });
    expect(res.status()).toBe(413);
  });

  test('GET is not allowed', async ({ request }) => {
    const res = await request.get('/api/contact');
    expect(res.status()).toBe(405);
  });
});
