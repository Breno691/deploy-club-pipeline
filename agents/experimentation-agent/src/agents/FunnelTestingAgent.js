// FunnelTestingAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

function analyzeFunnelLocally(funnelData = {}) {
  const {
    visitors    = 0,
    leads       = 0,
    meetings    = 0,
    proposals   = 0,
    closed      = 0,
    revenue_brl = 0,
  } = funnelData;

  const steps = [
    { from: 'Visitante', to: 'Lead',      n_from: visitors, n_to: leads     },
    { from: 'Lead',      to: 'Reunião',   n_from: leads,    n_to: meetings  },
    { from: 'Reunião',   to: 'Proposta',  n_from: meetings, n_to: proposals },
    { from: 'Proposta',  to: 'Venda',     n_from: proposals,n_to: closed    },
  ];

  const analyzed = steps.map(s => ({
    ...s,
    rate:       s.n_from > 0 ? Math.round((s.n_to / s.n_from) * 1000) / 10 : 0,
    lost:       s.n_from - s.n_to,
    bottleneck: false,
  }));

  // Identifica maior gargalo (pior taxa)
  const minRate = Math.min(...analyzed.filter(s => s.n_from > 0).map(s => s.rate));
  analyzed.forEach(s => { s.bottleneck = s.rate === minRate && s.n_from > 0; });

  const cac    = leads > 0 ? Math.round(revenue_brl / (closed || 1) * 0.2) : 0;
  const ltv    = revenue_brl > 0 ? Math.round((revenue_brl / (closed || 1)) * 2.5) : 0;

  return {
    funnel:   analyzed,
    summary:  { visitors, leads, meetings, proposals, closed, revenue_brl },
    cac,
    ltv,
    ltv_cac:  cac > 0 ? Math.round((ltv / cac) * 10) / 10 : 0,
    bottleneck: analyzed.find(s => s.bottleneck),
    analyzed_at: new Date().toISOString(),
  };
}

async function analyzeFunnelWithClaude(funnelData) {
  const local = analyzeFunnelLocally(funnelData);

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Funnel Testing Agent da SmartOps IA.

Missão: Identificar gargalos no funil, criar hipóteses e testes para melhorar cada etapa.

DADOS DO FUNIL:
${local.funnel.map(s => `${s.from} → ${s.to}: ${s.n_from} → ${s.n_to} (${s.rate}% conversão)${s.bottleneck ? ' ← GARGALO' : ''}`).join('\n')}

Métricas:
- LTV/CAC: ${local.ltv_cac}
- Maior gargalo: ${local.bottleneck?.from} → ${local.bottleneck?.to} (${local.bottleneck?.rate}%)

Metas de crescimento: ${JSON.stringify(CONFIG.growth_targets)}

---

Analise:

# FUNNEL ANALYSIS REPORT

## VISUALIZAÇÃO DO FUNIL
[Mostrar funil com taxas e perdas em cada etapa]

## GARGALO PRINCIPAL
[A etapa com maior perda + causa provável]

## TESTES PARA CADA GARGALO
Para o gargalo #1, #2 e #3:
ETAPA: [do → para]
TAXA ATUAL: [%]
META: [%]
HIPÓTESE: [o que está causando a perda]
TESTE: [o que mudar]
UPLIFT ESPERADO: [%]
IMPACTO NO REVENUE: [estimativa]

## AÇÕES IMEDIATAS
[O que fazer essa semana para melhorar o funil]

## PROJEÇÃO COM MELHORIAS
[Se corrigir os 3 principais gargalos, o que acontece com receita]`,
    }],
  });

  return { analysis: response.content[0].text, data: local };
}

module.exports = { analyzeFunnelWithClaude, analyzeFunnelLocally };
