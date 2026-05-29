import React from 'react';
import { Composition } from 'remotion';
import { AdVideo, AdVideoSchema } from './compositions/AdVideo';
import type { z } from 'zod';

type AdVideoProps = z.infer<typeof AdVideoSchema>;

// Default scene props used in Remotion Studio preview
const DEFAULT_PROPS: AdVideoProps = {
  style: 'problem_solution',
  duration: 12,
  platform: 'instagram_reels',
  scenes: [
    { type: 'hook', text: 'Você ainda constrói do zero?', visual: 'terminal_icon', animation: 'scale_in', duration: 3 },
    { type: 'problem', text: '3h30 montando workflow. Sem faturar.', visual: 'clock_arrow', animation: 'fade_slide', duration: 3 },
    { type: 'product', text: 'Deploy Club. 88 templates. Ctrl-C, Ctrl-V.', visual: 'workflow_dashboard', animation: 'energy_radiate', duration: 4 },
    { type: 'cta', text: 'Copia e Cola.', subtext: '88 agentes por R$47', visual: 'deploy_arrow', animation: 'arrow_sweep', duration: 2 },
  ],
};

const PLATFORM_DIMENSIONS: Record<string, { width: number; height: number }> = {
  instagram_reels: { width: 1080, height: 1920 },
  youtube_shorts: { width: 1080, height: 1920 },
  instagram_square: { width: 1080, height: 1080 },
  tiktok: { width: 1080, height: 1920 },
};

export const RemotionRoot: React.FC = () => {
  const dims = PLATFORM_DIMENSIONS[DEFAULT_PROPS.platform] || { width: 1080, height: 1920 };

  return (
    <Composition
      id="AdVideo"
      component={AdVideo}
      durationInFrames={DEFAULT_PROPS.duration * 30}
      fps={30}
      width={dims.width}
      height={dims.height}
      defaultProps={DEFAULT_PROPS}
      schema={AdVideoSchema}
    />
  );
};
