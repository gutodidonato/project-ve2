import { getTranslations } from 'next-intl/server';
import type { Locale, Metric } from '@/content/types';

/** Metrics as a mono strip: hairline grid (gap-px over the line color). */
export async function Impact({ metrics, locale }: { metrics: Metric[]; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'PitStop' });

  return (
    <section aria-labelledby="impacto-title" className="flex flex-col gap-4">
      <h2 id="impacto-title" className="eyebrow">
        {t('impact.title')}
      </h2>
      <ul className="grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <li key={m.label} className="flex flex-col gap-2 bg-night px-5 py-5">
            <p className="font-mono text-2xl leading-tight font-medium text-ink tabular-nums">
              {m.value}
            </p>
            <p className="text-[0.9375rem] leading-snug text-muted">{m.label}</p>
            <p className="mt-auto pt-1 font-mono text-xs tracking-[0.12em] text-cyan uppercase">
              {m.context}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
