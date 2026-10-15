'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/content/types';
import { EmailLink } from './EmailLink';
import { buttonPrimaryClass, linkClass } from './ui';

const FIELDS = ['name', 'email', 'message'] as const;
type Field = (typeof FIELDS)[number];

type Status =
  | { kind: 'idle' }
  | { kind: 'pending' }
  | { kind: 'success' }
  | { kind: 'invalid'; fields: Field[] }
  | { kind: 'rate_limited' }
  | { kind: 'unavailable' }
  | { kind: 'failed' };

const subscribeNoop = () => () => {};

const inputBase =
  'min-h-11 w-full min-w-0 rounded-none border bg-panel px-3 py-2 text-ink';
const inputOk = `${inputBase} border-muted/60 hover:border-muted`;
const inputBad = `${inputBase} border-bad`;

/**
 * Contact form. Self-contained so it can live in the pit stop one-pager and in the
 * game's contact panel: strings come from the `Contact` namespace of the nearest
 * NextIntlClientProvider, and `fallbackEmail` is shown when the server cannot send.
 * Limits mirror `contactSchema` (lib/contact.ts); the server stays authoritative.
 */
export function ContactForm({
  locale,
  fallbackEmail,
}: {
  locale: Locale;
  fallbackEmail: string;
}) {
  const t = useTranslations('Contact');
  const uid = useId();
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const successRef = useRef<HTMLParagraphElement>(null);
  // Server HTML ships a disabled button: a submit before hydration would be a native GET
  // that puts the visitor's message in the URL.
  const hydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const pending = status.kind === 'pending';
  const invalid = status.kind === 'invalid' ? status.fields : [];

  // Success replaces the form, so move focus to the confirmation instead of dropping it.
  useEffect(() => {
    if (status.kind === 'success') successRef.current?.focus();
  }, [status.kind]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const text = (key: string) => String(data.get(key) ?? '');

    setStatus({ kind: 'pending' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: text('name'),
          email: text('email'),
          message: text('message'),
          website: text('website'),
        }),
      });

      if (res.ok) return setStatus({ kind: 'success' });
      if (res.status === 429) return setStatus({ kind: 'rate_limited' });
      if (res.status === 502 || res.status === 503) return setStatus({ kind: 'unavailable' });

      if (res.status === 400) {
        const body: { fields?: unknown } | null = await res.json().catch(() => null);
        const reported = Array.isArray(body?.fields) ? body.fields : [];
        const fields = FIELDS.filter((f) => reported.includes(f));
        if (fields.length > 0) {
          setStatus({ kind: 'invalid', fields });
          (form.elements.namedItem(fields[0]) as HTMLElement | null)?.focus();
          return;
        }
      }
      setStatus({ kind: 'failed' });
    } catch {
      setStatus({ kind: 'failed' });
    }
  }

  /** Props shared by the three inputs: stable id, name, required, error wiring. */
  function field(name: Field) {
    const bad = invalid.includes(name);
    return {
      id: `${uid}-${name}`,
      name,
      required: true,
      'aria-invalid': bad || undefined,
      'aria-describedby': bad ? `${uid}-${name}-error` : undefined,
      className: bad ? inputBad : inputOk,
    };
  }

  function fieldError(name: Field) {
    if (!invalid.includes(name)) return null;
    return (
      <p id={`${uid}-${name}-error`} className="text-sm text-bad">
        {t(`errors.${name}`)}
      </p>
    );
  }

  const label = (name: Field) => (
    <label htmlFor={`${uid}-${name}`} className="eyebrow">
      {t(name)}
    </label>
  );

  return (
    <div
      lang={locale === 'pt' ? 'pt-BR' : 'en'}
      className="flex min-w-0 flex-col gap-5 border-t border-line pt-4"
    >
      <h3 className="eyebrow">{t('formTitle')}</h3>

      {status.kind === 'success' ? (
        <p ref={successRef} role="status" tabIndex={-1} className="text-ink outline-offset-4">
          {t('success')}
        </p>
      ) : (
        <form onSubmit={onSubmit} aria-busy={pending} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            {label('name')}
            <input {...field('name')} type="text" autoComplete="name" maxLength={80} />
            {fieldError('name')}
          </div>

          <div className="flex flex-col gap-2">
            {label('email')}
            <input {...field('email')} type="email" autoComplete="email" maxLength={120} />
            {fieldError('email')}
          </div>

          <div className="flex flex-col gap-2">
            {label('message')}
            <textarea
              {...field('message')}
              rows={6}
              maxLength={2000}
              className={`${field('message').className} resize-y`}
            />
            {fieldError('message')}
          </div>

          {/* Honeypot: off-screen, out of the tab order and the accessibility tree. */}
          <div aria-hidden="true" className="sr-only">
            <label htmlFor={`${uid}-website`}>Website</label>
            <input
              id={`${uid}-website`}
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="flex flex-col items-start gap-3">
            <button
              type="submit"
              disabled={pending || !hydrated}
              className={`${buttonPrimaryClass} disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-sun`}
            >
              {pending ? t('sending') : t('submit')}
            </button>

            {status.kind === 'rate_limited' && (
              <p role="alert" className="text-sm text-bad">
                {t('errors.rateLimited')}
              </p>
            )}
            {status.kind === 'unavailable' && (
              <p role="alert" className="text-sm text-bad [overflow-wrap:anywhere]">
                {t.rich('errors.unavailable', {
                  email: () => <EmailLink email={fallbackEmail} className={linkClass} />,
                })}
              </p>
            )}
            {status.kind === 'failed' && (
              <p role="alert" className="text-sm text-bad">
                {t('errors.failed')}
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
