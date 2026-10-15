// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { ZonePanel } from '@/components/game/ZonePanel';
import { getProfile } from '@/content';
import { inputQueue } from '@/lib/game/runtime';
import { ZONES } from '@/lib/game/zones';
import { useGameStore } from '@/lib/store';
import en from '@/messages/en.json';

const names = Object.fromEntries(ZONES.map((z) => [z.id, en.Game.zones[z.id]])) as Record<
  (typeof ZONES)[number]['id'],
  string
>;

function renderPanel() {
  const view = render(
    <NextIntlClientProvider locale="en" messages={en}>
      <ZonePanel profile={getProfile('en')} locale="en" names={names} />
    </NextIntlClientProvider>,
  );
  return view.container.querySelector('[data-zone-panel]') as HTMLElement;
}

describe('ZonePanel keyboard', () => {
  beforeAll(() => {
    // jsdom has no Element.scrollTo; the panel resets its scroll when the zone changes.
    Element.prototype.scrollTo = () => {};
  });

  beforeEach(() => {
    useGameStore.setState({ zone: 'oficina', mode: 'idle' });
    inputQueue.releaseAll();
    inputQueue.consume();
  });

  afterEach(cleanup);

  it('parks the car at this stop on keys that act on the panel', () => {
    const panel = renderPanel();
    fireEvent.keyDown(panel, { key: 'ArrowDown', code: 'ArrowDown' });
    expect(inputQueue.consume().gotoZone).toBe('oficina');
    fireEvent.keyDown(panel, { key: 'Tab', code: 'Tab' });
    expect(inputQueue.consume().gotoZone).toBe('oficina');
  });

  it('leaves WASD and left / right alone: they drive away instead of pulling the car back', () => {
    const panel = renderPanel();
    for (const code of ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowLeft', 'ArrowRight']) {
      fireEvent.keyDown(panel, { key: code, code });
      expect(inputQueue.consume().gotoZone, code).toBeNull();
    }
  });

  it('still counts WASD typed into a field of the panel as using the panel', () => {
    useGameStore.setState({ zone: 'contato' });
    const panel = renderPanel();
    const message = panel.querySelector('textarea') as HTMLTextAreaElement;
    expect(message).not.toBeNull();
    fireEvent.keyDown(message, { key: 'w', code: 'KeyW' });
    expect(inputQueue.consume().gotoZone).toBe('contato');
  });

  it('Escape drops the focus from the panel', () => {
    const panel = renderPanel();
    panel.focus();
    expect(document.activeElement).toBe(panel);
    fireEvent.keyDown(panel, { key: 'Escape', code: 'Escape' });
    expect(document.activeElement).not.toBe(panel);
  });
});
