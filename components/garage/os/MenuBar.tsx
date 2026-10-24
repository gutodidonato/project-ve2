'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

/** The inverted menu bar: brand, three menus (only Help acts: it opens the readme) and the local clock. */
export function MenuBar({ onHelp }: { onHelp(): void }) {
  const t = useTranslations('Os');
  const [clock, setClock] = useState(() => hhmm(new Date()));
  useEffect(() => {
    const id = window.setInterval(() => setClock(hhmm(new Date())), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="os-menubar">
      <span className="os-brand">{t('brand')}</span>
      <span>{t('file')}</span>
      <span>{t('view')}</span>
      <button type="button" className="os-menu-button" onClick={onHelp}>
        {t('help')}
      </button>
      <span className="os-clock">{clock}</span>
    </div>
  );
}
