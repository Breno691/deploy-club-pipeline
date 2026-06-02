// DailyBriefAgent.js — Gera o brief diário consolidado de todos os squads
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const { calcPipelineHealth, detectCEOAlerts, calcBusinessHealth } = require('../calculations/ceoCalculators');

const client = new Anthropic();

function buildDailySnapshot(data = {}) {
  const pipeline = calcPipelineHealth(data.pipeline || {});
  const alerts   = detectCEOAlerts(data);
  const health   = calcBusinessHealth(data);
  const date     = new Date().toISOString().split('T')[0];
  const weekday  = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][new Date().getDay()];

  return {
    date, weekday,
    health,
    pipeline,
    alerts,
    kpis: {
      receita_mes:         data.receita_mes         || 0,
      clientes_ativos:     data.clientes_ativos      || 0,
      leads_semana:        data.leads_semana         || 0,
      reunioes_semana:     data.reunioes_semana      || 0,
      propostas_abertas:   data.propostas_abertas    || 0,
      posts_semana:        data.posts_semana         || 0,
      sessoes_site_semana: data.sessoes_site_semana  || 0,
      automacoes_ativas:   data.automacoes_ativas    || 0,
      horas_liberadas:     data.horas_liberadas      || 0,
    },
    squad_reports: data.squad_reports || {},
  };
}

async function generateDailyBriefWithClaude(snapshot) {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o CEO Advisor Agent da SmartOps IA — conselheiro estratégico e decisor central.

CEO: Breno Luiz — Black Belt Lean Six Sigma, fundador
Empresa: SmartOps IA — consultoria Lean + Automação IA para PMEs em BH
Stage: ${CONFIG.company.stage}
Metas: ${CONFIG.goals.clientes_meta} clientes, R$ ${CONFIG.goals.receita_meta_mes.toLocaleString('pt-BR')}/mês

DATA: ${snapshot.date} (${snapshot.weekday})

SAÚDE DO NEGÓCIO: ${snapshot.health.total}/100 — ${snapshot.health.label}

KPIs DO DIA:
- Receita acumulada no mês: R$ ${snapshot.kpis.receita_mes.toLocaleString('pt-BR')} / meta R$ ${CONFIG.goals.receita_meta_mes.toLocaleString('pt-BR')}
- Clientes ativos: ${snapshot.kpis.clientes_ativos} / meta ${CONFIG.goals.clientes_meta}
- Pipeline: R$ ${snapshot.pipeline.valor_total.toLocaleString('pt-BR')} | Leads: ${snapshot.kpis.leads_semana} | Reuniões: ${snapshot.kpis.reunioes_semana}
- Propostas abertas: ${snapshot.kpis.propostas_abertas}
- Posts publicados na semana: ${snapshot.kpis.posts_semana}
- Automações ativas: ${snapshot.kpis.automacoes_ativas} | Horas liberadas/mês: ${snapshot.kpis.horas_liberadas}h

ALERTAS (${snapshot.alerts.total} total — ${snapshot.alerts.color}):
${snapshot.alerts.alerts.map(a => `[${a.urgency}] ${a.data} → ${a.action}`).join('\n') || 'Nenhum alerta crítico'}

PIPELINE STATUS: ${snapshot.pipeline.status}
${snapshot.pipeline.gap_meta > 0 ? `Gap para meta: R$ ${snapshot.pipeline.gap_meta.toLocaleString('pt-BR')}` : 'Meta atingida!'}

---

Gere o Daily CEO Brief:

# DAILY CEO BRIEF — ${snapshot.date} (${snapshot.weekday})

## STATUS GERAL
[Semáforo: 🟢/🟡/🔴] [1 frase sobre o dia]

## SAÚDE DO NEGÓCIO: ${snapshot.health.total}/100
[Pipeline: | Receita: | Clientes: | Automação:]

## TOP 3 DECISÕES DE HOJE
Para cada decisão:
DECISÃO: [o que decidir]
CONTEXTO: [por que importa agora]
OPÇÃO A: [primeira alternativa]
OPÇÃO B: [segunda alternativa]
RECOMENDAÇÃO: [qual escolher e por quê]

## AÇÕES POR HORA (bloco de trabalho)
09h-10h: [ação 1 — a mais impactante para receita]
10h-11h: [ação 2]
14h-15h: [ação 3]
15h-16h: [ação 4]

## ALERTA PRINCIPAL
${snapshot.alerts.criticos.length > 0 ? `[CRÍTICO] ${snapshot.alerts.criticos[0]?.data || 'Pipeline vazio'}` : 'Nenhum alerta crítico'}

## INSIGHT DO DIA
[1 observação estratégica sobre o negócio baseada nos dados]

## META DA SEMANA
[O que precisa acontecer até sexta para considerar a semana bem-sucedida]

## PRÓXIMO PASSO
[A primeira ação nos próximos 30 minutos]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { generateDailyBriefWithClaude, buildDailySnapshot };
