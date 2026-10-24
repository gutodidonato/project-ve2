'use client';

import type { CaseSlug, Profile } from '@/content/types';
import { Icon } from '../Icon';

/** The Projects folder: one file per case of the profile; opening a file opens its window. */
export function ProjectsApp({ profile, compact, onOpen }: { profile: Profile; compact: boolean; onOpen(slug: CaseSlug): void }) {
  return (
    <div className="os-folder">
      {profile.cases.map((c) => (
        <Icon key={c.slug} id="file" label={`${c.slug}.txt`} selected={false} compact={compact} onSelect={() => {}} onOpen={() => onOpen(c.slug)} />
      ))}
    </div>
  );
}
