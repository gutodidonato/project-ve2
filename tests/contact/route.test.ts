import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const send = vi.hoisted(() => vi.fn());
const ResendCtor = vi.hoisted(() => vi.fn());

vi.mock('resend', () => ({
  Resend: ResendCtor.mockImplementation(function () {
    return { emails: { send } };
  }),
}));

const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'Hello, I would like to talk about a project.',
};

function post(body: unknown, headers: Record<string, string> = {}) {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: text,
  });
}

/** Fresh module instance per test so the module-level rate limiter starts empty. */
async function loadRoute() {
  vi.resetModules();
  return (await import('@/app/api/contact/route')).POST;
}

function setEnv() {
  vi.stubEnv('RESEND_API_KEY', 're_test_key');
  vi.stubEnv('CONTACT_TO_EMAIL', 'owner@example.com');
}

beforeEach(() => {
  send.mockReset();
  send.mockResolvedValue({ data: { id: 'email_1' }, error: null });
  ResendCtor.mockClear();
  vi.stubEnv('RESEND_API_KEY', '');
  vi.stubEnv('CONTACT_TO_EMAIL', '');
  vi.stubEnv('CONTACT_FROM_EMAIL', '');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('POST /api/contact', () => {
  it('413 for a body over 10 000 bytes', async () => {
    setEnv();
    const POST = await loadRoute();
    const res = await POST(post('x'.repeat(10_001)));
    expect(res.status).toBe(413);
    expect(send).not.toHaveBeenCalled();
  });

  it('measures bytes, not characters', async () => {
    setEnv();
    const POST = await loadRoute();
    // 5 001 two-byte characters = 10 002 bytes but only 5 001 characters.
    const res = await POST(post('é'.repeat(5_001)));
    expect(res.status).toBe(413);
  });

  it('413 when the declared content-length is already over the limit', async () => {
    setEnv();
    const POST = await loadRoute();
    const res = await POST(post(valid, { 'content-length': '10001' }));
    expect(res.status).toBe(413);
    expect(send).not.toHaveBeenCalled();
  });

  it('415 when the content-type is not JSON', async () => {
    setEnv();
    const POST = await loadRoute();
    const res = await POST(post(valid, { 'content-type': 'text/plain' }));
    expect(res.status).toBe(415);
    expect(await res.json()).toEqual({ error: 'unsupported' });
    expect(send).not.toHaveBeenCalled();
  });

  it('415 for a form-encoded body (the cross-site form POST case)', async () => {
    setEnv();
    const POST = await loadRoute();
    const res = await POST(
      post('name=Ada&email=ada%40example.com', {
        'content-type': 'application/x-www-form-urlencoded',
      }),
    );
    expect(res.status).toBe(415);
    expect(send).not.toHaveBeenCalled();
  });

  it('415 when the content-type header is missing', async () => {
    setEnv();
    const POST = await loadRoute();
    const req = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: new Blob([JSON.stringify(valid)]),
    });
    req.headers.delete('content-type');
    const res = await POST(req);
    expect(res.status).toBe(415);
    expect(send).not.toHaveBeenCalled();
  });

  it('accepts application/json with a charset parameter', async () => {
    setEnv();
    const POST = await loadRoute();
    const res = await POST(post(valid, { 'content-type': 'application/json; charset=utf-8' }));
    expect(res.status).toBe(200);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('checks the size before the content-type (413 wins over 415)', async () => {
    setEnv();
    const POST = await loadRoute();
    const res = await POST(post('x'.repeat(10_001), { 'content-type': 'text/plain' }));
    expect(res.status).toBe(413);
  });

  it('400 for invalid JSON', async () => {
    setEnv();
    const POST = await loadRoute();
    const res = await POST(post('{not json'));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid', fields: [] });
  });

  it('400 for a JSON body that is not an object', async () => {
    setEnv();
    const POST = await loadRoute();
    const res = await POST(post('null'));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('invalid');
  });

  it('400 with the failing field names for {}', async () => {
    setEnv();
    const POST = await loadRoute();
    const res = await POST(post({}));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('invalid');
    expect([...json.fields].sort()).toEqual(['email', 'message', 'name']);
    expect(send).not.toHaveBeenCalled();
  });

  it('400 names only the field that failed', async () => {
    setEnv();
    const POST = await loadRoute();
    const res = await POST(post({ ...valid, email: 'nope' }));
    expect(res.status).toBe(400);
    expect((await res.json()).fields).toEqual(['email']);
  });

  it('200 and no send when the honeypot is filled', async () => {
    setEnv();
    const POST = await loadRoute();
    const res = await POST(post({ ...valid, website: 'x' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(send).not.toHaveBeenCalled();
  });

  it('503 when the env is not configured', async () => {
    const POST = await loadRoute();
    const res = await POST(post(valid));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'unavailable' });
    expect(send).not.toHaveBeenCalled();
  });

  it('503 when only one of the two env vars is set', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test_key');
    const POST = await loadRoute();
    const res = await POST(post(valid));
    expect(res.status).toBe(503);
  });

  it('200 and exactly one send, replying to the sender', async () => {
    setEnv();
    const POST = await loadRoute();
    const res = await POST(post(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(ResendCtor).toHaveBeenCalledWith('re_test_key');
    expect(send).toHaveBeenCalledTimes(1);
    const payload = send.mock.calls[0][0];
    expect(payload.replyTo).toBe('ada@example.com');
    expect(payload.to).toBe('owner@example.com');
    expect(payload.subject).toBe('Portfolio: Ada Lovelace');
    expect(payload.from).toBe('Rodovia 2026 <onboarding@resend.dev>');
    expect(payload.text).toContain(valid.message);
    expect(payload.text).toContain('ada@example.com');
  });

  it('uses CONTACT_FROM_EMAIL when set', async () => {
    setEnv();
    vi.stubEnv('CONTACT_FROM_EMAIL', 'Site <site@example.com>');
    const POST = await loadRoute();
    await POST(post(valid));
    expect(send.mock.calls[0][0].from).toBe('Site <site@example.com>');
  });

  it('keeps line breaks out of the subject', async () => {
    setEnv();
    const POST = await loadRoute();
    await POST(post({ ...valid, name: 'Ada\r\nBcc: evil@example.com' }));
    expect(send.mock.calls[0][0].subject).not.toMatch(/[\r\n]/);
  });

  it('502 when Resend returns an error', async () => {
    setEnv();
    send.mockResolvedValue({ data: null, error: { name: 'validation_error', message: 'bad' } });
    const POST = await loadRoute();
    const res = await POST(post(valid));
    expect(res.status).toBe(502);
    expect((await res.json()).error).toBe('send_failed');
  });

  it('502 when the Resend call throws', async () => {
    setEnv();
    send.mockRejectedValue(new Error('network down'));
    const POST = await loadRoute();
    const res = await POST(post(valid));
    expect(res.status).toBe(502);
  });

  it('429 after 5 requests from the same IP, other IPs unaffected', async () => {
    setEnv();
    const POST = await loadRoute();
    const ip = { 'x-forwarded-for': '203.0.113.7, 10.0.0.1' };
    for (let i = 0; i < 5; i++) expect((await POST(post(valid, ip))).status).toBe(200);
    const blocked = await POST(post(valid, ip));
    expect(blocked.status).toBe(429);
    expect(await blocked.json()).toEqual({ error: 'rate_limited' });
    expect(send).toHaveBeenCalledTimes(5);

    const other = await POST(post(valid, { 'x-forwarded-for': '203.0.113.8' }));
    expect(other.status).toBe(200);
  });

  it('keys the limiter on the first x-forwarded-for entry only', async () => {
    setEnv();
    const POST = await loadRoute();
    for (let i = 0; i < 5; i++) {
      await POST(post(valid, { 'x-forwarded-for': `203.0.113.7, 10.0.0.${i}` }));
    }
    const res = await POST(post(valid, { 'x-forwarded-for': '203.0.113.7, 10.0.0.99' }));
    expect(res.status).toBe(429);
  });

  it('truncates the limiter key to 64 characters', async () => {
    setEnv();
    const POST = await loadRoute();
    const prefix = 'a'.repeat(64);
    // Distinct spoofed values that share the first 64 characters count as one client.
    for (let i = 0; i < 5; i++) {
      const res = await POST(post(valid, { 'x-forwarded-for': `${prefix}-${i}` }));
      expect(res.status).toBe(200);
    }
    const res = await POST(post(valid, { 'x-forwarded-for': `${prefix}-another` }));
    expect(res.status).toBe(429);
  });

  it('never logs the message body', async () => {
    setEnv();
    send.mockResolvedValue({ data: null, error: { name: 'rate_limit_exceeded', message: 'x' } });
    const spies = (['log', 'info', 'warn', 'error'] as const).map((m) =>
      vi.spyOn(console, m).mockImplementation(() => {}),
    );
    const POST = await loadRoute();
    await POST(post({ ...valid, message: 'SECRET-BODY-TEXT-123' }));
    for (const spy of spies) {
      expect(JSON.stringify(spy.mock.calls)).not.toContain('SECRET-BODY-TEXT-123');
      expect(JSON.stringify(spy.mock.calls)).not.toContain('ada@example.com');
    }
  });
});
