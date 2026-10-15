import { z } from 'zod';

export interface ContactInput {
  name: string;
  email: string;
  message: string;
  /** Honeypot: invisible to people, so anything in here means a bot filled the form. */
  website?: string;
}

/**
 * Shared by the route (authoritative) and mirrored by the form's `required` /
 * `maxLength` attributes. Text is trimmed before its length is measured.
 */
export const contactSchema: z.ZodType<ContactInput> = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().max(120).pipe(z.email()),
  message: z.string().trim().min(10).max(2000),
  website: z.string().optional(),
});

/**
 * Sliding-window limiter, in memory (one instance per server process).
 * Returns `true` when the call is allowed; denied calls are not recorded.
 */
export function createRateLimiter(opts: {
  limit: number;
  windowMs: number;
  now?: () => number;
}): (key: string) => boolean {
  const { limit, windowMs, now = Date.now } = opts;
  const hits = new Map<string, number[]>();
  let lastSweep = now();

  return (key) => {
    const t = now();
    const cutoff = t - windowMs;

    // Drop keys that went quiet so the map cannot grow without bound.
    if (t - lastSweep >= windowMs) {
      for (const [k, stamps] of hits) {
        if (stamps[stamps.length - 1] <= cutoff) hits.delete(k);
      }
      lastSweep = t;
    }

    const recent = (hits.get(key) ?? []).filter((stamp) => stamp > cutoff);
    const allowed = recent.length < limit;
    if (allowed) recent.push(t);
    hits.set(key, recent);
    return allowed;
  };
}
