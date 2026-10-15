// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { NextIntlClientProvider } from 'next-intl';
import { ContactForm } from '@/components/pitstop/ContactForm';
import en from '@/messages/en.json';
import pt from '@/messages/pt.json';

const EMAIL = 'owner@example.com';

function renderForm(locale: 'pt' | 'en' = 'en') {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === 'en' ? en : pt}>
      <ContactForm locale={locale} fallbackEmail={EMAIL} />
    </NextIntlClientProvider>,
  );
}

function fill() {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada Lovelace' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
  fireEvent.change(screen.getByLabelText('Message'), {
    target: { value: 'Hello, I would like to talk about a project.' },
  });
}

function respond(status: number, body: unknown = {}) {
  return Promise.resolve(new Response(JSON.stringify(body), { status }));
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('ContactForm', () => {
  it('server-renders a disabled submit, so nothing can submit natively before hydration', () => {
    const html = renderToString(
      <NextIntlClientProvider locale="en" messages={en}>
        <ContactForm locale="en" fallbackEmail={EMAIL} />
      </NextIntlClientProvider>,
    );
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*disabled=""/);
    expect(html).not.toContain('mailto:');
    expect(html).not.toContain(EMAIL);
  });

  it('renders labelled, required inputs with the schema limits', () => {
    renderForm();
    const name = screen.getByLabelText('Name') as HTMLInputElement;
    const email = screen.getByLabelText('Email') as HTMLInputElement;
    const message = screen.getByLabelText('Message') as HTMLTextAreaElement;
    for (const el of [name, email, message]) {
      expect(el.required).toBe(true);
      expect(el.id).not.toBe('');
    }
    expect(name.maxLength).toBe(80);
    expect(email.maxLength).toBe(120);
    expect(email.type).toBe('email');
    expect(message.maxLength).toBe(2000);
  });

  it('has a honeypot that is hidden from people, tabbing and assistive tech', () => {
    const { container } = renderForm();
    const honeypot = container.querySelector('input[name="website"]') as HTMLInputElement;
    expect(honeypot.tabIndex).toBe(-1);
    expect(honeypot.autocomplete).toBe('off');
    expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('localises the strings and the lang attribute', () => {
    const { container } = renderForm('pt');
    expect(screen.getByLabelText('Nome')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Enviar mensagem' })).toBeTruthy();
    expect(container.firstElementChild?.getAttribute('lang')).toBe('pt-BR');
  });

  it('posts the JSON, disables submit while pending, then replaces the form with the success message', async () => {
    let finish!: (r: Response) => void;
    fetchMock.mockReturnValue(new Promise<Response>((resolve) => (finish = resolve)));
    renderForm();
    fill();

    fireEvent.submit(screen.getByRole('button', { name: 'Send message' }).closest('form')!);

    const button = await screen.findByRole('button', { name: 'Sending…' });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/contact');
    expect(init.method).toBe('POST');
    expect(init.headers['content-type']).toBe('application/json');
    expect(JSON.parse(init.body)).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'Hello, I would like to talk about a project.',
      website: '',
    });

    finish(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const status = await screen.findByRole('status');
    expect(status.textContent).toBe('Message sent. Thank you, I will reply soon.');
    expect(screen.queryByLabelText('Name')).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(status));
  });

  it('shows per-field errors from a 400 and focuses the first invalid field', async () => {
    fetchMock.mockReturnValue(respond(400, { error: 'invalid', fields: ['message', 'email'] }));
    renderForm();
    fill();
    fireEvent.submit(screen.getByRole('button', { name: 'Send message' }).closest('form')!);

    const email = screen.getByLabelText('Email');
    await waitFor(() => expect(email.getAttribute('aria-invalid')).toBe('true'));
    expect(screen.getByLabelText('Message').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByLabelText('Name').getAttribute('aria-invalid')).toBeNull();

    const describedBy = email.getAttribute('aria-describedby')!;
    expect(document.getElementById(describedBy)?.textContent).toBe(
      'Enter a valid email address.',
    );
    expect(document.activeElement).toBe(email);
    // The typed values survive so the visitor only fixes what is wrong.
    expect((email as HTMLInputElement).value).toBe('ada@example.com');
    // Submitting again is possible.
    expect(
      (screen.getByRole('button', { name: 'Send message' }) as HTMLButtonElement).disabled,
    ).toBe(false);
  });

  it('asks the visitor to wait on a 429', async () => {
    fetchMock.mockReturnValue(respond(429, { error: 'rate_limited' }));
    renderForm();
    fill();
    fireEvent.submit(screen.getByRole('button', { name: 'Send message' }).closest('form')!);
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Too many messages');
    expect(screen.getByLabelText('Name')).toBeTruthy();
  });

  for (const status of [503, 502]) {
    it(`shows the fallback email as a mailto link on a ${status}`, async () => {
      fetchMock.mockReturnValue(respond(status, { error: 'unavailable' }));
      renderForm();
      fill();
      fireEvent.submit(screen.getByRole('button', { name: 'Send message' }).closest('form')!);
      const alert = await screen.findByRole('alert');
      const link = alert.querySelector('a') as HTMLAnchorElement;
      expect(link.getAttribute('href')).toBe(`mailto:${EMAIL}`);
      expect(link.textContent).toBe(EMAIL);
    });
  }

  it('shows a generic error when the request fails', async () => {
    fetchMock.mockRejectedValue(new TypeError('network'));
    renderForm();
    fill();
    fireEvent.submit(screen.getByRole('button', { name: 'Send message' }).closest('form')!);
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Something went wrong');
    expect(
      (screen.getByRole('button', { name: 'Send message' }) as HTMLButtonElement).disabled,
    ).toBe(false);
  });
});
