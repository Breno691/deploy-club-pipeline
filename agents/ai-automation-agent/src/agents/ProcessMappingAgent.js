// ProcessMappingAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

function buildLocalProcessMap(processData = {}) {
  const {
    name = 'Processo não nomeado',
    trigger = 'Não definido',
    steps = [],
    tools = [],
    people = [],
    time_minutes = 0,
    frequency = 'semanal',
    pain_points = [],
  } = processData;

  const monthly_hours = (time_minutes / 60) * (
    frequency === 'diaria' ? 22 : frequency === 'semanal' ? 4 : frequency === '3x_semana' ? 12 : 1
  );

  const automatable_steps = steps.filter(s =>
    /repetitiv|copiar|colar|preencher|enviar mesmo|salvar|registrar/i.test(s)
  );
  const automation_pct = steps.length ? Math.round((automatable_steps.length / steps.length) * 100) : 0;

  return {
    process_name:        name,
    trigger,
    steps,
    tools_used:          tools,
    people_involved:     people,
    time_per_execution:  `${time_minutes} min`,
    monthly_hours:       Math.round(monthly_hours * 10) / 10,
    pain_points,
    automatable_steps,
    automation_potential_pct: automation_pct,
    recommendation: automation_pct >= 60 ? 'Alto potencial de automação'
      : automation_pct >= 30 ? 'Potencial médio — simplificar antes'
      : 'Baixo potencial — melhorar processo primeiro',
    mapped_at: new Date().toISOString(),
  };
}

async function mapProcessWithClaude(processDescription, area = 'geral') {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Process Mapping Agent da SmartOps IA.

Missão: Mapear o processo ANTES de propor qualquer automação. Processo mal mapeado = automação inútil.

Processo descrito: "${processDescription}"
Área: ${area}

Regra: Não automatizar bagunça. Primeiro: mapear → simplificar → padronizar → automatizar.

Analise e documente no formato:

# MAPEAMENTO DE PROCESSO

## PROCESSO ATUAL (AS-IS)
TRIGGER: [o que inicia o processo]
ENTRADAS: [dados/informações necessárias]
RESPONSÁVEL: [quem executa]
FERRAMENTAS ATUAIS: [sistemas usados]

## ETAPAS (passo a passo)
1. [etapa]
2. [etapa]
[marque com 🤖 as etapas automatizáveis]
[marque com ❌ as etapas com problema/gargalo]
[marque com ⚠️ as etapas propensas a erro]

## DECISÕES NO PROCESSO
[pontos onde há decisão humana]

## EXCEÇÕES CONHECIDAS
[casos especiais, erros comuns]

## DADOS DE SAÍDA
[o que o processo produz]

## ANÁLISE DE DESPERDÍCIO (LEAN)
- Espera: [sim/não — descrição]
- Retrabalho: [sim/não — descrição]
- Movimento: [sim/não — descrição]
- Transporte: [sim/não — descrição]
- Processamento desnecessário: [sim/não — descrição]

## PROCESSO FUTURO (TO-BE)
[versão simplificada e otimizada ANTES de automatizar]

## POTENCIAL DE AUTOMAÇÃO
Etapas automatizáveis: X de Y
Potencial: [Alto/Médio/Baixo]

## PRÉ-REQUISITOS PARA AUTOMATIZAR
[o que precisa estar resolvido antes]

## RECOMENDAÇÃO
[automatizar agora / simplificar antes / não automatizar — com justificativa]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { mapProcessWithClaude, buildLocalProcessMap };
