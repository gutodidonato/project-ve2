'use client';

import { useTranslations } from 'next-intl';
import { Icon } from '../Icon';

/** The Trash: one log file, a joke that claims nothing about the career. */
export function TrashApp({ compact, onOpen }: { compact: boolean; onOpen(): void }) {
  const t = useTranslations('Os');
  return (
    <div className="os-folder">
      <Icon id="file" label={t('bugFile')} selected={false} compact={compact} onSelect={() => {}} onOpen={onOpen} />
    </div>
  );
}

/** bug_88mph.log. */
export function BugLogApp() {
  const t = useTranslations('Os');
  return (
    <div className="crt-page">
      <p className="crt-title" tabIndex={-1}>
        {t('bugText')}
      </p>
    </div>
  );
}
