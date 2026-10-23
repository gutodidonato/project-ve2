'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/content/types';
import { garageSound } from '@/lib/garage/sound';
import type { GarageAction } from '@/lib/garage/state';
import { useGameStore } from '@/lib/store';
import { CreditsButton } from '@/components/game/CreditsDialog';

const chip =
  'inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center border border-[#3A403F] bg-[#17130C]/85 px-3 font-body text-sm text-[#D6CBB0] hover:border-[#D6CBB0]';

/**
 * The controls outside the screen, bottom-left: sound, credits and PT | EN
 * (the pit stop toggle keeps its own place, bottom-right).
 */
export function GarageChrome({ locale, act }: { locale: Locale; act(a: GarageAction): void }) {
  const t = useTranslations('Garage');
  const [muted, setMuted] = useState(() => garageSound().muted());
  // Inside the monitor the page takes the window; the controls come back with the bench.
  const inside = useGameStore((s) => s.garage.view === 'screen');
  if (inside) return null;

  return (
    <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-2">
      <button
        type="button"
        aria-pressed={!muted}
        onClick={() => {
          garageSound().setMuted(!muted);
          setMuted(!muted);
        }}
        className={`${chip} ${muted ? 'text-[#8a8270] line-through' : ''}`}
      >
        {t('sound')}
      </button>
      <CreditsButton className={chip} />
      <span className={`${chip} gap-0 px-0`}>
        {(['pt', 'en'] as const).map((l, i) => (
          <span key={l} className="inline-flex items-center gap-1">
            {i > 0 ? <span aria-hidden="true">|</span> : null}
            <a
              href={`/${l}`}
              hrefLang={l === 'pt' ? 'pt-BR' : 'en'}
              aria-current={l === locale ? 'true' : undefined}
              onClick={(e) => {
                // A modified or middle click keeps the browser's own behaviour (new tab, new window).
                if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                e.preventDefault();
                if (l !== locale) act('language');
              }}
              className={`inline-flex min-h-11 min-w-11 items-center justify-center ${l === locale ? 'text-[#FFB000]' : 'underline underline-offset-2'}`}
            >
              {l.toUpperCase()}
            </a>
          </span>
        ))}
      </span>
    </div>
  );
}
