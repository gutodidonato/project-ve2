'use client';

import { useSyncExternalStore } from 'react';

const subscribeNoop = () => () => {};

/**
 * Email address that only becomes a real `mailto:` link in the browser.
 * Server HTML (and the hydration render) shows `user [at] domain [dot] tld`;
 * after mount the address is reassembled from its parts.
 */
export function EmailLink({ email, className }: { email: string; className?: string }) {
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const at = email.indexOf('@');
  if (at < 1) return <span className={className}>{email}</span>;
  const user = email.slice(0, at);
  const domain = email.slice(at + 1);

  if (!mounted) {
    // One string → one text node, so the server HTML holds the phrase contiguously.
    const spoken = `${user} [at] ${domain.split('.').join(' [dot] ')}`;
    return <span className={className}>{spoken}</span>;
  }

  const address = [user, domain].join('@');
  return (
    <a className={className} href={`mailto:${address}`}>
      {address}
    </a>
  );
}
