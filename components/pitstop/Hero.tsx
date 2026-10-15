import { getTranslations } from 'next-intl/server';
import { cvLink } from '@/content';
import type { Locale, Profile } from '@/content/types';
import { buttonGhostClass, buttonPrimaryClass, SECTION_IDS } from './ui';

export async function Hero({ profile, locale }: { profile: Profile; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'PitStop' });
  const other: Locale = locale === 'pt' ? 'en' : 'pt';
  const cv = cvLink(profile, locale);

  return (
    <header className="flex flex-col gap-10 pt-6 md:pt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-b border-line pb-4">
        <p className="eyebrow">{t('eyebrow')}</p>
        <nav aria-label={t('nav.label')}>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.8125rem] tracking-[0.06em]">
            {SECTION_IDS.map((id) => (
              <li key={id}>
                <a href={`#${id}`} className="text-muted hover:text-ink">
                  {t(`nav.${id}`)}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`/${other}`}
                hrefLang={other === 'pt' ? 'pt-BR' : 'en'}
                lang={other === 'pt' ? 'pt-BR' : 'en'}
                className="text-cyan hover:text-ink"
              >
                {t('switchLocale')}
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="flex flex-col gap-5 md:pt-10">
        <h1 className="font-display text-[clamp(2.25rem,7.5vw,4.5rem)] leading-[1.08] tracking-[0.01em]">
          <span className="text-sunset">{profile.name}</span>
        </h1>
        <div className="flex flex-col gap-1.5">
          <p className="text-lg font-medium text-ink md:text-xl">{profile.title}</p>
          <p className="flex flex-wrap gap-x-2 font-mono text-[0.9375rem]">
            <span className="text-cyan">{profile.headline}</span>
            <span aria-hidden="true" className="text-muted">
              ·
            </span>
            <span className="text-muted">{profile.location}</span>
          </p>
        </div>
        <p className="max-w-[68ch] text-lg leading-relaxed text-pretty text-muted">
          {profile.summary}
        </p>
      </div>

      <div className="horizon" aria-hidden="true" />

      <div className="flex flex-wrap gap-3">
        <a
          href={cv.href}
          type="application/pdf"
          hrefLang={cv.locale === 'pt' ? 'pt-BR' : 'en'}
          className={buttonPrimaryClass}
        >
          {cv.locale === locale ? t('hero.cv') : t('hero.cvPtOnly')}
        </a>
        <a href="#contato" className={buttonGhostClass}>
          {t('hero.contact')}
        </a>
      </div>
    </header>
  );
}
