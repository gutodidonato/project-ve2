/**
 * Safe localStorage access. Safari private mode, blocked site data and quota
 * errors all throw; none of them may break first paint or the pit stop toggle.
 * Every localStorage access in the app goes through here.
 */

/** Stored value, or `null` when absent or when storage is unavailable. */
export function readPref(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** True when the value was persisted, false when storage threw. */
export function writePref(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
