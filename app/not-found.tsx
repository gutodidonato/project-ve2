import type { Metadata } from 'next';
import { fontVariables } from '@/app/fonts';

export const metadata: Metadata = { title: '404 · Rodovia 2026' };

const linkClass =
  'inline-flex min-h-11 items-center border border-sun px-4 font-mono text-[0.8125rem] tracking-[0.06em] text-sun hover:bg-sun hover:text-night';

/**
 * The 404 for every URL no route matches (`/pt/nao-existe`, `/x`). The root
 * layout is a passthrough and the locale layout (which owns `<html>`) is not part
 * of this tree, so the page brings its own document. It also cannot know the
 * visitor's language, so it says it in both and links to each home. The links
 * are plain anchors: leaving a page that owns its own `<html>` is a full load.
 */
export default function NotFound() {
  return (
    <html lang="pt-BR" className={fontVariables}>
      <body>
        <main className="flex min-h-dvh flex-col items-start justify-center gap-6 px-6 py-16 md:px-16">
          <p className="eyebrow">Rodovia 2026</p>
          <p aria-hidden="true" className="font-display text-7xl leading-none text-sunset md:text-8xl">
            404
          </p>
          <section className="flex flex-col gap-2">
            <h1 className="font-display text-2xl leading-tight tracking-[0.02em] text-ink md:text-3xl">
              Fim da estrada
            </h1>
            <p className="max-w-prose text-[0.9375rem] leading-relaxed text-muted">
              Esta página não existe ou mudou de lugar.
            </p>
          </section>
          <section lang="en" className="flex flex-col gap-2">
            <h2 className="font-display text-xl leading-tight tracking-[0.02em] text-ink md:text-2xl">
              End of the road
            </h2>
            <p className="max-w-prose text-[0.9375rem] leading-relaxed text-muted">
              This page does not exist or has moved.
            </p>
          </section>
          <nav className="flex flex-wrap gap-3">
            {/* Plain anchors on purpose (see above): next/link would try a client-side swap of <html>. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/pt" className={linkClass}>
              Voltar ao início
            </a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/en" lang="en" className={linkClass}>
              Back to home
            </a>
          </nav>
        </main>
      </body>
    </html>
  );
}
