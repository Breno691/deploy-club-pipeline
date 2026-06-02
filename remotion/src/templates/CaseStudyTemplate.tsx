// CaseStudyTemplate.tsx — SmartOps IA
// Antes/depois com ROI documentado — converte por prova social

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { colors, typography, spacing, brand } from '../brand/brandTokens';
import { VideoProject } from '../data/video.schema';
import { AdVideoComposition } from '../compositions/AdVideoComposition';

export function buildCaseStudyProject(overrides?: Partial<VideoProject>): VideoProject {
  return {
    videoId:     'case-study-001',
    title:       'De 35% para 8% de retrabalho em 90 dias',
    format:      'instagram_reel',
    aspectRatio: '9:16',
    duration:    40,
    fps:         30,
    objective:   'authority',
    audience:    'Donos de PMEs em BH/MG',
    theme:       'case-study',
    template:    'CaseStudy',
    cta: {
      type:    'diagnostic',
      text:    'Quero o mesmo resultado na minha empresa',
      url:     'https://smartops-ia.com.br/diagnostico',
      subtext: 'Diagnóstico gratuito · 30 min · BH/MG',
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
        duration:    4,
        headline:    'De 35% para 8% de retrabalho.',
        subheadline: 'Em 90 dias. Com método.',
        animation:   'kinetic-impact',
        visual:      'dark-gradient',
      },
      {
        id:        'scene_2',
        type:      'problem',
        duration:  6,
        headline:  'O problema deles:',
        bullets:   [
          'Retrabalho em quase 1/3 dos pedidos',
          'Equipe sobrecarregada e desmotivada',
          'Cliente insatisfeito com prazo',
        ],
        animation: 'slide-up',
      },
      {
        id:        'scene_3',
        type:      'before_after',
        duration:  10,
        headline:  'O que mudou em 90 dias:',
        before:    '35% de retrabalho',
        after:     '8% — dentro do benchmark',
        result:    'ROI de 412% no investimento',
        animation: 'slide-left',
      },
      {
        id:      'scene_4',
        type:    'case_result',
        duration: 12,
        headline: 'Resultado documentado:',
        metrics: [
          { label: 'Retrabalho', value: '-77%', unit: 'em 90 dias' },
          { label: 'Produtividade', value: '+35%', unit: 'da equipe' },
          { label: 'ROI', value: '412%', unit: 'do investimento' },
        ],
        animation: 'counter',
      },
      {
        id:          'scene_5',
        type:        'cta',
        duration:    8,
        headline:    'Seu processo pode ter o mesmo resultado.',
        subheadline: 'Diagnóstico gratuito · 30 min.',
        animation:   'cta-pulse',
        visual:      'glow-accent',
      },
    ],
    ...overrides,
  };
}

export const CaseStudyTemplate: React.FC<{ project: VideoProject }> = ({ project }) => {
  return <AdVideoComposition project={project} />;
};
