'use client';

import { useTranslations } from 'next-intl';
import type { Locale } from '@/content/types';

/** Salto88.exe: what the screen says while the camera pulls back and the door rolls up. */
export function LaunchDialog({ locale }: { locale: Locale }) {
  const t = useTranslations('Os');
  const tg = useTranslations('Garage');
  return (
    <div className="crt-page" aria-live="polite">
      <p className="crt-title" tabIndex={-1}>
        {t('starting')}
      </p>
      <p>{tg('destination')}</p>
      {locale === 'en' ? <p className="crt-dim">{tg('gameLanguage')}</p> : null}
      <div className="os-progress" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}
