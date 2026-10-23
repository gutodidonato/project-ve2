'use client';

import { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Tier } from '@/lib/game/tier';
import type { GarageAction } from '@/lib/garage/state';
import { registerGarageDebug } from '@/lib/garage/debug';
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
  act(a: GarageAction): void;
}

const copyRect = (r: { x: number; y: number; width: number; height: number }) => ({ ...r });

/** The garage: room and bench, the computer, the door and the DeLorean behind it, the two lights, the camera. */
export function Scene({ tier, act }: SceneProps) {
  // Count every pass of a frame (tier A adds post-processing passes): reset by hand, read before the next render.
  useFrame(({ gl }) => {
    gl.info.autoReset = false;
    garageRuntime.drawCalls = gl.info.render.calls;
    gl.info.reset();
  });

  useEffect(
    () =>
      registerGarageDebug(() => {
        const { garage } = useGameStore.getState();
        return {
          view: garage.view,
          content: garage.content,
          door: garageRuntime.door,
          camera: [...garageRuntime.camera],
          arrived: garageRuntime.arrived,
          drawCalls: garageRuntime.drawCalls,
          glassRect: copyRect(garageRuntime.glassRect),
          keyRects: garageRuntime.keyRects.map((k) => ({ code: k.code, rect: copyRect(k.rect) })),
        };
      }),
    [],
  );

  return (
    <>
      <color attach="background" args={['#1d2120']} />
      <Lights tier={tier} />
      <Bench />
      <Computer />
      <Keyboard act={act} />
      <GarageDoor />
      <DeLorean />
      <GarageCamera />
    </>
  );
}
