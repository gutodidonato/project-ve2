import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { cvLink } from '@/content';
import type { Locale, Profile } from '@/content/types';
import { ContactForm } from './ContactForm';
import { EmailLink } from './EmailLink';
import { SectionHeading } from './SectionHeading';
import { displayUrl, linkClass, sectionClass } from './ui';

/** Contact channels next to the contact form (two columns on wide screens). */
export async function Contact({ profile, locale }: { profile: Profile; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'PitStop' });
  const { links } = profile;
  const cv = cvLink(profile, locale);

  const rows: { key: string; label: string; value: ReactNode }[] = [
    {
      key: 'email',
      label: t('contact.email'),
      value: <EmailLink email={links.email} className={linkClass} />,
    },
    {
      key: 'linkedin',
      label: t('contact.linkedin'),
      value: (
        <a href={links.linkedin} rel="me" className={linkClass}>
          {displayUrl(links.linkedin)}
        </a>
      ),
    },
    {
      key: 'github',
      label: t('contact.github'),
      value: (
        <a href={links.github} rel="me" className={linkClass}>
          {displayUrl(links.github)}
        </a>
      ),
    },
    {
      key: 'cv',
      label: t('contact.cv'),
      value: (
        <a
          href={cv.href}
          type="application/pdf"
          hrefLang={cv.locale === 'pt' ? 'pt-BR' : 'en'}
          className={linkClass}
        >
          {cv.locale === locale ? t('contact.cvLink') : t('contact.cvLinkPtOnly')}
        </a>
      ),
    },
  ];
  if (links.calcom) {
    rows.push({
      key: 'calcom',
      label: t('contact.calcom'),
      value: (
        <a href={links.calcom} className={linkClass}>
          {t('contact.calcomLink')}
        </a>
      ),
    });
  }
  rows.push({
    key: 'languages',
    label: t('contact.languages'),
    value: (
      <ul className="flex flex-col gap-0.5">
        {profile.languages.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    ),
  });

  return (
    <section id="contato" aria-labelledby="contato-title" className={sectionClass}>
      <SectionHeading id="contato" eyebrow={t('contact.eyebrow')} title={t('contact.title')} />
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
        <dl className="flex max-w-2xl flex-col border-t border-line">
          {rows.map((r) => (
            <div
              key={r.key}
              className="grid gap-1 border-b border-line py-4 last:border-b-0 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-6"
            >
              <dt className="eyebrow md:pt-1">{r.label}</dt>
              <dd className="min-w-0 text-ink [overflow-wrap:anywhere]">{r.value}</dd>
            </div>
          ))}
        </dl>
        <ContactForm locale={locale} fallbackEmail={links.email} />
      </div>
    </section>
  );
}
