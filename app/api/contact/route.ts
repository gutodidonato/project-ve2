import { Resend } from 'resend';
import { contactSchema, createRateLimiter } from '@/lib/contact';

const MAX_BODY_BYTES = 10_000;
const DEFAULT_FROM = 'Rodovia 2026 <onboarding@resend.dev>';

// One limiter per server process: 5 messages per 10 minutes per client IP.
const allow = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });

function reply(body: Record<string, unknown>, status: number) {
  return Response.json(body, { status });
}

const MAX_KEY_LENGTH = 64;

/** Limiter key: the first forwarded address, capped so a spoofed header cannot bloat the map. */
function clientIp(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  return ip.slice(0, MAX_KEY_LENGTH);
}

export async function POST(req: Request): Promise<Response> {
  // Refuse oversized bodies before buffering them, then re-check the real size.
  const declared = Number(req.headers.get('content-length'));
  if (declared > MAX_BODY_BYTES) return reply({ error: 'too_large' }, 413);

  const text = await req.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
    return reply({ error: 'too_large' }, 413);
  }

  // JSON only: a cross-site <form> can send text/plain or urlencoded bodies without a CORS preflight.
  const contentType = req.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return reply({ error: 'unsupported' }, 415);
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return reply({ error: 'invalid', fields: [] }, 400);
  }

  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) {
    const fields = [
      ...new Set(parsed.error.issues.map((i) => i.path[0]).filter((p) => typeof p === 'string')),
    ];
    return reply({ error: 'invalid', fields }, 400);
  }
  const { name, email, message, website } = parsed.data;

  // Honeypot: pretend it worked so the bot learns nothing, send nothing.
  if (website) return reply({ ok: true }, 200);

  if (!allow(clientIp(req))) return reply({ error: 'rate_limited' }, 429);

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) return reply({ error: 'unavailable' }, 503);

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM,
      to,
      replyTo: email,
      subject: `Portfolio: ${name.replace(/\s+/g, ' ')}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });
    if (error) {
      console.error('[contact] resend error:', error.name);
      return reply({ error: 'send_failed' }, 502);
    }
  } catch (err) {
    console.error('[contact] resend threw:', err instanceof Error ? err.name : 'unknown');
    return reply({ error: 'send_failed' }, 502);
  }

  return reply({ ok: true }, 200);
}
