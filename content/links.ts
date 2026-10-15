import type { Locale, Profile } from './types';

// Kept apart from the `@/content` barrel (which imports both profiles) so client
// components can use it without bundling the profile data a second time.

/** The CV PDF for `locale`, falling back to the PT PDF while a translation does not exist. */
export function cvLink(profile: Profile, locale: Locale): { href: string; locale: Locale } {
  const own = profile.links.cv[locale];
  return own ? { href: own, locale } : { href: profile.links.cv.pt, locale: 'pt' };
}
