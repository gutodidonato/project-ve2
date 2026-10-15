import type { Locale, Profile } from './types';
import { profile as pt } from './pt/profile';
import { profile as en } from './en/profile';

const profiles: Record<Locale, Profile> = { pt, en };

export const locales: readonly Locale[] = ['pt', 'en'];

export function getProfile(locale: Locale): Profile {
  return profiles[locale];
}

export { cvLink } from './links';
