import React from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import type { VideoProject } from '../data/video.schema';
import { AdVideoComposition } from '../compositions/AdVideoComposition';

// Pre-configured project for the "Lean Waste" template
export function buildLeanWasteProject(overrides?: Partial<VideoProject>): VideoProject {
  return {
    videoId:     overrides?.videoId     ?? 'lean-waste-auto',
    title:       overrides?.title       ?? 'Lean Waste — Desperdícios Ocultos',
    format:      overrides?.format      ?? 'instagram_reel',
    aspectRatio: overrides?.aspectRatio ?? '9:16',
    duration:    overrides?.duration    ?? 35,
    fps:         overrides?.fps         ?? 30,
    objective:   overrides?.objective   ?? 'lead_generation',
    audience:    overrides?.audience    ?? 'Donos de PMEs em BH/MG',
    theme:       overrides?.theme       ?? 'retrabalho',
    template:    'LeanWaste',
    cta: overrides?.cta ?? {
      type:    'diagnostic',
      text:    'Agende um diagnóstico gratuito',
      subtext: '30 min · presencial BH/MG · Black Belt',
    },
    brand: overrides?.brand ?? {
      primaryColor:    '#7C3AED',
      accentColor:     '#10B981',
      backgroundColor: '#0A0A0F',
    },
    scenes: overrides?.scenes ?? [
      {
        id:          'hook',
        type:        'hook',
        duration:    4,
        headline:    'Sua empresa está perdendo dinheiro com retrabalho.',
        subheadline: 'E talvez ninguém esteja medindo isso.',
        animation:   'kinetic-impact',
        visual:      'dark-gradient',
      },
      {
        id:       'problem',
        type:     'problem',
        duration: 6,
        headline: 'O problema não é falta de esforço.',
        body:     'É processo mal desenhado.',
        bullets:  [
          'Tarefas refeitas 2, 3, 4 vezes',
          'Erros que voltam sempre',
          'Aprovações que travam tudo',
        ],
        animation: 'slide-up',
      },
      {
        id:       'data',
        type:     'data',
        duration: 8,
        headline: 'Retrabalho consome tempo, margem e energia.',
        metrics:  [
          { label: 'Tempo perdido', value: '30%', unit: 'da semana' },
          { label: 'Custo invisível', value: 'R$47k', unit: '/mês' },
        ],
        animation: 'counter',
      },
      {
        id:       'solution',
        type:     'solution',
        duration: 10,
        headline: 'Com Lean + IA, você encontra os gargalos.',
        body:     'E automatiza o que trava sua operação.',
        bullets:  [
          'Diagnóstico em 4 semanas',
          'Redução de 30% no retrabalho',
          'Processos padronizados e automatizados',
        ],
        animation: 'process-flow',
      },
      {
        id:          'cta',
        type:        'cta',
        duration:    7,
        headline:    'Quer descobrir onde sua empresa perde dinheiro?',
        subheadline: 'Diagnóstico gratuito de 30 min.',
        animation:   'cta-pulse',
        visual:      'glow-accent',
      },
    ],
  };
}

// Standalone component for use in Root.tsx
interface Props {
  theme?:    string;
  audience?: string;
}

export const LeanWasteTemplate: React.FC<Props> = ({ theme, audience }) => {
  const project = buildLeanWasteProject({
    theme:   theme   ?? 'retrabalho',
    audience: audience ?? 'Donos de PMEs em BH/MG',
  });
  return <AdVideoComposition project={project} />;
};
