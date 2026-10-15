import { getTranslations } from 'next-intl/server';
import type { CaseSummary, Locale } from '@/content/types';
import { SectionHeading } from './SectionHeading';
import { sectionClass } from './ui';

export async function CaseGrid({ cases, locale }: { cases: CaseSummary[]; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'PitStop' });

  return (
    <section id="cases" aria-labelledby="cases-title" className={sectionClass}>
      <SectionHeading id="cases" eyebrow={t('cases.eyebrow')} title={t('cases.title')} />
      <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cases.map((c, i) => (
          <li
            key={c.slug}
            className="flex min-w-0 flex-col gap-3 rounded-[3px] border border-line bg-panel p-5"
          >
            <p aria-hidden="true" className="font-mono text-xs tracking-[0.12em] text-magenta">
              {String(i + 1).padStart(2, '0')}
            </p>
            <h3 className="text-lg leading-snug font-semibold text-ink">{c.title}</h3>
            <p className="text-[0.9375rem] leading-relaxed text-muted">{c.summary}</p>
            <ul aria-label={t('cases.stack')} className="mt-auto flex flex-wrap gap-1.5 pt-2">
              {c.stack.map((s) => (
                <li
                  key={s}
                  className="border border-line px-2 py-0.5 font-mono text-xs leading-relaxed text-ink/85"
                >
                  {s}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
