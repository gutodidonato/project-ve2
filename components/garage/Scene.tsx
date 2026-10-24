'use client';

import { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Tier } from '@/lib/game/tier';
import type { DesktopAction } from '@/lib/garage/desktop';
import { registerGarageDebug } from '@/lib/garage/debug';
import { launchFrame } from '@/lib/garage/launch';
import { garageRuntime } from '@/lib/garage/runtime';
import { useGameStore } from '@/lib/store';
import { Bench } from './Bench';
import { Computer } from './Computer';
import { DeLorean } from './DeLorean';
import { GarageCamera } from './GarageCamera';
import { GarageDoor } from './GarageDoor';
import { Keyboard } from './Keyboard';
import { Lights } from './Lights';

export interface SceneProps {
  tier: Tier;
  onKey(a: DesktopAction | 'language'): void;
}

const copyRect = (r: { x: number; y: number; width: number; height: number }) => ({ ...r });

/** The garage: room and bench, the computer, the door and the DeLorean behind it, the two lights, the camera. */
export function Scene({ tier, onKey }: SceneProps) {
  // Count every pass of a frame (tier A adds post-processing passes): reset by hand, read before the next render.
  // The launch timeline drives the door, the lights, the camera and the flash.
  useFrame(() => {
    const start = garageRuntime.launchStart;
    const elapsed = start === null ? 0 : (garageRuntime.launchHold ?? performance.now() - start);
    garageRuntime.launch = launchFrame(elapsed);
    garageRuntime.door = garageRuntime.launch.door;
  }, -1);

  useFrame(({ gl }) => {
    gl.info.autoReset = false;
    garageRuntime.drawCalls = gl.info.render.calls;
    gl.info.reset();
  });

  useEffect(
    () =>
      registerGarageDebug(() => {
        const { desktop } = useGameStore.getState();
        return {
          view: desktop.view,
          windows: desktop.windows.map((w) => w.id),
          focus: desktop.focus,
          zoom: garageRuntime.launch.zoom,
          door: garageRuntime.door,
          whiteout: garageRuntime.launch.whiteout,
          camera: [...garageRuntime.camera],
          arrived: garageRuntime.arrived,
          drawCalls: garageRuntime.drawCalls,
          glassRect: copyRect(garageRuntime.glassRect),
          keyRects: garageRuntime.keyRects.map((k) => ({ code: k.code, rect: copyRect(k.rect) })),
        };
      }, (ms) => {
        garageRuntime.launchHold = ms;
      }),
    [],
  );

  return (
    <>
      <color attach="background" args={['#1d2120']} />
      <Lights tier={tier} />
      <Bench />
      <Computer />
      <Keyboard onKey={onKey} />
      <GarageDoor />
      <DeLorean />
      <GarageCamera />
    </>
  );
}
