'use client';

import { useId, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { MODEL_CREDIT } from '@/content/credits';
import { cvLink } from '@/content/links';
import type { Locale, Profile } from '@/content/types';
import { nextStopOf, speedKmh } from '@/lib/game/hud';
import { inputQueue, runtime } from '@/lib/game/runtime';
import type { Mode, ZoneId } from '@/lib/game/types';
import { linkClass } from '@/components/pitstop/ui';
import { useRuntimeFrame, writeText } from './useRuntimeFrame';

const MODES: readonly Mode[] = ['demo', 'manual', 'tour', 'goto', 'idle'];

const chipBase = 'inline-flex items-center border bg-panel/85 px-3 tracking-[0.06em] backdrop-blur-sm';
const chip = `${chipBase} min-h-9 md:min-h-11`;
/** The one primary touch control: 44px tall at every width. */
const chipPrimary = `${chipBase} min-h-11`;

export interface HudProps {
  profile: Profile;
  locale: Locale;
  /** Display name per zone, already localized. */
  names: Record<ZoneId, string>;
}

/**
 * Dashboard over the game: speed, driving mode and next stop (written straight
 * into the DOM from the shared frame loop, never through React state), the
 * "next" button (the touch control for what Space and the wheel do), the CV and
 * the model credits. Top-right; under 700px it stacks below the pit stop toggle
 * and the buttons wrap inside the room left of the minimap. On wide screens the
 * name and role sit top-left.
 */
export function Hud({ profile, locale, names }: HudProps) {
  const t = useTranslations('Game');
  const cv = cvLink(profile, locale);
  const modes = useMemo(
    () => Object.fromEntries(MODES.map((m) => [m, t(`modes.${m}`)])) as Record<Mode, string>,
    [t],
  );

  const speedRef = useRef<HTMLSpanElement>(null);
  const modeRef = useRef<HTMLElement>(null);
  const nextRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const creditsRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useRuntimeFrame(() => {
    writeText(speedRef.current, String(speedKmh(runtime.car.speed)));
    writeText(modeRef.current, modes[runtime.mode]);
    writeText(nextRef.current, names[nextStopOf(runtime)]);
  });

  return (
    <>
      <div
        data-identity
        className="pointer-events-none absolute top-4 left-4 z-10 hidden flex-col gap-1 border border-line bg-panel/80 px-4 py-2.5 backdrop-blur-sm lg:flex"
      >
        <p className="font-display text-xl leading-tight tracking-[0.02em]">
          <span className="text-sunset">{profile.name}</span>
        </p>
        <p className="font-mono text-[0.8125rem] text-cyan">{profile.headline}</p>
      </div>

      <div
        data-hud
        role="group"
        aria-label={t('hud')}
        className="absolute top-[4.25rem] right-4 z-10 flex max-w-[calc(100%-9rem)] flex-col items-end gap-2 font-mono text-xs md:top-4 md:max-w-none md:flex-row md:items-stretch md:text-[0.8125rem]"
      >
        {/* Two compact rows under 700px (speed + mode, then next stop); one strip above. */}
        <dl className="grid grid-cols-[auto_auto] items-baseline justify-items-end gap-x-3 gap-y-0.5 border border-line bg-panel/85 px-3 py-1.5 backdrop-blur-sm md:flex md:min-h-11 md:items-center md:gap-x-4 md:py-0">
          <div className="flex items-baseline gap-1.5">
            <dt className="sr-only">{t('speed')}</dt>
            <dd>
              <span ref={speedRef} className="inline-block min-w-[3ch] text-right text-sm font-medium text-sun tabular-nums md:text-base" />{' '}
              <span className="text-muted">km/h</span>
            </dd>
          </div>
          <div className="flex items-baseline">
            <dt className="sr-only">{t('mode')}</dt>
            <dd ref={modeRef} className="tracking-[0.12em] text-cyan uppercase" />
          </div>
          <div className="col-span-2 flex items-baseline gap-1.5">
            <dt className="text-muted">{t('next')}</dt>
            <dd ref={nextRef} className="text-ink" />
          </div>
        </dl>

        <div className="flex flex-wrap justify-end gap-2">
          {/* Space and the wheel have no touch equivalent: this is it. */}
          <button
            type="button"
            aria-label={t('nextStop')}
            onClick={() => inputQueue.nextStop()}
            className={`${chipPrimary} cursor-pointer border-cyan text-cyan hover:bg-cyan hover:text-night`}
          >
            {t('next')}
            <span aria-hidden="true">&nbsp;›</span>
          </button>
          <a
            href={cv.href}
            type="application/pdf"
            hrefLang={cv.locale === 'pt' ? 'pt-BR' : 'en'}
            className={`${chip} border-sun text-sun hover:bg-sun hover:text-night`}
          >
            {cv.locale === locale ? t('cv') : t('cvPtOnly')}
          </a>
          <button
            ref={creditsRef}
            type="button"
            aria-haspopup="dialog"
            onClick={() => dialogRef.current?.showModal()}
            className={`${chip} cursor-pointer border-line text-ink hover:border-muted`}
          >
            {t('credits')}
          </button>
        </div>

        {/* Native modal: Esc closes it, focus is trapped while open and returns to the button. */}
        <dialog
          ref={dialogRef}
          aria-labelledby={titleId}
          data-scroll-panel
          onClose={() => creditsRef.current?.focus()}
          onClick={(e) => {
            // Only the backdrop hits the <dialog> itself: the content box is the inner div.
            if (e.target === e.currentTarget) e.currentTarget.close();
          }}
          className="m-auto w-[min(34rem,calc(100vw-2rem))] border border-line bg-panel p-0 font-body text-ink backdrop:bg-night/70"
        >
          <div className="flex flex-col gap-4 p-5">
            <h2 id={titleId} className="eyebrow">
              {t('credits')}
            </h2>
            {/* The credit itself stays exactly MODEL_CREDIT.text; only the lead-in is translated. */}
            <p className="text-sm leading-relaxed text-muted [overflow-wrap:anywhere]">
              {t('creditsIntro')} {`"${MODEL_CREDIT.title}" by ${MODEL_CREDIT.author} (`}
              <a href={MODEL_CREDIT.url} className={linkClass}>
                {MODEL_CREDIT.url}
              </a>
              {'), '}
              <a href={MODEL_CREDIT.licenseUrl} rel="license" className={linkClass}>
                {MODEL_CREDIT.license}
              </a>
              {', modified (optimized).'}
            </p>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="inline-flex min-h-11 cursor-pointer items-center self-end border border-line px-4 font-mono text-[0.8125rem] tracking-[0.06em] text-ink hover:border-muted"
            >
              {t('close')}
            </button>
          </div>
        </dialog>
      </div>
    </>
  );
}
