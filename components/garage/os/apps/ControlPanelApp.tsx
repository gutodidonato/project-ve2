'use client';

import { useTranslations } from 'next-intl';
import { MODEL_CREDIT } from '@/content/credits';

/** Control panel: sound, language (PT | EN, the same as E) and the car model's credit, word for word. */
export function ControlPanelApp({ sound, onLanguage }: { sound: { muted: boolean; toggle(): void }; onLanguage(): void }) {
  const t = useTranslations('Os');
  const tg = useTranslations('Game');
  const tp = useTranslations('PitStop');
  return (
    <div className="crt-page">
      <dl className="crt-rows">
        <div>
          <dt className="crt-dim">{t('sound')}</dt>
          <dd>
            <button type="button" className="crt-action" aria-pressed={!sound.muted} onClick={sound.toggle}>
              {t('sound')}: {sound.muted ? t('off') : t('on')}
            </button>
          </dd>
        </div>
        <div>
          <dt className="crt-dim">{t('language')}</dt>
          <dd>
            <button type="button" className="crt-action" aria-label={tp('switchLocale')} onClick={onLanguage}>
              {t('languageSwitch')}
            </button>
          </dd>
        </div>
      </dl>
      <h3>{t('credits')}</h3>
      <p>
        {tg('creditsIntro')} {`"${MODEL_CREDIT.title}" by ${MODEL_CREDIT.author} (`}
        <a href={MODEL_CREDIT.url}>{MODEL_CREDIT.url}</a>
        {'), '}
        <a href={MODEL_CREDIT.licenseUrl} rel="license">
          {MODEL_CREDIT.license}
        </a>
        {', modified (optimized).'}
      </p>
    </div>
  );
}
