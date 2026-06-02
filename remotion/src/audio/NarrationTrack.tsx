// NarrationTrack.tsx
// Componente Remotion que reproduz áudio de narração gerado pelo ElevenLabs.
// Use dentro de qualquer composição para adicionar voz ao vídeo.

import React from 'react';
import { Audio, staticFile, useVideoConfig } from 'remotion';

interface NarrationTrackProps {
  // Caminho do arquivo de áudio relativo a remotion/public/
  // Exemplo: 'audio/narration_ad_30s.mp3'
  src: string;

  // Volume (0–1). Padrão: 1
  volume?: number;

  // Iniciar em X frames (padrão: 0)
  startFrom?: number;

  // Cortar o áudio após X frames
  endAt?: number;
}

export const NarrationTrack: React.FC<NarrationTrackProps> = ({
  src,
  volume = 1,
  startFrom = 0,
  endAt,
}) => {
  const { durationInFrames } = useVideoConfig();

  return (
    <Audio
      src={staticFile(src)}
      volume={volume}
      startFrom={startFrom}
      endAt={endAt ?? durationInFrames}
      // Permite que o Remotion espere o áudio carregar antes de renderizar
      pauseWhenBuffering
    />
  );
};

// ── COMO USAR ─────────────────────────────────────────────────────────────────
// 1. Gere o áudio:
//    node pipeline/generate_narration.js --script ad_30s --out remotion/public/audio/narration_30s.mp3
//
// 2. Adicione em qualquer composição:
//    <AbsoluteFill>
//      <NarrationTrack src="audio/narration_30s.mp3" volume={0.9} />
//      <VividFlowTemplate />
//    </AbsoluteFill>
//
// 3. Na root, crie uma composição "com narração":
//    <Composition id="VividFlow_Narrated" ... />

// ── COMPOSIÇÃO DE EXEMPLO COM NARRAÇÃO ───────────────────────────────────────
import { AbsoluteFill } from 'remotion';
import { VividFlowTemplate, buildVividFlowProject } from '../templates/VividFlowTemplate';

export const VividFlowNarrated: React.FC = () => (
  <AbsoluteFill>
    {/* Narração gerada pelo ElevenLabs */}
    <NarrationTrack src="audio/narration_30s.mp3" volume={1} />
    {/* Template visual */}
    <VividFlowTemplate project={buildVividFlowProject()} />
  </AbsoluteFill>
);
