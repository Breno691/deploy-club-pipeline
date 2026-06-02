#!/usr/bin/env node
/**
 * Revenue Intelligence Agent — SmartOps IA
 * Atribuição de receita, funil digital, canais e growth finance
 *
 * Usage:
 *   node revenue_intelligence_agent.js --mode funnel
 *   node revenue_intelligence_agent.js --mode attribution --canal google-ads
 *   node revenue_intelligence_agent.js --mode channel
 *   node revenue_intelligence_agent.js --mode forecast --mrr-atual 5000
 *   node revenue_intelligence_agent.js --mode alert
 *   node revenue_intelligence_agent.js --mode dashboard
 *   node revenue_intelligence_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG, CHANNELS, FUNNEL_STAGES } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }

function calcFunnelMetrics(impressoes, cliques, leads, qual_leads, reunioes, propostas, clientes) {
  return {
    ctr:          ((cliques / impressoes) * 100).toFixed(2) + '%',
    cpl:          leads > 0 ? 'R$?' : 'N/A',
    lead_rate:    ((leads / cliques) * 100).toFixed(1) + '%',
    qual_rate:    ((qual_leads / leads) * 100).toFixed(1) + '%',
    meeting_rate: ((reunioes / qual_leads) * 100).toFixed(1) + '%',
    prop_rate:    ((propostas / reunioes) * 100).toFixed(1) + '%',
    close_rate:   ((clientes / propostas) * 100).toFixed(1) + '%',
    overall_conv: ((clientes / leads) * 100).toFixed(2) + '%',
  };
}

function checkAlerts(data) {
  const alerts = [];
  if (data.cac > CONFIG.alerts.cac_high) alerts.push({ tipo: 'CAC_ALTO', valor: `R$${data.cac}`, threshold: `R$${CONFIG.alerts.cac_high}`, urgencia: 'ALTA' });
  if (data.roas < CONFIG.alerts.roas_low) alerts.push({ tipo: 'ROAS_BAIXO', valor: data.roas, threshold: CONFIG.alerts.roas_low, urgencia: 'ALTA' });
  if (data.cpl > CONFIG.alerts.cpl_high) alerts.push({ tipo: 'CPL_ALTO', valor: `R$${data.cpl}`, threshold: `R$${CONFIG.alerts.cpl_high}`, urgencia: 'MEDIA' });
  if (data.margin < CONFIG.alerts.margin_low) alerts.push({ tipo: 'MARGEM_BAIXA', valor: `${data.margin}%`, threshold: `${CONFIG.alerts.margin_low}%`, urgencia: 'ALTA' });
  return alerts;
}

function calcChannelScore(cpl, conv_rate, ticket = CONFIG.company.ticketMin) {
  const cac = cpl / conv_rate;
  const ltv_cac = (CONFIG.company.ltvTarget / cac).toFixed(1);
  const scoreConf = CONFIG.channelScore;
  const pct = Math.min(100, Math.max(0, (CONFIG.targets.cac / cac) * 100 * (conv_rate / 0.1)));
  const status = pct >= scoreConf.scale.min ? scoreConf.scale : pct >= scoreConf.maintain.min ? scoreConf.maintain : pct >= scoreConf.monitor.min ? scoreConf.monitor : scoreConf.cut;
  return { cac: Math.round(cac), ltv_cac, score: Math.round(pct), ...status };
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir = path.join(__dirname, 'outputs', `rev_intel_${date}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return { dir, date };
}
function save(dir, fn, c) { const p = path.join(dir, fn); fs.writeFileSync(p, typeof c === 'string' ? c : JSON.stringify(c, null, 2), 'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r = await client.messages.create({ model: CONFIG.claude.model, max_tokens: CONFIG.claude.maxTokens, messages: [{ role: 'user', content: prompt }] }); return r.content[0].text; }

const BASE = `Você é o Revenue Intelligence Agent da SmartOps IA — diretor de receita digital e growth finance.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH/MG.
Meta: R$${CONFIG.targets.mrr.toLocaleString('pt-BR')} MRR | CAC máx R$${CONFIG.targets.cac} | LTV/CAC mín ${CONFIG.targets.ltv_cac}x | Margem mín ${CONFIG.targets.margin}%

FUNIL: ${FUNNEL_STAGES.join(' → ')}
CANAIS: ${CHANNELS.join(', ')}

ALERTAS:
- CAC > R$${CONFIG.alerts.cac_high}: CRÍTICO
- ROAS < ${CONFIG.alerts.roas_low}: CRÍTICO
- CPL > R$${CONFIG.alerts.cpl_high}: ATENÇÃO
- Margem < ${CONFIG.alerts.margin_low}%: CRÍTICO

DECISÕES DE CANAL:
Score ≥${CONFIG.channelScore.scale.min}: ${CONFIG.channelScore.scale.action}
Score ≥${CONFIG.channelScore.maintain.min}: ${CONFIG.channelScore.maintain.action}
Score <${CONFIG.channelScore.monitor.min}: ${CONFIG.channelScore.cut.action}`;

async function main() {
  const mode = getArg('mode', 'report');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  REVENUE INTELLIGENCE AGENT — SmartOps IA       ║');
  console.log('║  "Receita sem atribuição é sorte, não estratégia"║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();

  try {
    switch (mode) {

      case 'funnel': {
        const imp = parseInt(getArg('impressoes', '10000'));
        const cliques = parseInt(getArg('cliques', '300'));
        const leads = parseInt(getArg('leads', '30'));
        const ql = parseInt(getArg('qual-leads', '15'));
        const reunioes = parseInt(getArg('reunioes', '8'));
        const propostas = parseInt(getArg('propostas', '5'));
        const clientes = parseInt(getArg('clientes', '1'));
        const metrics = calcFunnelMetrics(imp, cliques, leads, ql, reunioes, propostas, clientes);
        console.log('\n📊 Métricas do Funil (calculadas localmente):');
        Object.entries(metrics).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
        const result = await ask(`${BASE}

FUNIL ATUAL:
Impressões: ${imp} | Cliques: ${cliques} | Leads: ${leads} | Qualificados: ${ql}
Reuniões: ${reunioes} | Propostas: ${propostas} | Clientes: ${clientes}
Métricas: ${JSON.stringify(metrics)}

# Análise do Funil

## Diagnóstico por Etapa
${FUNNEL_STAGES.map(s => `### ${s}: [taxa + diagnóstico + benchmark]`).join('\n')}

## Maior Oportunidade (onde otimizar primeiro)
[A etapa com maior gap vs. benchmark — ROI de melhorar]

## Meta de Funil (para R$${CONFIG.targets.mrr.toLocaleString('pt-BR')} MRR)
[Backtracking: quantos clientes → propostas → reuniões → leads → impressões]

## Ações por Etapa
[Ação específica para melhorar cada taxa de conversão]`);
        console.log(result);
        save(dir, `funnel_${date}.md`, result);
        break;
      }

      case 'attribution': {
        const canal = getArg('canal', 'instagram_organic');
        const cpl = parseFloat(getArg('cpl', '80'));
        const conv = parseFloat(getArg('conv', '0.10'));
        const score = calcChannelScore(cpl, conv);
        console.log(`\n📊 ${canal}: CAC R$${score.cac} | LTV/CAC ${score.ltv_cac}x | Score ${score.score} → ${score.label}`);
        console.log(`  Ação: ${score.action}`);
        const result = await ask(`${BASE}

CANAL: ${canal}
CPL: R$${cpl} | Conv Rate: ${(conv*100).toFixed(0)}%
SCORE: ${score.score} → ${score.label} | CAC: R$${score.cac} | LTV/CAC: ${score.ltv_cac}x
AÇÃO RECOMENDADA: ${score.action}

# Atribuição de Receita: ${canal}

## Performance do Canal
[Análise qualitativa do canal para SmartOps no momento]

## ROI do Canal (estimativa 3 meses)
[Investimento × leads × clientes × receita]

## Comparação com Meta
CAC meta: R$${CONFIG.targets.cac} | Atual: R$${score.cac} | Gap: R$${Math.abs(score.cac - CONFIG.targets.cac)}
LTV/CAC meta: ${CONFIG.targets.ltv_cac}x | Atual: ${score.ltv_cac}x

## Otimizações para Melhorar o Score
[3-5 ações específicas para este canal]

## Decisão: ${score.action}
[Justificativa detalhada + próximos passos]`);
        console.log(result);
        save(dir, `attribution_${canal}_${date}.md`, result);
        break;
      }

      case 'channel': {
        console.log('\n📊 Análise de Canais (scores estimados):');
        const channelScores = [
          { canal: 'google_ads_local', cpl: 80, conv: 0.15 },
          { canal: 'meta_ads', cpl: 120, conv: 0.10 },
          { canal: 'instagram_organic', cpl: 20, conv: 0.08 },
          { canal: 'parceiros', cpl: 50, conv: 0.30 },
          { canal: 'indicacoes', cpl: 10, conv: 0.50 },
        ].map(c => ({ ...c, ...calcChannelScore(c.cpl, c.conv) })).sort((a, b) => b.score - a.score);
        channelScores.forEach(c => console.log(`  [${c.score}] ${c.canal}: CAC R$${c.cac} | LTV/CAC ${c.ltv_cac}x → ${c.label}`));
        const result = await ask(`${BASE}

RANKING DE CANAIS (score calculado):
${channelScores.map(c => `- ${c.canal}: score ${c.score} | CAC R$${c.cac} | ${c.label} → ${c.action}`).join('\n')}

# Estratégia Multicanal

## Portfólio de Canais Recomendado
[Como distribuir esforço e budget entre os canais]

## Canal para Ativar Esta Semana
[O próximo canal a testar — com plano de ativação]

## Canal para Pausar/Reduzir
[Se algum está consumindo sem ROI]

## Budget Allocation Mensal
| Canal | % Budget | R$ Budget | Meta Leads |
|-------|---------|---------|-----------|

## KPIs Semanais por Canal
[O que monitorar em cada canal toda segunda]`);
        console.log(result);
        save(dir, `channel_analysis_${date}.md`, result);
        break;
      }

      case 'forecast': {
        const mrr_atual = parseFloat(getArg('mrr-atual', '0'));
        const meta = CONFIG.targets.mrr;
        const gap = meta - mrr_atual;
        const result = await ask(`${BASE}

MRR ATUAL: R$${mrr_atual.toLocaleString('pt-BR')}
MRR META: R$${meta.toLocaleString('pt-BR')}
GAP: R$${gap.toLocaleString('pt-BR')}
TICKET MÍNIMO: R$${CONFIG.company.ticketMin.toLocaleString('pt-BR')}

# Forecast de Receita

## Projeção Conservadora (fechar 1 cliente/mês)
| Mês | Novos Clientes | MRR | ARR |
|-----|--------------|-----|-----|
[Projeção 12 meses]

## Projeção Realista (fechar 2-3 clientes/mês)
[Mesma tabela]

## Projeção Otimista (parceiros + indicação + ads)
[Mesma tabela]

## Quando Atingir R$${meta.toLocaleString('pt-BR')} MRR
[Data estimada por cenário]

## O que Precisa Acontecer Para o Cenário Realista
[3-5 condições necessárias]

## Próxima Alavanca de Receita
[A ação de maior impacto no MRR para os próximos 30 dias]`);
        console.log(result);
        save(dir, `forecast_${date}.md`, result);
        break;
      }

      case 'alert': {
        const cac = parseFloat(getArg('cac', '600'));
        const roas = parseFloat(getArg('roas', '1.8'));
        const cpl = parseFloat(getArg('cpl', '200'));
        const margin = parseFloat(getArg('margin', '55'));
        const alerts = checkAlerts({ cac, roas, cpl, margin });
        console.log('\n🚨 Alertas Detectados:');
        if (alerts.length === 0) { console.log('  ✅ Nenhum alerta. Métricas dentro do esperado.'); }
        else alerts.forEach(a => console.log(`  ${a.urgencia === 'ALTA' ? '🔴' : '🟡'} ${a.tipo}: ${a.valor} (threshold: ${a.threshold})`));
        const result = await ask(`${BASE}

ALERTAS DETECTADOS: ${JSON.stringify(alerts)}
MÉTRICAS: CAC R$${cac} | ROAS ${roas} | CPL R$${cpl} | Margem ${margin}%

# Análise de Alertas

${alerts.map(a => `## 🚨 ${a.tipo} — Urgência: ${a.urgencia}
Valor atual: ${a.valor} | Threshold: ${a.threshold}
Causa provável: [análise]
Impacto financeiro: [R$/mês]
Ação imediata: [o que fazer hoje]
Ação estrutural: [o que resolver na causa raiz]`).join('\n\n')}

## Decisão Para o CEO
[Qual alerta resolver primeiro e como]`);
        console.log(result);
        save(dir, `alerts_${date}.md`, result);
        break;
      }

      case 'roi': {
        const canal = getArg('canal', 'instagram_organic');
        const investimento = parseFloat(getArg('investimento', '500'));
        const result = await ask(`${BASE}

CANAL: ${canal} | INVESTIMENTO MENSAL: R$${investimento.toLocaleString('pt-BR')}

# Análise de ROI: ${canal}

## Projeção de Retorno (3 meses)
| Mês | Leads | Clientes | Receita | ROI |
|-----|-------|---------|--------|-----|

## Break-even
[Em quanto tempo o investimento se paga]

## ROI vs Alternativas
[Comparar com outros canais de mesmo investimento]

## Quando Escalar
[Condições para aumentar investimento em ${canal}]

## Quando Cortar
[Signals de que o canal não está valendo]`);
        console.log(result);
        save(dir, `roi_${canal}_${date}.md`, result);
        break;
      }

      case 'budget': {
        const budget_total = parseFloat(getArg('budget', '3000'));
        const result = await ask(`${BASE}

BUDGET MENSAL DE MARKETING: R$${budget_total.toLocaleString('pt-BR')}

# Alocação de Budget Otimizada

## Distribuição por Canal (baseada em scores e estágio da empresa)
| Canal | % Alocado | R$ | Meta Leads | CPL Alvo |
|-------|---------|---|-----------|---------|

## Regras de Alocação
- Budget mínimo de teste: R$${Math.round(budget_total * 0.1)} por canal novo
- Máximo em 1 canal: ${CONFIG.budget?.maxWeeklyIncreasePercent || 40}% do budget total
- Testar canal por mínimo ${CONFIG.budget?.minTestDays || 14} dias antes de decisão

## Calendário de Revisão
[Quando revisar a alocação — triggers de ajuste]

## Scenario: Budget Dobra
[Para onde vai o budget extra se resultado for bom]

## Cenário Corte de 50%
[O que cortar primeiro e o que manter a todo custo]`);
        console.log(result);
        save(dir, `budget_allocation_${date}.md`, result);
        break;
      }

      case 'dashboard': {
        const result = await ask(`${BASE}

Crie o DASHBOARD DE RECEITA da SmartOps IA:

# Revenue Dashboard — ${date}

## KPIs Principais
| KPI | Meta | Status | Tendência |
|-----|------|--------|----------|
| MRR | R$${CONFIG.targets.mrr.toLocaleString('pt-BR')} | | |
| CAC | R$${CONFIG.targets.cac} | | |
| LTV/CAC | ${CONFIG.targets.ltv_cac}x | | |
| CPL | R$${CONFIG.targets.cpl} | | |
| Margem | ${CONFIG.targets.margin}% | | |
| Payback | ${CONFIG.targets.payback} meses | | |

## Funil Esta Semana
[Leads → Qualificados → Reuniões → Propostas → Clientes]

## Canal Performance
[Top canal da semana + canal com pior desempenho]

## Alertas Ativos
[Qualquer métrica fora do threshold]

## Ação Prioritária
[A 1 ação que mais impacta a receita esta semana]`);
        console.log(result);
        save(dir, `revenue_dashboard_${date}.md`, result);
        break;
      }

      case 'ceo-brief': {
        const result = await ask(`${BASE}

Gere o CEO BRIEF de receita — conciso, orientado a decisão:

# Revenue Brief — CEO SmartOps IA | ${date}

## EM 60 SEGUNDOS
[3 bullets: situação atual, maior problema, ação urgente]

## Número do Dia
MRR atual → meta → gap → o que falta fechar

## Decisão Necessária
[Uma decisão de receita que só o CEO pode tomar]

## O que Está Funcionando
[Não perder de vista o que está certo]

## Risco Esta Semana
[O maior risco para a receita nos próximos 7 dias]`);
        console.log(result);
        save(dir, `ceo_brief_${date}.md`, result);
        break;
      }

      case 'report': {
        const result = await ask(`${BASE}

# Revenue Intelligence Report — Semanal

## Situação da Receita
[MRR atual, tendência, gap para meta]

## Canal Campeão da Semana
[Melhor canal e por quê]

## Alerta Mais Crítico
[A métrica mais preocupante]

## Oportunidade de Receita
[Uma ação que pode gerar receita nos próximos 7 dias]

## Forecast Atualizado
[MRR em 30/60/90 dias — cenário realista]

## Decisão Para o CEO
[Uma decisão de receita com prós e contras]`);
        console.log(result);
        save(dir, `rev_intel_report_${date}.md`, result);
        break;
      }

      default:
        console.log('Modos: funnel | attribution | channel | forecast | alert | roi | budget | dashboard | ceo-brief | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch (e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
