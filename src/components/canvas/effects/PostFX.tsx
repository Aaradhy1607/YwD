"use client";

import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";

interface PostFXProps {
  bloomIntensity?: number;
  chromaticOffset?: number;
}

export function PostFX({
  bloomIntensity = 0.15,
  chromaticOffset = 0.0003,
}: PostFXProps) {
  return (
    <EffectComposer multisampling={4}>
      <Bloom
        luminanceThreshold={0.85}
        luminanceSmoothing={0.4}
        intensity={bloomIntensity}
      />
      <ChromaticAberration
        offset={new Vector2(chromaticOffset, chromaticOffset)}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
        modulationOffset={0.0}
      />
      <Noise
        opacity={0.01}
        blendFunction={BlendFunction.SOFT_LIGHT}
      />
    </EffectComposer>
  );
}
