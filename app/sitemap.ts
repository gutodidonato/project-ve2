import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { languageAlternates, SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = languageAlternates(SITE_URL);
  return routing.locales.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    alternates: { languages },
  }));
}
