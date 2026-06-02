// LottiePlayer.tsx
// Wrapper para @remotion/lottie — usa animationData (JSON) direto.
// Para carregar de URL remota, use useLottieFromUrl (abaixo).

import React, { useState, useEffect, useCallback } from 'react';
import { Lottie, LottieAnimationData } from '@remotion/lottie';
import { delayRender, continueRender, cancelRender } from 'remotion';

// ── COMPONENTE PARA LOTTIE LOCAL (JSON importado) ─────────────────────────────
interface LottieLocalProps {
  data: LottieAnimationData;
  width?: number;
  height?: number;
  loop?: boolean;
  speed?: number;
  style?: React.CSSProperties;
}

export const LottieLocal: React.FC<LottieLocalProps> = ({ data, width = 200, height = 200, loop = true, speed = 1, style }) => (
  <Lottie
    animationData={data}
    loop={loop}
    playbackRate={speed}
    style={{ width, height, ...style }}
  />
);

// ── COMPONENTE PARA LOTTIE REMOTO (busca JSON da URL) ────────────────────────
interface LottieRemoteProps {
  url: string;
  width?: number;
  height?: number;
  loop?: boolean;
  speed?: number;
  style?: React.CSSProperties;
}

export const LottieRemote: React.FC<LottieRemoteProps> = ({ url, width = 200, height = 200, loop = true, speed = 1, style }) => {
  const [data, setData] = useState<LottieAnimationData | null>(null);

  const [handle] = useState(() => delayRender(`Loading Lottie: ${url}`));

  const fetchLottie = useCallback(async () => {
    try {
      const res = await fetch(url);
      const json = await res.json() as LottieAnimationData;
      setData(json);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [url, handle]);

  useEffect(() => { fetchLottie(); }, [fetchLottie]);

  if (!data) return null;

  return (
    <Lottie
      animationData={data}
      loop={loop}
      playbackRate={speed}
      style={{ width, height, ...style }}
    />
  );
};
