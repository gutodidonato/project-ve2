import { routing } from '@/i18n/routing';
import type { Locale } from '@/content/types';

const DEFAULT_SITE_URL = 'https://project-ve2-dtbe.vercel.app';

/**
 * The public origin, with no trailing slash (`${SITE_URL}/pt`). Read from
 * NEXT_PUBLIC_SITE_URL; an unset, empty or whitespace-only value (the blank line
 * in .env.example) means "not configured" and falls back to the default
 * deployment, instead of reaching `new URL('')` and breaking the build.
 */
export const SITE_URL: string =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '') || DEFAULT_SITE_URL;

/** `<html lang>`-style tag used in hreflang alternates. */
export const HREFLANG: Record<Locale, string> = { pt: 'pt-BR', en: 'en' };

/** Open Graph locale (underscore form). */
export const OG_LOCALE: Record<Locale, string> = { pt: 'pt_BR', en: 'en_US' };

/**
 * hreflang -> URL map shared by the page metadata (relative, resolved against
 * `metadataBase`) and the sitemap (absolute: pass `SITE_URL`).
 */
export function languageAlternates(origin = ''): Record<string, string> {
  return {
    ...Object.fromEntries(
      routing.locales.map((locale) => [HREFLANG[locale], `${origin}/${locale}`]),
    ),
    'x-default': `${origin}/${routing.defaultLocale}`,
  };
}
