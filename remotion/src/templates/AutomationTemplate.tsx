import React from 'react';
import type { VideoProject } from '../data/video.schema';
import { AdVideoComposition } from '../compositions/AdVideoComposition';

export function buildAutomationProject(overrides?: Partial<VideoProject>): VideoProject {
  return {
    videoId:     overrides?.videoId     ?? 'automation-auto',
    title:       overrides?.title       ?? 'Automação com IA — Elimine Trabalho Manual',
    format:      overrides?.format      ?? 'instagram_reel',
    aspectRatio: overrides?.aspectRatio ?? '9:16',
    duration:    overrides?.duration    ?? 30,
    fps:         overrides?.fps         ?? 30,
    objective:   overrides?.objective   ?? 'lead_generation',
    audience:    overrides?.audience    ?? 'Donos de PMEs em BH/MG',
    theme:       overrides?.theme       ?? 'automação',
    template:    'Automation',
    cta: overrides?.cta ?? {
      type:    'diagnostic',
      text:    'Quero automatizar minha empresa',
      subtext: 'Diagnóstico gratuito · SmartOps IA',
    },
    brand: overrides?.brand ?? {
      primaryColor:    '#10B981',
      accentColor:     '#7C3AED',
      backgroundColor: '#0A0A0F',
    },
    scenes: overrides?.scenes ?? [
      {
        id:          'hook',
        type:        'hook',
        duration:    4,
        headline:    'Você ainda faz isso manualmente?',
        subheadline: 'Existe uma forma mais inteligente.',
        animation:   'kinetic-impact',
      },
      {
        id:       'problem',
        type:     'problem',
        duration: 5,
        headline: 'Cada tarefa manual é um risco.',
        body:     'Erro humano. Tempo perdido. Escala impossível.',
        bullets:  [
          'Planilhas feitas à mão',
          'WhatsApp para tudo',
          'Relatórios manuais toda semana',
        ],
      },
      {
        id:       'data',
        type:     'data',
        duration: 7,
        headline: 'O impacto é maior do que parece.',
        metrics:  [
          { label: 'Horas gastas', value: '12h', unit: '/semana' },
          { label: 'Custo oculto', value: 'R$3k', unit: '/mês' },
          { label: 'Erros evitáveis', value: '80%', unit: 'dos casos' },
        ],
        animation: 'counter',
      },
      {
        id:       'solution',
        type:     'solution',
        duration: 8,
        headline: 'Automatize em 4 semanas com n8n + IA.',
        bullets:  [
          'Fluxos automáticos 24/7',
          'Integração CRM + WhatsApp + relatórios',
          'Zero código. Zero retrabalho.',
        ],
        animation: 'process-flow',
      },
      {
        id:          'cta',
        type:        'cta',
        duration:    6,
        headline:    'Pronto para eliminar o trabalho manual?',
        subheadline: 'Diagnóstico gratuito de 30 min.',
        animation:   'cta-pulse',
      },
    ],
  };
}

interface Props {
  theme?:    string;
  audience?: string;
}

export const AutomationTemplate: React.FC<Props> = ({ theme, audience }) => {
  const project = buildAutomationProject({ theme, audience });
  return <AdVideoComposition project={project} />;
};
