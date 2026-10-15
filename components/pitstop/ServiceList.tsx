import { getTranslations } from 'next-intl/server';
import type { Locale, Service } from '@/content/types';
import { SectionHeading } from './SectionHeading';
import { accentBorders, buttonGhostClass, sectionClass } from './ui';

export async function ServiceList({
  services,
  calcom,
  locale,
}: {
  services: Service[];
  calcom: string | null;
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: 'PitStop' });

  return (
    <section id="servicos" aria-labelledby="servicos-title" className={sectionClass}>
      <SectionHeading id="servicos" eyebrow={t('services.eyebrow')} title={t('services.title')} />
      <ul className="grid gap-8 md:grid-cols-3 md:gap-6">
        {services.map((s, i) => (
          <li
            key={s.title}
            className={`flex min-w-0 flex-col gap-2 border-t-2 pt-4 ${accentBorders[i % accentBorders.length]}`}
          >
            <h3 className="text-lg leading-snug font-semibold text-ink">{s.title}</h3>
            <p className="text-muted">{s.description}</p>
          </li>
        ))}
      </ul>
      <p>
        {calcom ? (
          <a href={calcom} className={buttonGhostClass}>
            {t('services.schedule')}
          </a>
        ) : (
          <a href="#contato" className={buttonGhostClass}>
            {t('services.talk')}
          </a>
        )}
      </p>
    </section>
  );
}
