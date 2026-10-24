'use client';

import { useTranslations } from 'next-intl';
import type { Locale, Profile } from '@/content/types';
import { ContactForm } from '@/components/pitstop/ContactForm';
import { EmailLink } from '@/components/pitstop/EmailLink';
import { displayUrl } from '@/components/pitstop/ui';

/** The Contact program: channels (no phone, ever), one consulting line and the pit stop's form. */
export function ContactApp({
  profile,
  locale,
  onClose,
}: {
  profile: Profile;
  locale: Locale;
  onClose(): void;
}) {
  const t = useTranslations('Garage');
  const to = useTranslations('Os');
  const { links } = profile;

  return (
    <div className="crt-page">
      <div className="crt-bar">
        <button type="button" className="crt-action" onClick={onClose}>
          {to('close')}
        </button>
      </div>

      <h2 className="crt-title" tabIndex={-1}>
        {t('menuContact')}
      </h2>

      <dl className="crt-rows">
        <div>
          <dt className="crt-dim">{t('email')}</dt>
          <dd>
            <EmailLink email={links.email} />
          </dd>
        </div>
        <div>
          <dt className="crt-dim">LinkedIn</dt>
          <dd>
            <a href={links.linkedin} rel="me">
              {displayUrl(links.linkedin)}
            </a>
          </dd>
        </div>
        <div>
          <dt className="crt-dim">GitHub</dt>
          <dd>
            <a href={links.github} rel="me">
              {displayUrl(links.github)}
            </a>
          </dd>
        </div>
        {links.calcom ? (
          <div>
            <dt className="crt-dim">Cal.com</dt>
            <dd>
              <a href={links.calcom}>{t('book')}</a>
            </dd>
          </div>
        ) : null}
      </dl>

      <p>
        {t('consulting')}: {profile.services.map((s) => s.title).join(', ')}
      </p>

      <ContactForm locale={locale} fallbackEmail={links.email} />
    </div>
  );
}
