// SixSigmaTemplate.tsx — SmartOps IA
// DMAIC, qualidade e redução de defeitos — autoridade técnica

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { colors, typography, spacing, brand } from '../brand/brandTokens';
import { VideoProject } from '../data/video.schema';
import { AdVideoComposition } from '../compositions/AdVideoComposition';

export function buildSixSigmaProject(overrides?: Partial<VideoProject>): VideoProject {
  return {
    videoId:     'six-sigma-dmaic-001',
    title:       'DMAIC: o método que elimina defeitos de vez',
    format:      'instagram_reel',
    aspectRatio: '9:16',
    duration:    40,
    fps:         30,
    objective:   'authority',
    audience:    'Gestores e donos de PME com interesse em qualidade — BH/MG',
    theme:       'six-sigma-dmaic',
    template:    'SixSigma',
    cta: {
      type:    'diagnostic',
      text:    'Agende um diagnóstico gratuito',
      url:     'https://smartops-ia.com.br/diagnostico',
      subtext: '30 min · Black Belt Lean Six Sigma · BH/MG',
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
        headline:    'Cada defeito na sua operação custa em média R$800.',
        subheadline: 'Six Sigma elimina a causa raiz.',
        animation:   'kinetic-impact',
        visual:      'dark-gradient',
      },
      {
        id:        'scene_2',
        type:      'problem',
        duration:  6,
        headline:  'O defeito aparece. E volta. E volta de novo.',
        body:      'Porque você trata o sintoma, não a causa raiz.',
        bullets:   [
          'Erros que se repetem todo mês',
          'Cliente insatisfeito com variação de qualidade',
          'Equipe cansada de corrigir o que deveria estar certo',
        ],
        animation: 'slide-up',
      },
      {
        id:      'scene_3',
        type:    'data',
        duration: 8,
        headline: 'O custo da má qualidade nas PMEs:',
        metrics: [
          { label: 'Custo médio por defeito', value: 'R$800', unit: 'por ocorrência' },
          { label: 'Retrabalho evitável', value: '70%', unit: 'dos defeitos' },
          { label: 'Meta Six Sigma', value: '3.4', unit: 'defeitos/milhão' },
        ],
        animation: 'counter',
      },
      {
        id:        'scene_4',
        type:      'process',
        duration:  14,
        headline:  'DMAIC: 5 passos para eliminar o defeito de vez.',
        bullets:   [
          'D — Define: qual o problema e o impacto?',
          'M — Measure: quantificar com dados reais',
          'A — Analyze: identificar a causa raiz',
          'I — Improve: solução testada e validada',
          'C — Control: garantir que não volta',
        ],
        animation: 'process-flow',
      },
      {
        id:          'scene_5',
        type:        'cta',
        duration:    8,
        headline:    'Quer aplicar o DMAIC na sua operação?',
        subheadline: 'Diagnóstico gratuito · Black Belt · BH/MG',
        animation:   'cta-pulse',
        visual:      'glow-accent',
      },
    ],
    ...overrides,
  };
}

export const SixSigmaTemplate: React.FC<{ project: VideoProject }> = ({ project }) => {
  return <AdVideoComposition project={project} />;
};
