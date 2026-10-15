import { defineRouting } from 'next-intl/routing';
import { locales } from '@/content';

export const routing = defineRouting({
  locales,
  defaultLocale: 'pt',
  localePrefix: 'always',
});
