// LocalBusinessTemplate.tsx — SmartOps IA
// Conexão local BH/MG — falar diretamente com quem está na cidade

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { colors, typography, spacing, brand } from '../brand/brandTokens';
import { VideoProject } from '../data/video.schema';
import { AdVideoComposition } from '../compositions/AdVideoComposition';

export function buildLocalBusinessProject(overrides?: Partial<VideoProject>): VideoProject {
  return {
    videoId:     'local-bh-servicos-001',
    title:       'Para empresas de serviços aqui em BH',
    format:      'instagram_reel',
    aspectRatio: '9:16',
    duration:    35,
    fps:         30,
    objective:   'lead_generation',
    audience:    'Donos de empresas de serviços em BH/RMBH',
    theme:       'local-business-bh',
    template:    'LocalBusiness',
    cta: {
      type:    'diagnostic',
      text:    'Agende um diagnóstico presencial em BH',
      url:     'https://smartops-ia.com.br/diagnostico',
      subtext: '30 min · presencial BH/MG · sem custo',
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
        headline:    'Aqui em BH, eu vejo muito isso nas empresas de serviços.',
        subheadline: 'E tem solução.',
        animation:   'kinetic-impact',
        visual:      'dark-gradient',
      },
      {
        id:        'scene_2',
        type:      'problem',
        duration:  6,
        headline:  'O processo funciona até crescer.',
        body:      'Aí começa o caos. Porque nada foi documentado.',
        bullets:   [
          'Tudo na cabeça do dono',
          'Equipe perdida quando o dono some',
          'Qualidade variando de cliente pra cliente',
        ],
        animation: 'slide-up',
      },
      {
        id:      'scene_3',
        type:    'data',
        duration: 8,
        headline: 'O que muda com processo estruturado:',
        metrics: [
          { label: 'Dependência do dono', value: '-60%', unit: 'em 90 dias' },
          { label: 'Qualidade do serviço', value: '+40%', unit: 'consistência' },
          { label: 'Capacidade de crescimento', value: '3x', unit: 'sem contratar' },
        ],
        animation: 'counter',
      },
      {
        id:        'scene_4',
        type:      'solution',
        duration:  10,
        headline:  'SmartOps IA. Aqui em BH, presencial.',
        body:      'Lean + Automação adaptado à sua realidade.',
        bullets:   [
          'Diagnóstico presencial na sua empresa',
          'Processos documentados e treinados',
          'Automações simples com n8n e IA',
        ],
        animation: 'process-flow',
      },
      {
        id:          'scene_5',
        type:        'cta',
        duration:    7,
        headline:    'Diagnóstico gratuito. Presencial. BH/MG.',
        subheadline: '30 min · sem compromisso · Black Belt',
        animation:   'cta-pulse',
        visual:      'glow-accent',
      },
    ],
    ...overrides,
  };
}

export const LocalBusinessTemplate: React.FC<{ project: VideoProject }> = ({ project }) => {
  return <AdVideoComposition project={project} />;
};
