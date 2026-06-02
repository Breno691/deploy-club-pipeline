// AutomationReportAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const { discoverCandidatesLocally } = require('../discovery/discoverAutomationCandidates');
const { analyzeROILocally } = require('./ROIAnalysisAgent');

const client = new Anthropic();

function buildLocalAutomationSnapshot(area = null) {
  const discovery = discoverCandidatesLocally(area);
  const withROI = analyzeROILocally(discovery.candidates).automations;

  const by_status = {
    automatizar_agora: withROI.filter(a => a.automation_score >= 85),
    poc:               withROI.filter(a => a.automation_score >= 70 && a.automation_score < 85),
    melhorar_antes:    withROI.filter(a => a.automation_score >= 50 && a.automation_score < 70),
  };

  return {
    date:         new Date().toISOString().split('T')[0],
    area:         area || 'geral',
    total:        discovery.total_candidates,
    by_status,
    portfolio:    discovery.portfolio_summary,
    top_priority: by_status.automatizar_agora[0] || by_status.poc[0],
    kpis: {
      horas_liberar_mes:      discovery.portfolio_summary.total_hours_saved_month,
      economia_mensal:        discovery.portfolio_summary.total_monthly_savings,
      economia_anual:         discovery.portfolio_summary.total_annual_savings,
      automacoes_ativas:      0,
      workflows_n8n:          0,
      bots_whatsapp:          0,
    },
  };
}

async function generateFullReportWithClaude(snapshot, mode = 'weekly') {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Automation Report Agent da SmartOps IA.

Missão: Gerar relatório completo de automação para tomada de decisão.

Tipo de relatório: ${mode}
Data: ${snapshot.date}
Área: ${snapshot.area}

## DADOS DO SNAPSHOT:
Total de oportunidades: ${snapshot.total}
Automatizar agora: ${snapshot.by_status.automatizar_agora.length}
PoC planejado: ${snapshot.by_status.poc.length}
Melhorar antes: ${snapshot.by_status.melhorar_antes.length}

Maior oportunidade: ${snapshot.top_priority?.name || 'N/A'} (score: ${snapshot.top_priority?.automation_score || 0})

Portfolio potential:
- Horas liberadas/mês: ${snapshot.portfolio.total_hours_saved_month}h
- Economia mensal: R$ ${snapshot.portfolio.total_monthly_savings?.toLocaleString('pt-BR')}
- Economia anual: R$ ${snapshot.portfolio.total_annual_savings?.toLocaleString('pt-BR')}

---

Gere o relatório no formato padrão SmartOps:

TÍTULO: Automation Intelligence Report — ${snapshot.date}
CONTEXTO: SmartOps IA — análise de oportunidades de automação
DADOS ANALISADOS: ${snapshot.total} oportunidades avaliadas

PROBLEMA IDENTIFICADO: [gap atual entre automação e potencial]
EVIDÊNCIA: [dados concretos]
IMPACTO: [custo de não agir]
RECOMENDAÇÃO: [top 3 ações]
AÇÃO SUGERIDA: [o que fazer nesta semana]
PRIORIDADE: Alta
ESFORÇO: Médio
ROI ESPERADO: R$ ${snapshot.portfolio.total_monthly_savings?.toLocaleString('pt-BR')}/mês
RISCO DE NÃO AGIR: [custo de oportunidade anual]
PRAZO: Esta semana
MÉTRICA DE SUCESSO: [como medir]
PRÓXIMO PASSO: [ação concreta e imediata]

---

## DETALHAMENTO: TOP AUTOMAÇÕES

[Para cada automação "automatizar agora": análise completa com ROI, risco e plano]

## CEO AUTOMATION BRIEF

[Resumo executivo em 5 pontos para Breno tomar decisão]`,
    }],
  });

  return response.content[0].text;
}

async function generateCEOBriefWithClaude(snapshot) {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Você é o Automation Report Agent da SmartOps IA gerando um CEO Brief.

CEO: Breno Luiz — fundador SmartOps IA, consultor Lean Six Sigma
Data: ${snapshot.date}

Dados:
- ${snapshot.by_status.automatizar_agora.length} automações prontas para implementar
- ${snapshot.portfolio.total_hours_saved_month}h/mês para liberar
- R$ ${snapshot.portfolio.total_monthly_savings?.toLocaleString('pt-BR')}/mês de potencial

Gere um CEO Brief com exatamente:
1. STATUS: [1 linha sobre onde estamos]
2. OPORTUNIDADE PRINCIPAL: [a automação de maior ROI]
3. DECISÃO NECESSÁRIA: [o que Breno precisa decidir agora]
4. IMPACTO SE AGIR: [em números]
5. IMPACTO SE NÃO AGIR: [em números]
6. PRÓXIMO PASSO: [ação específica em 24h]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { buildLocalAutomationSnapshot, generateFullReportWithClaude, generateCEOBriefWithClaude };
