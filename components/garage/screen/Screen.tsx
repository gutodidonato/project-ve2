'use client';

import type { Locale, Profile } from '@/content/types';
import type { GarageAction, GarageState } from '@/lib/garage/state';
import { ScreenContact } from './ScreenContact';
import { ScreenCv } from './ScreenCv';
import { ScreenLaunch } from './ScreenLaunch';
import { ScreenMenu } from './ScreenMenu';

export interface ScreenProps {
  profile: Profile;
  locale: Locale;
  state: GarageState;
  last: GarageAction | null;
  onAction(a: GarageAction): void;
}

/** What the monitor shows for a garage state. Plain DOM: the 3D scene only frames it. */
export function Screen({ profile, locale, state, last, onAction }: ScreenProps) {
  if (state.view === 'launch') return <ScreenLaunch locale={locale} />;
  if (state.view === 'screen' && state.content === 'cv') {
    return <ScreenCv profile={profile} locale={locale} onAction={onAction} />;
  }
  if (state.view === 'screen' && state.content === 'contact') {
    return <ScreenContact profile={profile} locale={locale} onAction={onAction} />;
  }
  return <ScreenMenu profile={profile} last={last} onAction={onAction} />;
}
