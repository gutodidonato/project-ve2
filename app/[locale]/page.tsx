import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { GameMount } from '@/components/game/GameMount';
import { PersonJsonLd } from '@/components/pitstop/PersonJsonLd';
import { PitStop } from '@/components/pitstop/PitStop';
import { getProfile } from '@/content';
import { routing } from '@/i18n/routing';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const profile = getProfile(locale);

  return (
    <>
      <PersonJsonLd profile={profile} locale={locale} />
      <PitStop profile={profile} locale={locale} />
      <GameMount profile={profile} locale={locale} />
    </>
  );
}
