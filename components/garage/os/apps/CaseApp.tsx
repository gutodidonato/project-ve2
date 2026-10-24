'use client';

import { useTranslations } from 'next-intl';
import type { CaseSummary } from '@/content/types';

/** One case file: title, summary and stack, as written in the profile. */
export function CaseApp({ item }: { item: CaseSummary }) {
  const t = useTranslations('Os');
  return (
    <div className="crt-page">
      <h2 className="crt-title" tabIndex={-1}>
        {item.title}
      </h2>
      <p>{item.summary}</p>
      <p className="crt-dim">
        {t('stack')}: {item.stack.join(', ')}
      </p>
    </div>
  );
}
