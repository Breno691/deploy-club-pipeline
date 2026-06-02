// VideoAdTemplate.tsx — SmartOps IA
// Criativo para Meta Ads e Google Ads — máxima conversão em 30s

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { colors, typography, spacing, brand } from '../brand/brandTokens';
import { VideoProject } from '../data/video.schema';
import { AdVideoComposition } from '../compositions/AdVideoComposition';

export function buildVideoAdProject(overrides?: Partial<VideoProject>): VideoProject {
  return {
    videoId:     'video-ad-dor-001',
    title:       'Seu processo está te custando R$20k por mês',
    format:      'meta_ad',
    aspectRatio: '1:1',
    duration:    30,
    fps:         30,
    objective:   'conversion',
    audience:    'Donos de PME 30-55 anos, BH/MG, empresa 10-100 funcionários',
    theme:       'video-ad-dor',
    template:    'VideoAd',
    cta: {
      type:    'whatsapp',
      text:    'Fale com um especialista agora',
      url:     'https://wa.me/5531999999999',
      subtext: 'Resposta em até 2h · BH/MG',
    },
    brand: {
      style:           'premium-tech-consulting',
      primaryColor:    colors.primary,
      accentColor:     colors.accent,
      backgroundColor: colors.background,
    },
    scenes: [
      {
        id:          'scene_1',
        type:        'hook',
        duration:    3,
        headline:    'Seu processo está te custando R$20k por mês.',
        subheadline: 'E você provavelmente não sabe disso.',
        animation:   'kinetic-impact',
        visual:      'dark-gradient',
      },
      {
        id:        'scene_2',
        type:      'pain',
        duration:  5,
        headline:  'Reconhece isso?',
        bullets:   [
          'Retrabalho constante na equipe',
          'Processos que dependem de 1 pessoa',
          'Crescimento travando por falta de estrutura',
        ],
        animation: 'slide-up',
      },
      {
        id:        'scene_3',
        type:      'solution',
        duration:  8,
        headline:  'SmartOps IA resolve em 90 dias.',
        body:      'Lean + Automação + IA para PMEs em BH.',
        bullets:   [
          'Diagnóstico em 2 semanas',
          'Processos padronizados e automatizados',
          'ROI documentado e garantido',
        ],
        animation: 'process-flow',
      },
      {
        id:      'scene_4',
        type:    'data',
        duration: 8,
        headline: 'Resultado médio dos clientes:',
        metrics: [
          { label: 'Redução de retrabalho', value: '-35%' },
          { label: 'Horas economizadas', value: '40h/mês' },
          { label: 'ROI médio', value: '3.8x' },
        ],
        animation: 'counter',
      },
      {
        id:          'scene_5',
        type:        'cta',
        duration:    6,
        headline:    'Diagnóstico gratuito.',
        subheadline: '30 min · presencial BH/MG · Black Belt',
        animation:   'cta-pulse',
        visual:      'glow-accent',
      },
    ],
    ...overrides,
  };
}

export const VideoAdTemplate: React.FC<{ project: VideoProject }> = ({ project }) => {
  return <AdVideoComposition project={project} />;
};
