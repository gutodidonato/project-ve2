'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Profile } from '@/content/types';
import type { GarageAction } from '@/lib/garage/state';

/** Menu order and the letter printed on each key. */
const ITEMS = [
  { action: 'cv', key: 'C', label: 'menuCv' },
  { action: 'play', key: 'J', label: 'menuPlay' },
  { action: 'contact', key: 'K', label: 'menuContact' },
  { action: 'language', key: 'E', label: 'menuLanguage' },
] as const;

const PROMPT_LABEL: Record<GarageAction, (typeof ITEMS)[number]['label'] | null> = {
  cv: 'menuCv',
  play: 'menuPlay',
  contact: 'menuContact',
  language: 'menuLanguage',
  back: null,
};

/** The tube warms up once per page, not every time the camera comes back to the bench. */
let booted = false;

/** The bench menu: the name at double height, the role, the four keys and the prompt. */
export function ScreenMenu({
  profile,
  last,
  onAction,
}: {
  profile: Profile;
  last: GarageAction | null;
  onAction(a: GarageAction): void;
}) {
  const t = useTranslations('Garage');
  const [boot] = useState(() => !booted);
  useEffect(() => {
    booted = true;
  }, []);

  const promptKey = last === null ? null : PROMPT_LABEL[last];
  const prompt = promptKey === null ? '' : t(promptKey).toLowerCase();

  return (
    <div className={`crt-page crt-flicker${boot ? ' crt-boot' : ''}`}>
      <p className="crt-name">{profile.name}</p>
      <p className="crt-dim">{profile.headline}</p>
      <ul className="crt-keys">
        {ITEMS.map((item) => (
          <li key={item.action}>
            <button type="button" className="crt-key" data-action={item.action} onClick={() => onAction(item.action)}>
              <kbd>{item.key}</kbd>
              {t(item.label)}
            </button>
          </li>
        ))}
      </ul>
      <p className="crt-prompt" data-testid="prompt" aria-hidden="true">
        {`> ${prompt}`}
        <span className="crt-cursor">_</span>
      </p>
    </div>
  );
}
