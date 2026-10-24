const TYPING_SELECTOR = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';

/**
 * True when a key event originates in something the user types into, so the
 * game must not treat the keystroke as driving or as the pit stop toggle.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (target === null) return false;
  // Duck-typed on purpose: stays safe across realms (iframes) and in non-DOM environments.
  const closest = (target as Partial<Element>).closest;
  if (typeof closest !== 'function') return false;
  return closest.call(target, TYPING_SELECTOR) !== null;
}
