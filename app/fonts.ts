import { IBM_Plex_Mono, IBM_Plex_Sans, Michroma } from 'next/font/google';

// Exposed as --font-michroma / --font-plex-*; globals.css maps them to the
// --font-display / --font-body / --font-mono tokens (and Tailwind's font-* utilities).
const display = Michroma({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-michroma',
});
const body = IBM_Plex_Sans({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plex-sans',
});
const mono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plex-mono',
});

/**
 * The class for `<html>` that defines the three font variables. Shared by the
 * locale layout and the 404 page, which owns its own `<html>`.
 */
export const fontVariables = `${display.variable} ${body.variable} ${mono.variable}`;
