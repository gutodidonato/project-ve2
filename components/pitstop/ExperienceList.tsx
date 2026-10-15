import { getTranslations } from 'next-intl/server';
import type { Experience, Locale } from '@/content/types';
import { SectionHeading } from './SectionHeading';
import { sectionClass } from './ui';

/** Vertical timeline, newest first. Dates are 'YYYY-MM'; month names come from messages. */
export async function ExperienceList({
  experience,
  locale,
}: {
  experience: Experience[];
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: 'PitStop' });
  const month = (ym: string) => {
    const [year, mm] = ym.split('-');
    return `${t(`months.${mm}`)} ${year}`;
  };

  return (
    <section id="experiencia" aria-labelledby="experiencia-title" className={sectionClass}>
      <SectionHeading
        id="experiencia"
        eyebrow={t('experience.eyebrow')}
        title={t('experience.title')}
      />
      <ol className="ml-1 flex flex-col gap-10 border-l border-line">
        {experience.map((job) => {
          const current = job.end === null;
          return (
            <li key={`${job.company}-${job.start}`} className="relative pl-6 md:pl-8">
              <span
                aria-hidden="true"
                className={`absolute top-[0.45rem] -left-[5px] size-[9px] rounded-full border ${
                  current ? 'border-magenta bg-magenta' : 'border-muted bg-night'
                }`}
              />
              <h3 className="font-display text-lg leading-snug tracking-[0.02em] md:text-xl">
                {job.company}
              </h3>
              <p className="mt-1 flex flex-wrap gap-x-2 font-mono text-sm text-cyan">
                <span>{job.role}</span>
                <span aria-hidden="true" className="text-muted">
                  ·
                </span>
                <span>
                  <time dateTime={job.start}>{month(job.start)}</time>
                  {' – '}
                  {job.end ? (
                    <time dateTime={job.end}>{month(job.end)}</time>
                  ) : (
                    t('experience.present')
                  )}
                </span>
              </p>
              <ul className="mt-3 flex max-w-[68ch] list-disc flex-col gap-1.5 pl-5 text-muted marker:text-line">
                {job.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
