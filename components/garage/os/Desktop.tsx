'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import type { CaseSlug, Locale, Profile } from '@/content/types';
import { ICONS, type DesktopAction, type DesktopState, type ProgramId } from '@/lib/garage/desktop';
import { CaseApp } from './apps/CaseApp';
import { ContactApp } from './apps/ContactApp';
import { ControlPanelApp } from './apps/ControlPanelApp';
import { CvApp } from './apps/CvApp';
import { LaunchDialog } from './apps/LaunchDialog';
import { ProjectsApp } from './apps/ProjectsApp';
import { ReadmeApp } from './apps/ReadmeApp';
import { BugLogApp, TrashApp } from './apps/TrashApp';
import { Icon } from './Icon';
import { MenuBar } from './MenuBar';
import { Window } from './Window';

export interface DesktopProps {
  profile: Profile;
  locale: Locale;
  state: DesktopState;
  /** The glass in CSS px: the desktop is laid out at this size. */
  size: { width: number; height: number };
  /** Phone held upright: one tap opens, windows are maximized, icons sit in a grid. */
  compact: boolean;
  dispatch(a: DesktopAction): void;
  onLanguage(): void;
  sound: { muted: boolean; toggle(): void };
}

/** The desktop draws its warm-up once per page, not every time it remounts (a language switch). */
let booted = false;

/** LuisOS 88: the menu bar, the seven icons and the open windows, back to front. */
export function Desktop({ profile, locale, state, size, compact, dispatch, onLanguage, sound }: DesktopProps) {
  const t = useTranslations('Os');
  const [boot] = useState(() => !booted);
  useEffect(() => {
    booted = true;
  }, []);

  const open = (id: ProgramId) => dispatch({ type: 'open', id });
  const close = (id: ProgramId) => dispatch({ type: 'close', id });

  const titleOf = (id: ProgramId): string => {
    if (id === 'bug') return t('bugFile');
    if (id.startsWith('case:')) return `${id.slice(5)}.txt`;
    return t(`icons.${id as (typeof ICONS)[number]}`);
  };

  const contentOf = (id: ProgramId): ReactNode => {
    switch (id) {
      case 'cv':
        return <CvApp profile={profile} locale={locale} onClose={() => close(id)} />;
      case 'contact':
        return <ContactApp profile={profile} locale={locale} onClose={() => close(id)} />;
      case 'projects':
        return <ProjectsApp profile={profile} compact={compact} onOpen={(slug: CaseSlug) => open(`case:${slug}`)} />;
      case 'control':
        return <ControlPanelApp sound={sound} onLanguage={onLanguage} />;
      case 'readme':
        return <ReadmeApp profile={profile} />;
      case 'trash':
        return <TrashApp compact={compact} onOpen={() => open('bug')} />;
      case 'bug':
        return <BugLogApp />;
      case 'salto88':
        return <LaunchDialog locale={locale} />;
      default: {
        const item = profile.cases.find((c) => `case:${c.slug}` === id);
        return item ? <CaseApp item={item} /> : null;
      }
    }
  };

  return (
    <div
      role="region"
      aria-label={t('desktop')}
      className={`os-desktop${compact ? ' os-desktop--compact' : ''}${boot ? ' os-boot' : ''}`}
      style={{ width: size.width, height: size.height }}
    >
      <MenuBar onHelp={() => open('readme')} />
      <ul className="os-icons">
        {ICONS.map((id) => (
          <li key={id}>
            <Icon
              id={id}
              label={t(`icons.${id}`)}
              selected={state.selected === id}
              compact={compact}
              onSelect={() => dispatch({ type: 'select', icon: id })}
              onOpen={() => open(id)}
            />
          </li>
        ))}
      </ul>
      {state.windows.map((w, i) => (
        <Window
          key={w.id}
          program={w.id}
          title={titleOf(w.id)}
          x={w.x}
          y={w.y}
          z={i + 1}
          focused={state.focus === w.id}
          compact={compact}
          small={w.id === 'salto88'}
          size={size}
          closeLabel={t('close')}
          onClose={() => close(w.id)}
          onFocus={() => {
            if (state.focus !== w.id) dispatch({ type: 'focus', id: w.id });
          }}
          onMove={(x, y) => dispatch({ type: 'move', id: w.id, x, y, bounds: size })}
        >
          {contentOf(w.id)}
        </Window>
      ))}
    </div>
  );
}
