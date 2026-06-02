// VSMAgent.js — Value Stream Mapping: mapeia o fluxo de valor atual e futuro
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const { calcLeadTime } = require('../calculations/leanCalculators');

const client = new Anthropic();

async function createVSMWithClaude(processDescription, sector = 'servicos') {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Lean Agent da SmartOps IA — especialista em Value Stream Mapping.

Consultor: Breno Luiz — Black Belt Lean Six Sigma
Processo: "${processDescription}"
Setor: ${sector}

Crie o VSM completo:

# VALUE STREAM MAP (VSM)

## ESTADO ATUAL (Current State)

### Fluxo do Processo
Para cada etapa:
| Etapa | Tempo (min) | Agrega Valor? | Operador | Ferramenta | Problema |
|---|---|---|---|---|---|
[preencher]

### Métricas do Estado Atual
- Lead Time Total: [X] dias/horas
- Tempo de Valor Agregado: [X] min/horas
- Eficiência do Fluxo: [X]%
- Número de etapas sem valor: [X]
- Principal gargalo: [etapa]
- Maior espera: [entre qual etapa]

### Desperdícios Mapeados no Fluxo
[Lista com localização no fluxo]

## ESTADO FUTURO (Future State)

### Melhorias Propostas
Para cada melhoria:
ETAPA: [onde aplicar]
MUDANÇA: [o que fazer]
DESPERDÍCIO ELIMINADO: [qual dos 8]
GANHO ESTIMADO: [tempo ou custo]
ESFORÇO: [horas de implementação]

### Fluxo Futuro Otimizado
| Etapa | Tempo Novo | Redução | Como |
[preencher]

### Métricas do Estado Futuro
- Novo Lead Time: [X] (redução de Y%)
- Nova Eficiência: [X]%
- Etapas eliminadas: [N]
- Economia mensal: R$ [X]

## PLANO DE IMPLEMENTAÇÃO
[4 fases, da mais fácil à mais complexa]

Fase 1 (semana 1-2): [quick wins]
Fase 2 (semana 3-4): [melhorias médias]
Fase 3 (mês 2): [mudanças estruturais]
Fase 4 (mês 3): [otimização final]

## ROI DO VSM
Investimento (horas de consultoria): [H × R$ 150/h]
Economia mensal esperada: R$ [X]
Payback: [N] meses`,
    }],
  });

  return response.content[0].text;
}

module.exports = { createVSMWithClaude };
