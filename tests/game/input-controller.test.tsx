// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { InputController } from '@/components/game/InputController';
import { SCROLL_CODES } from '@/lib/game/input';
import { inputQueue } from '@/lib/game/runtime';
import { useGameStore } from '@/lib/store';

let layer: HTMLDivElement;
let panel: HTMLElement;
let panelText: HTMLParagraphElement;

/** A `keydown` the way the browser sends it; returns whether the game called preventDefault. */
function keydown(target: Element, code: string): boolean {
  const event = new KeyboardEvent('keydown', { code, key: code, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event.defaultPrevented;
}

const held = () => inputQueue.consume();

describe('InputController inside a focused scroll panel', () => {
  beforeEach(() => {
    useGameStore.setState({ pitstop: false });
    inputQueue.releaseAll();
    inputQueue.endDrag();
    inputQueue.consume();
    layer = document.createElement('div');
    panel = document.createElement('section');
    panel.setAttribute('data-scroll-panel', '');
    panel.tabIndex = 0;
    panelText = document.createElement('p');
    panel.appendChild(panelText);
    layer.appendChild(panel);
    document.body.appendChild(layer);
    render(<InputController layerRef={{ current: layer }} />);
  });

  afterEach(() => {
    cleanup();
    layer.remove();
  });

  it('lets the scroll keys scroll the panel: not driving, not preventing the default', () => {
    for (const code of ['ArrowUp', 'ArrowDown', 'Space', 'PageUp', 'PageDown', 'Home', 'End']) {
      expect(keydown(panelText, code), code).toBe(false);
    }
    const input = held();
    expect(input.controls).toEqual({ throttle: 0, steer: 0 });
    expect(input.nextStop).toBe(false);
  });

  it('keeps WASD and the left / right arrows driving, so a click on the panel text does not stop the car', () => {
    for (const code of ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowLeft', 'ArrowRight']) {
      expect(keydown(panelText, code), code).toBe(true);
    }
    // W and S cancel, A and D cancel: hold one pair at a time to see each drive.
    inputQueue.releaseAll();
    keydown(panelText, 'KeyW');
    expect(held().controls.throttle).toBe(1);
    inputQueue.releaseAll();
    keydown(panelText, 'ArrowLeft');
    expect(held().controls.steer).toBe(1);
  });

  it('drives with the same keys outside the panel, scroll keys included', () => {
    for (const code of ['ArrowUp', 'ArrowDown', 'Space']) {
      expect(keydown(document.body, code), code).toBe(true);
    }
  });

  it('names exactly the keys the browser scrolls with', () => {
    expect([...SCROLL_CODES].sort()).toEqual(
      ['ArrowDown', 'ArrowUp', 'End', 'Home', 'PageDown', 'PageUp', 'Space'],
    );
  });
});
