'use client';

import { useId, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { MODEL_CREDIT } from '@/content/credits';

/**
 * The credits button and its native modal (Esc closes it, focus is trapped
 * while open and returns to the button). The credit line itself stays exactly
 * MODEL_CREDIT; only the lead-in is translated.
 */
export function CreditsButton({ className }: { className?: string }) {
  const t = useTranslations('Game');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className={className}
      >
        {t('credits')}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => buttonRef.current?.focus()}
        onClick={(e) => {
          // Only the backdrop hits the <dialog> itself: the content box is the inner div.
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="m-auto w-[min(34rem,calc(100vw-2rem))] border border-[#3A403F] bg-[#17130C] p-0 font-body text-[#D6CBB0] backdrop:bg-black/70"
      >
        <div className="flex flex-col gap-4 p-5">
          <h2 id={titleId} className="text-base font-medium">
            {t('credits')}
          </h2>
          <p className="text-sm leading-relaxed [overflow-wrap:anywhere]">
            {t('creditsIntro')} {`"${MODEL_CREDIT.title}" by ${MODEL_CREDIT.author} (`}
            <a href={MODEL_CREDIT.url} className="underline underline-offset-2">
              {MODEL_CREDIT.url}
            </a>
            {'), '}
            <a href={MODEL_CREDIT.licenseUrl} rel="license" className="underline underline-offset-2">
              {MODEL_CREDIT.license}
            </a>
            {', modified (optimized).'}
          </p>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="inline-flex min-h-11 cursor-pointer items-center self-end border border-[#3A403F] px-4 text-sm hover:border-[#D6CBB0]"
          >
            {t('close')}
          </button>
        </div>
      </dialog>
    </>
  );
}
