import type { ReactNode } from 'react';
import './globals.css';

// Passthrough: the locale layout (app/[locale]/layout.tsx) owns <html>/<body>.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
