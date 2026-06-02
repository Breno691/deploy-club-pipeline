// AutomationDiscoveryAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const { discoverCandidatesLocally } = require('../discovery/discoverAutomationCandidates');
const { detectAutomationSignals } = require('../scoring/automationScore');

const client = new Anthropic();

function buildLocalDiscoveryReport(area) {
  const discovery = discoverCandidatesLocally(area);
  const top3 = discovery.top_5.slice(0, 3);

  const lines = [
    `# Automation Discovery Report — ${discovery.area_filter}`,
    `Data: ${discovery.discovery_date}`,
    `Candidatos identificados: ${discovery.total_candidates}`,
    '',
    '## Top Oportunidades',
    ...top3.map((c, i) => [
      `### ${i + 1}. ${c.name}`,
      `Score: ${c.automation_score}/100 (${c.classification.label})`,
      `Área: ${c.area} | Frequência: ${c.frequency}`,
      `Tempo manual: ${c.time_per_execution}h × ${c.monthly_volume}x/mês = ${c.roi.hours_saved_month}h liberadas`,
      `ROI: R$ ${c.roi.net_monthly_savings.toLocaleString('pt-BR')}/mês | Payback: ${c.roi.payback_months} meses`,
      `Dor: ${c.pain}`,
      `WhatsApp Bot: ${c.whatsapp_bot_needed ? 'Sim' : 'Não'} | IA necessária: ${c.ai_needed ? 'Sim' : 'Não'}`,
      '',
    ].join('\n')),
    '## Resumo do Portfolio',
    `Horas liberadas/mês: ${discovery.portfolio_summary.total_hours_saved_month}h`,
    `Economia mensal total: R$ ${discovery.portfolio_summary.total_monthly_savings.toLocaleString('pt-BR')}`,
    `Economia anual total: R$ ${discovery.portfolio_summary.total_annual_savings.toLocaleString('pt-BR')}`,
  ];

  return { report: lines.join('\n'), discovery };
}

async function discoverAutomationsWithClaude(area, context = '') {
  const localData = discoverCandidatesLocally(area);
  const signals = detectAutomationSignals(context);

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Automation Discovery Agent da SmartOps IA — Diretor de Automação Inteligente.

Missão: Descobrir e priorizar oportunidades de automação com IA, n8n e bots WhatsApp que eliminem trabalho manual, retrabalho e gerem ROI para a SmartOps e seus clientes PME.

REGRA PRINCIPAL: Não automatizar bagunça. Primeiro mapear → simplificar → padronizar → ENTÃO automatizar.

## CONTEXTO ATUAL
Empresa: SmartOps IA — consultoria Lean + Automação IA, BH
Consultor: Breno Luiz — Black Belt Lean Six Sigma
Área de análise: ${area || 'todas as áreas'}
Contexto adicional: ${context || 'análise semanal de rotina'}

## CANDIDATOS JÁ IDENTIFICADOS LOCALMENTE (TOP 5):
${localData.top_5.map((c, i) =>
  `${i + 1}. ${c.name} — Score: ${c.automation_score}/100 — ROI: R$ ${c.roi?.net_monthly_savings || 0}/mês`
).join('\n')}

## SINAIS DETECTADOS NO CONTEXTO:
${signals.signal_count > 0 ? signals.signals_found.join(', ') : 'Nenhum sinal específico detectado'}

---

Analise e responda no formato:

# AUTOMATION DISCOVERY REPORT — ${area?.toUpperCase() || 'GERAL'}

## DIAGNÓSTICO RÁPIDO
[2-3 frases sobre o estado atual das automações]

## OPORTUNIDADES IDENTIFICADAS (TOP 5)
[Para cada uma: nome, processo, dor, score, ROI estimado, ferramenta recomendada, prioridade]

## OPORTUNIDADES PARA CLIENTES PME
[3-5 automações vendáveis baseadas nos setores atendidos]

## PRÓXIMAS 3 AÇÕES
[O que fazer esta semana para avançar]

## ROI CONSOLIDADO
[Impacto total se implementar o top 5]

PRIORIDADE: [Alta/Média/Baixa]
ESFORÇO: [Baixo/Médio/Alto]
ROI ESPERADO: [R$ X/mês]
PRÓXIMO PASSO: [ação concreta]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { discoverAutomationsWithClaude, buildLocalDiscoveryReport };
