'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';

/**
 * Last line of defense: a render error in the page that nothing closer caught
 * (the game has its own boundary and falls back to the pit stop). It sits inside
 * the locale layout, so the document, fonts and translations are still there.
 * The link is a plain document link on purpose: following it is a full reload,
 * which also drops whatever broke the React tree.
 */
export default function LocaleError({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const t = useTranslations('Error');
  const locale = useLocale();

  return (
    <main className="flex min-h-dvh flex-col items-start justify-center gap-4 px-6 py-16 md:px-16">
      <p className="eyebrow">Rodovia 2026</p>
      <h1 className="font-display text-2xl leading-tight tracking-[0.02em] text-sunset md:text-3xl">{t('title')}</h1>
      <p className="max-w-prose text-[0.9375rem] leading-relaxed text-muted">{t('body')}</p>
      <a
        href={`/${locale}`}
        className="inline-flex min-h-11 items-center border border-sun px-4 font-mono text-[0.8125rem] tracking-[0.06em] text-sun hover:bg-sun hover:text-night"
      >
        {t('reload')}
      </a>
    </main>
  );
}
