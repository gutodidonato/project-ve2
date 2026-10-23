import { describe, expect, it } from 'vitest';
import {
  gameUrl,
  INITIAL_GARAGE,
  keyToAction,
  otherLocale,
  parseScreenHash,
  reduceGarage,
  screenHash,
  stateFromHash,
  type GarageAction,
  type GarageState,
} from '@/lib/garage/state';

const bench: GarageState = { view: 'bench', content: null };
const cv: GarageState = { view: 'screen', content: 'cv' };
const contact: GarageState = { view: 'screen', content: 'contact' };
const launch: GarageState = { view: 'launch', content: null };

describe('reduceGarage', () => {
  it('opens the screen from the bench', () => {
    expect(reduceGarage(bench, 'cv')).toEqual({ state: cv, effect: null });
    expect(reduceGarage(bench, 'contact')).toEqual({ state: contact, effect: null });
  });

  it('starts the launch from the bench and from the screen', () => {
    expect(reduceGarage(bench, 'play')).toEqual({ state: launch, effect: 'start-launch' });
    expect(reduceGarage(cv, 'play')).toEqual({ state: launch, effect: 'start-launch' });
  });

  it('switches the language without leaving the view', () => {
    expect(reduceGarage(bench, 'language')).toEqual({ state: bench, effect: 'switch-locale' });
    expect(reduceGarage(cv, 'language')).toEqual({ state: cv, effect: 'switch-locale' });
  });

  it('back is a no-op on the bench and leaves the screen', () => {
    expect(reduceGarage(bench, 'back')).toEqual({ state: bench, effect: null });
    expect(reduceGarage(cv, 'back')).toEqual({ state: bench, effect: null });
  });

  it('swaps the content inside the screen', () => {
    expect(reduceGarage(cv, 'contact')).toEqual({ state: contact, effect: null });
  });

  it('only back acts during the launch', () => {
    expect(reduceGarage(launch, 'back')).toEqual({ state: bench, effect: 'cancel-launch' });
    for (const a of ['play', 'cv', 'contact', 'language'] as GarageAction[]) {
      expect(reduceGarage(launch, a)).toEqual({ state: launch, effect: null });
    }
  });
});

describe('keyToAction', () => {
  it('maps the four letters and Escape, any case', () => {
    expect(keyToAction('c')).toBe('cv');
    expect(keyToAction('C')).toBe('cv');
    expect(keyToAction('k')).toBe('contact');
    expect(keyToAction('j')).toBe('play');
    expect(keyToAction('e')).toBe('language');
    expect(keyToAction('Escape')).toBe('back');
  });

  it('ignores every other key', () => {
    expect(keyToAction('p')).toBeNull();
    expect(keyToAction('x')).toBeNull();
    expect(keyToAction('Enter')).toBeNull();
  });
});

describe('screen anchors', () => {
  it('reads both languages', () => {
    expect(parseScreenHash('#curriculo')).toBe('cv');
    expect(parseScreenHash('#resume')).toBe('cv');
    expect(parseScreenHash('#contato')).toBe('contact');
    expect(parseScreenHash('#contact')).toBe('contact');
    expect(parseScreenHash('')).toBeNull();
    expect(parseScreenHash('#cases')).toBeNull();
  });

  it('writes the anchor of the locale', () => {
    expect(screenHash('pt', 'cv')).toBe('#curriculo');
    expect(screenHash('pt', 'contact')).toBe('#contato');
    expect(screenHash('en', 'cv')).toBe('#resume');
    expect(screenHash('en', 'contact')).toBe('#contact');
    expect(screenHash('pt', null)).toBe('');
  });

  it('builds the initial state from the anchor', () => {
    expect(stateFromHash('#contact')).toEqual(contact);
    expect(stateFromHash('')).toEqual(INITIAL_GARAGE);
    expect(INITIAL_GARAGE).toEqual(bench);
  });
});

describe('locale helpers', () => {
  it('points at the game page, with lang=en in English', () => {
    expect(gameUrl('pt')).toBe('/salto88/index.html');
    expect(gameUrl('en')).toBe('/salto88/index.html?lang=en');
  });

  it('flips the locale', () => {
    expect(otherLocale('pt')).toBe('en');
    expect(otherLocale('en')).toBe('pt');
  });
});
