'use client';

import { useTranslations } from 'next-intl';
import type { Locale } from '@/content/types';

/** What the screen prints while the door rolls up: the first era's date, as on the time circuits. */
export function ScreenLaunch({ locale }: { locale: Locale }) {
  const t = useTranslations('Garage');
  return (
    <div className="crt-page crt-launch" aria-live="polite">
      <p className="crt-name">{t('destination')}</p>
      {locale === 'en' ? <p className="crt-dim">{t('gameLanguage')}</p> : null}
    </div>
  );
}
