'use client';

import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { cvLink } from '@/content/links';
import type { Locale, Profile } from '@/content/types';
import { ContactForm } from '@/components/pitstop/ContactForm';
import { EmailLink } from '@/components/pitstop/EmailLink';
import { accentBorders, buttonGhostClass, displayUrl, linkClass } from '@/components/pitstop/ui';
import { isDrivingOnlyKey, isTypingTarget } from '@/lib/game/input';
import { inputQueue } from '@/lib/game/runtime';
import type { ZoneId } from '@/lib/game/types';
import { ZONES, zoneIndex } from '@/lib/game/zones';
import { useGameStore } from '@/lib/store';

export interface ZonePanelProps {
  profile: Profile;
  locale: Locale;
  /** Display name per zone, already localized. */
  names: Record<ZoneId, string>;
}

interface ZoneContentProps {
  profile: Profile;
  locale: Locale;
}

/**
 * What the car's current zone is about, from the profile. The camera keeps the
 * car at the center of the screen, so the panel never covers it: a full-width
 * bottom sheet under 700px, a bottom strip left of the minimap and pit stop
 * toggle up to 1024px (both at most 36% of the height: the camera shows the
 * car a little below center, its rear near 60%), and a 26rem column
 * bottom-left above that (at most 60%).
 *
 * It scrolls on its own and is focusable: `data-scroll-panel` keeps the wheel and
 * the scroll keys (up / down, Space, Page Up / Down, Home / End) scrolling it
 * instead of driving, while WASD and left / right keep driving; Escape drops the
 * focus, which hands the scroll keys back to the car. The heading is a polite
 * live region once the visitor is in control (off during the demo, which changes
 * zone every few seconds), so arriving somewhere is announced. Outside every
 * zone it is a short driving hint.
 *
 * Using the panel is input too (spec 3.3: any input takes control): a pointer,
 * focus, key or wheel inside it parks the car at this stop, so the demo cannot
 * drive away mid-read or mid-message, and the idle timer restarts each time.
 */
export function ZonePanel({ profile, locale, names }: ZonePanelProps) {
  const t = useTranslations('Game');
  const zone = useGameStore((s) => s.zone);
  const demo = useGameStore((s) => s.mode === 'demo');
  const headingId = useId();
  const panelRef = useRef<HTMLElement>(null);

  // A new zone starts at the top, not wherever the previous one was scrolled to.
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [zone]);

  // goto to the zone the car is already in: takes over from the demo and parks at its center.
  const stay = () => {
    if (zone !== null) inputQueue.goto(zone);
  };

  function onKeyDown(e: KeyboardEvent<HTMLElement>) {
    // WASD and left / right drive the car even with the panel focused: they must not pull it back to
    // this stop. Typed into a field (the contact form) they are still input, like any other letter.
    if (isTypingTarget(e.target) || !isDrivingOnlyKey(e.code)) stay();
    if (e.key === 'Escape' && !isTypingTarget(e.target) && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  return (
    <section
      ref={panelRef}
      data-zone-panel
      data-scroll-panel
      aria-labelledby={headingId}
      tabIndex={0}
      onPointerDown={stay}
      onFocus={stay}
      onKeyDown={onKeyDown}
      onWheel={stay}
      className="absolute inset-x-0 bottom-0 z-10 max-h-[36%] overflow-y-auto overscroll-contain border-t border-line bg-panel/90 backdrop-blur-sm focus-visible:outline-offset-[-2px] md:right-[13rem] md:bottom-4 md:left-4 md:border lg:right-auto lg:max-h-[60%] lg:w-[26rem]"
    >
      <header className="sticky top-0 z-10 flex flex-col gap-0.5 border-b border-line bg-panel/95 px-4 pt-3 pb-2.5 md:px-5">
        <p className="eyebrow flex items-center gap-2">
          {zone ? (
            <>
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ backgroundColor: ZONES[zoneIndex(zone)].color }}
              />
              {t('stop', { index: zoneIndex(zone) + 1, total: ZONES.length })}
            </>
          ) : (
            t('title')
          )}
        </p>
        <h2
          id={headingId}
          aria-live={demo ? 'off' : 'polite'}
          className="font-display text-lg leading-snug tracking-[0.02em] text-ink"
        >
          {zone ? names[zone] : t('roaming')}
        </h2>
      </header>
      <div key={zone ?? 'road'} className="px-4 pt-4 pb-5 motion-safe:animate-panel-in md:px-5">
        {zone ? <ZoneContent zone={zone} profile={profile} locale={locale} /> : <Hint profile={profile} />}
      </div>
    </section>
  );
}

function Hint({ profile }: { profile: Profile }) {
  const t = useTranslations('Game');
  return (
    <div className="flex flex-col gap-3">
      {/* Wide screens show the name in the HUD corner; here it is the first thing on a phone. */}
      <div className="flex flex-col gap-0.5 lg:hidden">
        <p className="font-display text-base leading-tight tracking-[0.02em]">
          <span className="text-sunset">{profile.name}</span>
        </p>
        <p className="font-mono text-xs text-cyan">{profile.headline}</p>
      </div>
      <p className="text-[0.9375rem] leading-relaxed text-ink">{t('hint')}</p>
      <p className="font-mono text-xs leading-relaxed text-muted pointer-coarse:hidden">{t('keys')}</p>
      <p className="hidden font-mono text-xs leading-relaxed text-muted pointer-coarse:block">{t('touch')}</p>
    </div>
  );
}

function ZoneContent({ zone, profile, locale }: ZoneContentProps & { zone: ZoneId }) {
  switch (zone) {
    case 'experiencia':
      return <Experience profile={profile} />;
    case 'cases':
      return <Cases profile={profile} />;
    case 'oficina':
      return <Skills profile={profile} />;
    case 'servicos':
      return <Services profile={profile} />;
    case 'contato':
      return <Contact profile={profile} locale={locale} />;
  }
}

function Experience({ profile }: { profile: Profile }) {
  const t = useTranslations('PitStop');
  const month = (ym: string) => {
    const [year, mm] = ym.split('-');
    return `${t(`months.${mm}`)} ${year}`;
  };
  return (
    <ol className="flex flex-col gap-6">
      {profile.experience.map((job) => (
        <li key={`${job.company}-${job.start}`} className="flex flex-col gap-1">
          <h3 className="font-display text-[0.9375rem] leading-snug tracking-[0.02em] text-ink">
            {job.company}
          </h3>
          <p className="flex flex-wrap gap-x-2 font-mono text-[0.8125rem] text-cyan">
            <span>{job.role}</span>
            <span aria-hidden="true" className="text-muted">
              ·
            </span>
            <span>
              <time dateTime={job.start}>{month(job.start)}</time>
              {' – '}
              {job.end ? <time dateTime={job.end}>{month(job.end)}</time> : t('experience.present')}
            </span>
          </p>
          <ul className="mt-1 flex list-disc flex-col gap-1 pl-4 text-sm leading-relaxed text-muted marker:text-muted/60">
            {job.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

function Cases({ profile }: { profile: Profile }) {
  const t = useTranslations('PitStop');
  return (
    <ol className="flex flex-col gap-5">
      {profile.cases.map((c, i) => (
        <li key={c.slug} className="flex flex-col gap-1.5 border-t border-line pt-3 first:border-t-0 first:pt-0">
          <h3 className="flex items-baseline gap-2.5 text-[0.9375rem] leading-snug font-semibold text-ink">
            <span aria-hidden="true" className="font-mono text-xs font-normal tracking-[0.12em] text-magenta">
              {String(i + 1).padStart(2, '0')}
            </span>
            {c.title}
          </h3>
          <p className="text-sm leading-relaxed text-muted">{c.summary}</p>
          <ul aria-label={t('cases.stack')} className="flex flex-wrap gap-1.5 pt-1">
            {c.stack.map((s) => (
              <li key={s} className="border border-line px-1.5 py-0.5 font-mono text-[0.6875rem] leading-snug text-ink/85">
                {s}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

function Skills({ profile }: { profile: Profile }) {
  return (
    <div className="flex flex-col gap-5">
      {profile.skills.map((group) => (
        <div key={group.name} className="flex flex-col gap-2">
          <h3 className="font-mono text-xs font-medium tracking-[0.12em] text-sun uppercase">{group.name}</h3>
          <ul className="flex flex-wrap gap-1.5">
            {group.items.map((item) => (
              <li key={item} className="bg-night/70 px-2 py-0.5 text-[0.8125rem] leading-snug text-ink">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Services({ profile }: { profile: Profile }) {
  const t = useTranslations('PitStop');
  const { calcom } = profile.links;
  return (
    <div className="flex flex-col gap-5">
      <ul className="flex flex-col gap-4">
        {profile.services.map((s, i) => (
          <li key={s.title} className={`flex flex-col gap-1 border-l-2 pl-3 ${accentBorders[i % accentBorders.length]}`}>
            <h3 className="text-[0.9375rem] leading-snug font-semibold text-ink">{s.title}</h3>
            <p className="text-sm leading-relaxed text-muted">{s.description}</p>
          </li>
        ))}
      </ul>
      <p>
        {calcom ? (
          <a href={calcom} className={buttonGhostClass}>
            {t('services.schedule')}
          </a>
        ) : (
          // No booking link yet: the call to action drives to the contact stop instead.
          <button type="button" onClick={() => inputQueue.goto('contato')} className={`${buttonGhostClass} cursor-pointer`}>
            {t('services.talk')}
          </button>
        )}
      </p>
    </div>
  );
}

function Contact({ profile, locale }: ZoneContentProps) {
  const t = useTranslations('PitStop');
  const { links } = profile;
  const cv = cvLink(profile, locale);

  const rows: { key: string; label: string; value: ReactNode }[] = [
    { key: 'email', label: t('contact.email'), value: <EmailLink email={links.email} className={linkClass} /> },
    {
      key: 'linkedin',
      label: t('contact.linkedin'),
      value: (
        <a href={links.linkedin} className={linkClass}>
          {displayUrl(links.linkedin)}
        </a>
      ),
    },
    {
      key: 'github',
      label: t('contact.github'),
      value: (
        <a href={links.github} className={linkClass}>
          {displayUrl(links.github)}
        </a>
      ),
    },
    {
      key: 'cv',
      label: t('contact.cv'),
      value: (
        <a href={cv.href} type="application/pdf" hrefLang={cv.locale === 'pt' ? 'pt-BR' : 'en'} className={linkClass}>
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

  return (
    <div className="flex flex-col gap-6">
      <dl className="flex flex-col text-sm">
        {rows.map((r) => (
          <div key={r.key} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 border-b border-line py-2.5 first:pt-0 last:border-b-0">
            <dt className="eyebrow pt-0.5">{r.label}</dt>
            <dd className="min-w-0 text-ink [overflow-wrap:anywhere]">{r.value}</dd>
          </div>
        ))}
      </dl>
      <ContactForm locale={locale} fallbackEmail={links.email} />
    </div>
  );
}
