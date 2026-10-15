import { describe, expect, it } from 'vitest';
import en from '@/messages/en.json';
import pt from '@/messages/pt.json';

/** Every leaf key path, e.g. `Game.zones.cases`. */
function keys(node: unknown, prefix = ''): string[] {
  if (node === null || typeof node !== 'object') return [prefix];
  return Object.entries(node).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
}

describe('messages', () => {
  it('pt and en define the same keys', () => {
    expect(keys(en).sort()).toEqual(keys(pt).sort());
  });

  it('names every zone in both locales', () => {
    for (const messages of [pt, en]) {
      expect(Object.keys(messages.Game.zones).sort()).toEqual(
        ['cases', 'contato', 'experiencia', 'oficina', 'servicos'],
      );
    }
  });
});
