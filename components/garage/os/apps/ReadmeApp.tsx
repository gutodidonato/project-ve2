'use client';

import { useTranslations } from 'next-intl';
import type { Profile } from '@/content/types';

/** Leia-me.txt: who this is (from the profile) and how to get around. */
export function ReadmeApp({ profile }: { profile: Profile }) {
  const t = useTranslations('Os');
  return (
    <div className="crt-page">
      <h2 className="crt-title" tabIndex={-1}>
        {profile.name}
      </h2>
      <p className="crt-dim">{profile.headline}</p>
      <p>{t('readmeHow')}</p>
      <p className="crt-dim">{t('readmePit')}</p>
    </div>
  );
}
