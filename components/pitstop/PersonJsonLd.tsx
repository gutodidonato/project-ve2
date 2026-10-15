import type { Locale, Profile } from '@/content/types';
import { SITE_URL } from '@/lib/site';

// Languages he works in; `Profile.languages` is display text, not language tags.
const KNOWS_LANGUAGE = ['pt-BR', 'en', 'es'];

/**
 * schema.org Person for search engines. Deliberately omits `telephone` and
 * `email`: contact details stay out of machine-readable data (the form is the
 * contact channel). Rendered on the server, so crawlers read it without JS.
 */
export function PersonJsonLd({ profile, locale }: { profile: Profile; locale: Locale }) {
  const current = profile.experience[0];
  const schools = [...new Set(profile.education.map((e) => e.institution))];

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.fullName,
    alternateName: profile.name,
    jobTitle: current.role,
    worksFor: { '@type': 'Organization', name: current.company },
    url: `${SITE_URL}/${locale}`,
    sameAs: [profile.links.github, profile.links.linkedin],
    knowsLanguage: KNOWS_LANGUAGE,
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.location.split(',')[0].trim(),
      addressCountry: 'BR',
    },
    alumniOf: schools.map((name) => ({ '@type': 'CollegeOrUniversity', name })),
  };

  // Every `<` is written as a JSON unicode escape (backslash, u, 0, 0, 3, c): same value once
  // parsed, but no string in the data can close the script element early.
  const json = JSON.stringify(data).replace(/</g, '\\u003c');

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
