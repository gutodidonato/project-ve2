'use client';

import { useTranslations } from 'next-intl';
import { cvLink } from '@/content/links';
import type { Locale, Profile } from '@/content/types';

/**
 * Currículo.txt: the profile as written in the CV (the curation of the game
 * does not apply here), in the order summary, experience, cases, skills,
 * education, languages. The PDF and Close stay on top while it scrolls.
 */
export function CvApp({
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
  const tp = useTranslations('PitStop');
  const cv = cvLink(profile, locale);
  const month = (ym: string) => {
    const [year, mm] = ym.split('-');
    return `${tp(`months.${mm}`)} ${year}`;
  };

  return (
    <div className="crt-page">
      <div className="crt-bar">
        <a
          href={cv.href}
          type="application/pdf"
          hrefLang={cv.locale === 'pt' ? 'pt-BR' : 'en'}
          className="crt-action"
        >
          {cv.locale === locale ? t('pdf') : t('pdfPtOnly')}
        </a>
        <button type="button" className="crt-action" onClick={onClose}>
          {to('close')}
        </button>
      </div>

      <h2 className="crt-title" tabIndex={-1}>
        {profile.fullName}
      </h2>
      <p className="crt-dim">{profile.title}</p>

      <section>
        <h3>{t('summary')}</h3>
        <p>{profile.summary}</p>
      </section>

      <section>
        <h3>{t('experience')}</h3>
        <ol className="crt-list">
          {profile.experience.map((job) => (
            <li key={`${job.company}-${job.start}`}>
              <p className="crt-strong">{job.role}</p>
              <p className="crt-dim">
                {job.company}, {month(job.start)} – {job.end === null ? t('current') : month(job.end)}
              </p>
              <ul className="crt-bullets">
                {job.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3>{t('cases')}</h3>
        <ul className="crt-list">
          {profile.cases.map((c) => (
            <li key={c.slug}>
              <p className="crt-strong">{c.title}</p>
              <p>{c.summary}</p>
              <p className="crt-dim">{c.stack.join(', ')}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>{t('skills')}</h3>
        <ul className="crt-list">
          {profile.skills.map((g) => (
            <li key={g.name}>
              <span className="crt-strong">{g.name}:</span> {g.items.join(', ')}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>{t('education')}</h3>
        <ul className="crt-list">
          {profile.education.map((e) => (
            <li key={`${e.institution}-${e.course}`}>
              <p className="crt-strong">{e.course}</p>
              <p className="crt-dim">
                {e.institution}, {e.period}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>{t('languages')}</h3>
        <ul className="crt-list">
          {profile.languages.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
