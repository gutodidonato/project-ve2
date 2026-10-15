import { getTranslations } from 'next-intl/server';
import { MODEL_CREDIT } from '@/content/credits';
import type { Locale, Profile } from '@/content/types';
import { linkClass } from './ui';

export async function Footer({ profile, locale }: { profile: Profile; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'PitStop' });
  const year = new Date().getFullYear();

  return (
    <footer className="flex flex-col gap-10 border-t border-line pt-10 pb-16 text-[0.9375rem]">
      <div className="grid gap-10 md:grid-cols-2">
        <section aria-labelledby="formacao-title" className="flex flex-col gap-3">
          <h2 id="formacao-title" className="eyebrow">
            {t('footer.education')}
          </h2>
          <ul className="flex flex-col gap-3">
            {profile.education.map((e) => (
              <li key={e.course} className="flex flex-col">
                <span className="text-ink">
                  <span className="font-mono text-sun">{e.institution}</span> · {e.course}
                </span>
                <span className="text-sm text-muted">{e.period}</span>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="creditos-title" className="flex flex-col gap-3">
          <h2 id="creditos-title" className="eyebrow">
            {t('footer.credits')}
          </h2>
          {/* Text content must equal MODEL_CREDIT.text exactly; only the prefix is translated. */}
          <p className="max-w-[68ch] text-sm text-muted [overflow-wrap:anywhere]">
            {t('footer.modelCredit')}{' '}
            {`"${MODEL_CREDIT.title}" by ${MODEL_CREDIT.author} (`}
            <a href={MODEL_CREDIT.url} className={linkClass}>
              {MODEL_CREDIT.url}
            </a>
            {'), '}
            <a href={MODEL_CREDIT.licenseUrl} rel="license" className={linkClass}>
              {MODEL_CREDIT.license}
            </a>
            {', modified (optimized).'}
          </p>
        </section>
      </div>
      <p className="font-mono text-[0.8125rem] text-muted">
        {t('footer.copyright', { year: String(year), name: profile.name })}
      </p>
    </footer>
  );
}
