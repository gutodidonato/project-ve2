import { describe, expect, it } from 'vitest';
import { cvLink, getProfile, locales } from '@/content';
import type { CaseSlug, Locale } from '@/content/types';

const CASE_ORDER: CaseSlug[] = [
  'arquitetura-llm-first',
  'migracao-gcp-aws',
  'whatsapp-tech-provider',
  'oceans-20',
  'vistoria-porto-seguro',
];

describe.each(locales satisfies readonly Locale[])('profile (%s)', (locale) => {
  const profile = getProfile(locale);

  it('has the person identity', () => {
    expect(profile.fullName).toBe('Luis Augusto de Petta Didonato');
    expect(profile.name).toBe('Luis Didonato');
  });

  it('lists experience newest first', () => {
    expect(profile.experience.map((e) => e.company)).toEqual([
      'EVIG',
      'Colmeia',
      'ValiantGroup',
      'RedBit',
    ]);
    expect(profile.experience[0].end).toBeNull();
    expect(profile.experience[0].start).toBe('2026-01');
  });

  it('lists the five cases in spec order', () => {
    expect(profile.cases.map((c) => c.slug)).toEqual(CASE_ORDER);
  });

  it('has five skill groups and three services', () => {
    expect(profile.skills).toHaveLength(5);
    expect(profile.services).toHaveLength(3);
  });

  it('exposes the fixed links', () => {
    expect(profile.links.github).toBe('https://github.com/gutodidonato');
    expect(profile.links.linkedin).toBe(
      'https://www.linkedin.com/in/luis-didonato-66746a250/',
    );
    expect(profile.links.email).toBe('gutodidonato@gmail.com');
    expect(profile.links.cv.pt).toBe('/cv/luis-didonato-pt.pdf');
    expect(profile.links.cv.en).toBeNull();
    expect(profile.links.calcom).toBeNull();
  });

  it('never leaks the phone number', () => {
    expect(JSON.stringify(profile)).not.toMatch(/tel:|\+55|\(11\)\s?9/);
  });
});

describe('locales', () => {
  it('are exactly pt and en', () => {
    expect(locales).toEqual(['pt', 'en']);
  });
});

describe('cross-locale parity', () => {
  it('has the same case slugs in both locales', () => {
    expect(getProfile('pt').cases.map((c) => c.slug)).toEqual(
      getProfile('en').cases.map((c) => c.slug),
    );
  });

  it('has the same experience companies and dates in both locales', () => {
    const dates = (l: Locale) =>
      getProfile(l).experience.map((e) => [e.company, e.start, e.end]);
    expect(dates('pt')).toEqual(dates('en'));
  });

  it('keeps metric labels faithful to the CV wording', () => {
    expect(getProfile('pt').metrics.map((m) => m.label)).toEqual([
      'custo operacional na migração GCP → AWS',
      'tempo médio de carregamento em projetos selecionados',
      'mAP@50 no modelo',
      'aprovação como WhatsApp Tech Provider',
    ]);
    expect(getProfile('en').metrics.map((m) => m.label)).toEqual([
      'operating cost in the GCP → AWS migration',
      'average load time on selected projects',
      'mAP@50 on the model',
      'WhatsApp Tech Provider approval',
    ]);
  });

  it('uses locale-appropriate decimal separators in metrics', () => {
    expect(getProfile('pt').metrics.map((m) => m.value)).toEqual([
      '−80%',
      '2 s → 0,5 s',
      '85,4%',
      'Tech Provider',
    ]);
    expect(getProfile('en').metrics.map((m) => m.value)).toEqual([
      '−80%',
      '2 s → 0.5 s',
      '85.4%',
      'Tech Provider',
    ]);
  });
});

describe('cvLink', () => {
  it('uses the PT PDF for pt', () => {
    expect(cvLink(getProfile('pt'), 'pt')).toEqual({
      href: '/cv/luis-didonato-pt.pdf',
      locale: 'pt',
    });
  });

  it('falls back to the PT PDF while the EN one does not exist', () => {
    expect(cvLink(getProfile('en'), 'en')).toEqual({
      href: '/cv/luis-didonato-pt.pdf',
      locale: 'pt',
    });
  });

  it('uses the EN PDF once it exists', () => {
    const en = getProfile('en');
    const withEn = { ...en, links: { ...en.links, cv: { pt: '/a.pdf', en: '/b.pdf' } } };
    expect(cvLink(withEn, 'en')).toEqual({ href: '/b.pdf', locale: 'en' });
  });
});
