import { getTranslations } from 'next-intl/server';
import type { Locale, SkillGroup } from '@/content/types';
import { SectionHeading } from './SectionHeading';
import { sectionClass } from './ui';

export async function SkillGroups({ skills, locale }: { skills: SkillGroup[]; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'PitStop' });

  return (
    <section id="oficina" aria-labelledby="oficina-title" className={sectionClass}>
      <SectionHeading id="oficina" eyebrow={t('skills.eyebrow')} title={t('skills.title')} />
      <div className="grid gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
        {skills.map((group) => (
          <div key={group.name} className="flex min-w-0 flex-col gap-3 border-t border-line pt-4">
            <h3 className="font-mono text-[0.8125rem] font-medium tracking-[0.12em] text-sun uppercase">
              {group.name}
            </h3>
            <ul className="flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <li key={item} className="bg-panel px-2 py-1 text-sm leading-snug text-ink">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
