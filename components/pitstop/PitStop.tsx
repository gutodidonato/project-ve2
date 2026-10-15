import type { Locale, Profile } from '@/content/types';
import { CaseGrid } from './CaseGrid';
import { Contact } from './Contact';
import { ExperienceList } from './ExperienceList';
import { Footer } from './Footer';
import { Hero } from './Hero';
import { Impact } from './Impact';
import { ServiceList } from './ServiceList';
import { SkillGroups } from './SkillGroups';

/**
 * Server-rendered one-pager ("pit stop"): what Google, screen readers and
 * no-JS visitors read, and the whole site when the game is off. In game mode
 * `html[data-mode="game"] .pitstop` hides it visually but keeps it in the DOM
 * (GameMount also makes it inert there). `tabIndex={-1}` lets the game's
 * "text version" button move focus here.
 */
export function PitStop({ profile, locale }: { profile: Profile; locale: Locale }) {
  return (
    <main
      id="pitstop"
      tabIndex={-1}
      className="pitstop mx-auto flex w-full max-w-[1080px] flex-col gap-16 px-4 focus:outline-none md:gap-22 md:px-6"
    >
      <Hero profile={profile} locale={locale} />
      <Impact metrics={profile.metrics} locale={locale} />
      <ExperienceList experience={profile.experience} locale={locale} />
      <CaseGrid cases={profile.cases} locale={locale} />
      <SkillGroups skills={profile.skills} locale={locale} />
      <ServiceList services={profile.services} calcom={profile.links.calcom} locale={locale} />
      <Contact profile={profile} locale={locale} />
      <Footer profile={profile} locale={locale} />
    </main>
  );
}
