// AuthorityTemplate.tsx — SmartOps IA
// Construir autoridade do Breno como referência em Lean + IA em BH

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { colors, typography, spacing, brand } from '../brand/brandTokens';
import { VideoProject } from '../data/video.schema';
import { AdVideoComposition } from '../compositions/AdVideoComposition';

export function buildAuthorityProject(overrides?: Partial<VideoProject>): VideoProject {
  return {
    videoId:     'authority-black-belt-001',
    title:       'Black Belt Lean Six Sigma em BH',
    format:      'instagram_reel',
    aspectRatio: '9:16',
    duration:    35,
    fps:         30,
    objective:   'authority',
    audience:    'Donos de PMEs em BH/MG',
    theme:       'authority',
    template:    'Authority',
    cta: {
      type:    'website',
      text:    'Conheça o método OPEX',
      url:     'https://smartops-ia.com.br',
      subtext: 'Lean + Automação + IA · BH/MG',
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
        headline:    'A maioria das PMEs perdendo R$30k/mês.',
        subheadline: 'Ninguém está medindo.',
        animation:   'kinetic-impact',
        visual:      'dark-gradient',
      },
      {
        id:        'scene_2',
        type:      'problem',
        duration:  6,
        headline:  'O problema não é a equipe.',
        body:      'É o processo. E processo sem dado é improviso.',
        bullets:   [
          'Processo no improviso = resultado imprevisível',
          'Sem indicador = sem gestão real',
          'Crescimento sem estrutura = caos',
        ],
        animation: 'slide-up',
      },
      {
        id:        'scene_3',
        type:      'insight',
        duration:  10,
        headline:  'Método OPEX: da organização à expansão.',
        body:      'Organização → Processos → Execução → Expansão',
        bullets:   [
          'Black Belt Lean Six Sigma certificado',
          'Lean + Automação com IA',
          'Casos reais em BH/MG',
        ],
        animation: 'process-flow',
      },
      {
        id:      'scene_4',
        type:    'data',
        duration: 9,
        headline: 'Resultado médio nos projetos:',
        metrics: [
          { label: 'Redução de retrabalho', value: '35%', unit: 'em 90 dias' },
          { label: 'Horas economizadas', value: '40h', unit: 'por mês (automação)' },
          { label: 'ROI médio', value: '3.8x', unit: 'no investimento' },
        ],
        animation: 'counter',
      },
      {
        id:          'scene_5',
        type:        'cta',
        duration:    7,
        headline:    'Quer entender como aplicar na sua empresa?',
        subheadline: 'Conheça o método OPEX.',
        animation:   'cta-pulse',
        visual:      'glow-accent',
      },
    ],
    ...overrides,
  };
}

export const AuthorityTemplate: React.FC<{ project: VideoProject }> = ({ project }) => {
  return <AdVideoComposition project={project} />;
};
