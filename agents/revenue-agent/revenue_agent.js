#!/usr/bin/env node
/**
 * Revenue Agent — SmartOps IA
 * MRR, ARR, CAC, LTV, churn, forecast e atribuição de receita
 *
 * Usage:
 *   node revenue_agent.js --mode mrr --receita-mes 5000 --clientes-novos 1 --churn 0
 *   node revenue_agent.js --mode cac --spend 800 --clientes-novos 1
 *   node revenue_agent.js --mode ltv --ticket 3500 --meses-retencao 8 --margem 0.80
 *   node revenue_agent.js --mode forecast --mrr 5000 --crescimento-meta 20
 *   node revenue_agent.js --mode attribution
 *   node revenue_agent.js --mode churn --clientes-inicio 3 --cancelamentos 1
 *   node revenue_agent.js --mode dashboard --mrr 5000 --clientes 2 --cac 800 --ltv 28000
 *   node revenue_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }
function parseNum(n, fb = 0)   { return parseFloat(getArg(n, String(fb))); }

// ─── PURE FUNCTIONS ─────────────────────────────────────────────────────────

function calcMRR(receitaMes, clientesNovos, churn) {
  const arr  = receitaMes * 12;
  const mrr_growth = clientesNovos * CONFIG.metas.ticket_medio;
  const mrr_churn  = churn * CONFIG.metas.ticket_medio;
  const net_new    = mrr_growth - mrr_churn;
  return { mrr: receitaMes, arr, mrr_growth, mrr_churn, net_new_mrr: net_new };
}

function calcCAC(totalSpend, clientesNovos) {
  if (!clientesNovos) return { cac: 0, status: 'Sem dados', label: '—' };
  const cac = totalSpend / clientesNovos;
  const label = cac <= CONFIG.benchmarks.cac_max_consultoria ? 'Saudável' : 'Atenção';
  return { cac: +cac.toFixed(2), total_spend: totalSpend, clientes: clientesNovos, label };
}

function calcLTV(ticketMedio, mesesRetencao, margem = 0.80) {
  const ltv    = ticketMedio * mesesRetencao * margem;
  const arr_lt = ticketMedio * 12 * margem;
  return { ltv: +ltv.toFixed(2), ticket_medio: ticketMedio, meses_retencao: mesesRetencao, margem_pct: +(margem*100).toFixed(1), arr_lifetime: +arr_lt.toFixed(2) };
}

function calcLTVCAC(ltv, cac) {
  if (!cac) return { ratio: 0, label: 'Sem CAC', payback_meses: 0 };
  const ratio   = ltv / cac;
  const payback = cac > 0 ? Math.ceil(cac / (CONFIG.metas.ticket_medio * 0.80)) : 0;
  const label   = ratio >= CONFIG.benchmarks.ltv_cac_ratio_ideal ? 'Excelente' : ratio >= CONFIG.benchmarks.ltv_cac_ratio_min ? 'Aceitável' : 'Ruim';
  return { ratio: +ratio.toFixed(2), label, payback_meses: payback };
}

function calcChurnRate(clientesInicio, cancelamentos) {
  if (!clientesInicio) return { churn_rate: 0, nrr: 100 };
  const churn_rate = (cancelamentos / clientesInicio) * 100;
  const label      = churn_rate <= CONFIG.benchmarks.churn_max_mensal_pct ? 'Saudável' : 'Crítico';
  return { churn_rate: +churn_rate.toFixed(1), cancelamentos, clientes_inicio: clientesInicio, label };
}

function buildRevenueTable(metrics) {
  const lines = [
    '┌──────────────────────────────────────────────────────────┐',
    '│  REVENUE DASHBOARD                                       │',
    '├──────────────────────────────────────────────────────────┤',
    `  MRR:          R$ ${(metrics.mrr||0).toLocaleString('pt-BR').padEnd(12)} Meta: R$ ${CONFIG.metas.mrr_90d.toLocaleString('pt-BR')}`,
    `  ARR:          R$ ${((metrics.mrr||0)*12).toLocaleString('pt-BR')}`,
    `  CAC:          R$ ${(metrics.cac||0).toLocaleString('pt-BR').padEnd(12)} Max: R$ ${CONFIG.benchmarks.cac_max_consultoria.toLocaleString('pt-BR')}`,
    `  LTV:          R$ ${(metrics.ltv||0).toLocaleString('pt-BR')}`,
    `  LTV/CAC:      ${metrics.ltv_cac_ratio || '—'}x             Min: ${CONFIG.benchmarks.ltv_cac_ratio_min}x`,
    '└──────────────────────────────────────────────────────────┘',
  ];
  return lines.join('\n');
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `revenue_${date}`);
  ['logs','reports'].forEach(d => { if (!fs.existsSync(path.join(dir,d))) fs.mkdirSync(path.join(dir,d),{recursive:true}); });
  return { dir, date };
}
function save(dir, fn, c) { const p=path.join(dir,fn); fs.writeFileSync(p,typeof c==='string'?c:JSON.stringify(c,null,2),'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r=await client.messages.create({model:CONFIG.claude.model,max_tokens:CONFIG.claude.maxTokens,messages:[{role:'user',content:prompt}]}); return r.content[0].text; }

// ─── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  const mode = getArg('mode', 'dashboard');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  REVENUE AGENT — SmartOps IA                    ║');
  console.log('║  "MRR é o oxigênio. LTV/CAC é a eficiência."   ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();
  const BASE = `Você é o Revenue Agent da SmartOps IA — especialista em métricas de receita.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH, MG.
Meta: R$ ${CONFIG.metas.mrr_90d.toLocaleString('pt-BR')} MRR em 90 dias, R$ ${CONFIG.metas.mrr_12m.toLocaleString('pt-BR')} em 12 meses.
Ticket médio alvo: R$ ${CONFIG.metas.ticket_medio.toLocaleString('pt-BR')}.`;

  try {
    switch (mode) {

      case 'mrr': {
        const receitaMes   = parseNum('receita-mes', 0);
        const clientesNovos = parseNum('clientes-novos', 0);
        const churn        = parseNum('churn', 0);
        const m = calcMRR(receitaMes, clientesNovos, churn);
        console.log(`MRR ANALYSIS — ${date}`);
        console.log(`MRR atual: R$ ${m.mrr.toLocaleString('pt-BR')}`);
        console.log(`ARR: R$ ${m.arr.toLocaleString('pt-BR')}`);
        console.log(`New MRR: +R$ ${m.mrr_growth.toLocaleString('pt-BR')} | Churn MRR: -R$ ${m.mrr_churn.toLocaleString('pt-BR')}`);
        console.log(`Net New MRR: R$ ${m.net_new_mrr.toLocaleString('pt-BR')}\n`);
        save(path.join(dir,'reports'), 'mrr_data.json', m);
        const result = await ask(`${BASE}

DADOS MRR:
${JSON.stringify(m, null, 2)}
Meta 90 dias: R$ ${CONFIG.metas.mrr_90d.toLocaleString('pt-BR')}
Gap para meta: R$ ${(CONFIG.metas.mrr_90d - receitaMes).toLocaleString('pt-BR')}

# MRR INTELLIGENCE REPORT

## STATUS DO MRR
[R$ ${receitaMes.toLocaleString('pt-BR')} — ${Math.round((receitaMes/CONFIG.metas.mrr_90d)*100)}% da meta. Análise de saúde]

## DECOMPOSIÇÃO DO MRR
[New MRR + Expansion MRR - Churn MRR = Net New MRR — o que cada um significa]

## PROJEÇÃO
[Se manter o ritmo atual, quando chegará na meta de R$ ${CONFIG.metas.mrr_90d.toLocaleString('pt-BR')}?]

## ALAVANCAS PARA AUMENTAR MRR
[Top 3 ações de impacto imediato no MRR — com estimativa de ganho]

## RISCO DE CHURN
[Análise do risco de churn e ação preventiva]`);
        console.log(result);
        save(path.join(dir,'reports'), `mrr_report_${date}.md`, result);
        break;
      }

      case 'cac': {
        const spend  = parseNum('spend', 800);
        const clientes = parseNum('clientes-novos', 1);
        const cac    = calcCAC(spend, clientes);
        console.log(`CAC ANALYSIS`);
        console.log(`Spend: R$ ${spend.toLocaleString('pt-BR')} | Clientes: ${clientes}`);
        console.log(`CAC: R$ ${cac.cac.toLocaleString('pt-BR')} — ${cac.label}\n`);
        save(path.join(dir,'reports'), 'cac_data.json', cac);
        const result = await ask(`${BASE}

CAC (Custo de Aquisição de Cliente): R$ ${cac.cac.toLocaleString('pt-BR')}
Total investido: R$ ${spend.toLocaleString('pt-BR')}
Clientes adquiridos: ${clientes}
Benchmark máximo: R$ ${CONFIG.benchmarks.cac_max_consultoria.toLocaleString('pt-BR')}
Status: ${cac.label}

# ANÁLISE DE CAC

## DIAGNÓSTICO
[CAC de R$ ${cac.cac.toLocaleString('pt-BR')} — o que significa para a saúde do negócio]

## BREAKDOWN POR CANAL (estimado)
${CONFIG.channels.map(c => `- ${c.canal}: CAC estimado R$ ${c.custo_mensal > 0 ? Math.round(c.custo_mensal / (c.leads_esperados * c.conversao_pct / 100)).toLocaleString('pt-BR') : '0 (orgânico)'}`).join('\n')}

## ESTRATÉGIA DE REDUÇÃO DE CAC
[Como reduzir o CAC em 30% nos próximos 60 dias]

## CAC vs LTV CHECK
[Com CAC de R$ ${cac.cac.toLocaleString('pt-BR')}, qual LTV mínimo para o negócio ser sustentável?]`);
        console.log(result);
        save(path.join(dir,'reports'), `cac_analysis_${date}.md`, result);
        break;
      }

      case 'ltv': {
        const ticket  = parseNum('ticket', 3500);
        const meses   = parseNum('meses-retencao', 8);
        const margem  = parseNum('margem', 0.80);
        const cac     = parseNum('cac', 800);
        const ltv     = calcLTV(ticket, meses, margem);
        const ratio   = calcLTVCAC(ltv.ltv, cac);
        console.log(`LTV ANALYSIS`);
        console.log(`Ticket: R$ ${ticket.toLocaleString('pt-BR')} | Retenção: ${meses} meses | Margem: ${(margem*100).toFixed(0)}%`);
        console.log(`LTV: R$ ${ltv.ltv.toLocaleString('pt-BR')} | CAC: R$ ${cac.toLocaleString('pt-BR')}`);
        console.log(`LTV/CAC: ${ratio.ratio}x — ${ratio.label} | Payback: ${ratio.payback_meses} meses\n`);
        save(path.join(dir,'reports'), 'ltv_data.json', { ltv, ratio });
        const result = await ask(`${BASE}

LTV: R$ ${ltv.ltv.toLocaleString('pt-BR')} | CAC: R$ ${cac.toLocaleString('pt-BR')} | LTV/CAC: ${ratio.ratio}x (${ratio.label})
Payback: ${ratio.payback_meses} meses | Benchmark mínimo: ${CONFIG.benchmarks.ltv_cac_ratio_min}x

# ANÁLISE LTV/CAC

## SAÚDE DO UNIT ECONOMICS
[${ratio.ratio}x — sustentável, marginal ou insustentável? Por quê?]

## ESTRATÉGIAS PARA AUMENTAR O LTV
[Como aumentar o tempo de retenção e o ticket ao longo do tempo]

## ESTRATÉGIAS PARA REDUZIR O CAC
[Os canais mais eficientes e como investir melhor]

## PROJEÇÃO COM MELHORIA
[Se LTV/CAC subir para ${CONFIG.benchmarks.ltv_cac_ratio_ideal}x, qual o impacto no crescimento sustentável?]

## AÇÃO IMEDIATA
[A coisa mais importante para melhorar o unit economics esta semana]`);
        console.log(result);
        save(path.join(dir,'reports'), `ltv_analysis_${date}.md`, result);
        break;
      }

      case 'forecast': {
        const mrr         = parseNum('mrr', 0);
        const crescimento = parseNum('crescimento-meta', 20);
        const meses       = [1,2,3,6,12];
        const projecao    = meses.map(m => ({ mes: m, mrr_conservador: +(mrr * Math.pow(1 + (crescimento*0.5/100), m)).toFixed(0), mrr_realista: +(mrr * Math.pow(1 + crescimento/100, m)).toFixed(0), mrr_otimista: +(mrr * Math.pow(1 + (crescimento*1.5/100), m)).toFixed(0) }));
        console.log('FORECAST DE MRR\n');
        projecao.forEach(p => console.log(`  Mês ${p.mes}: R$ ${p.mrr_conservador.toLocaleString('pt-BR')} | R$ ${p.mrr_realista.toLocaleString('pt-BR')} | R$ ${p.mrr_otimista.toLocaleString('pt-BR')}`));
        console.log('  (Conservador | Realista | Otimista)\n');
        save(path.join(dir,'reports'), 'forecast_data.json', projecao);
        const result = await ask(`${BASE}

MRR ATUAL: R$ ${mrr.toLocaleString('pt-BR')}
Meta de crescimento mensal: ${crescimento}%

PROJEÇÃO (3 cenários):
${projecao.map(p => `  Mês ${p.mes}: R$ ${p.mrr_conservador.toLocaleString('pt-BR')} / R$ ${p.mrr_realista.toLocaleString('pt-BR')} / R$ ${p.mrr_otimista.toLocaleString('pt-BR')}`).join('\n')}

# REVENUE FORECAST — 12 MESES

## CENÁRIO REALISTA (${crescimento}% a.m.)
[Análise do que é necessário para crescer ${crescimento}% ao mês — clientes, tickets, canais]

## CENÁRIO CONSERVADOR (${crescimento*0.5}% a.m.)
[O que acontece se crescer na metade do ritmo esperado]

## CENÁRIO OTIMISTA (${crescimento*1.5}% a.m.)
[O que seria necessário para crescer ${crescimento*1.5}% ao mês]

## PREMISSAS DO FORECAST
[Ticket médio, churn esperado, canais, sazonalidade]

## AÇÕES NECESSÁRIAS PARA O CENÁRIO REALISTA
[O que precisa acontecer toda semana para a projeção se concretizar]`);
        console.log(result);
        save(path.join(dir,'reports'), `forecast_${date}.md`, result);
        break;
      }

      case 'attribution': {
        const result = await ask(`${BASE}

CANAIS DE AQUISIÇÃO SmartOps:
${CONFIG.channels.map(c => `- ${c.canal}: custo R$${c.custo_mensal}/mês, ${c.leads_esperados} leads, conversão ${c.conversao_pct}%`).join('\n')}

# ANÁLISE DE ATRIBUIÇÃO DE RECEITA

## MODELO DE ATRIBUIÇÃO RECOMENDADO
[Last-touch vs. Multi-touch vs. Linear — qual usar para B2B consultoria]

## CANAL COM MELHOR ROAS
[Qual canal gera mais receita por R$ investido — com cálculo]

## CANAL COM MELHOR QUALIDADE DE LEAD
[Qual canal gera leads com maior taxa de fechamento]

## BUDGET ALLOCATION RECOMENDADO
[Distribuição ideal do budget de marketing por canal]

## ATRIBUIÇÃO DAS CONVERSÕES (regras práticas)
[Como rastrear qual canal originou cada cliente — sem GA4 complexo]

## PRÓXIMO CANAL A INVESTIR
[Qual canal abrir ou escalar para diversificar a aquisição]`);
        console.log(result);
        save(path.join(dir,'reports'), `attribution_${date}.md`, result);
        break;
      }

      case 'churn': {
        const inicio       = parseNum('clientes-inicio', 2);
        const cancelamentos = parseNum('cancelamentos', 0);
        const c = calcChurnRate(inicio, cancelamentos);
        console.log(`CHURN ANALYSIS`);
        console.log(`Clientes início: ${inicio} | Cancelamentos: ${cancelamentos}`);
        console.log(`Churn rate: ${c.churn_rate}% — ${c.label}\n`);
        save(path.join(dir,'reports'), 'churn_data.json', c);
        const result = await ask(`${BASE}

CHURN:
Clientes início do período: ${inicio}
Cancelamentos: ${cancelamentos}
Churn rate: ${c.churn_rate}% (${c.label})
Benchmark máximo saudável: ${CONFIG.benchmarks.churn_max_mensal_pct}%

# ANÁLISE DE CHURN

## DIAGNÓSTICO
[${c.churn_rate}% de churn — o que isso significa para o crescimento sustentável]

## CAUSAS MAIS COMUNS DE CHURN EM CONSULTORIA
[As 5 razões pelas quais clientes cancelam e como prevenir cada uma]

## SINAIS DE CHURN ANTECIPADOS (red flags)
[O que monitorar para identificar risco de churn 30-60 dias antes]

## PLANO DE SALVAMENTO (churn intervention)
[Para um cliente em risco: protocolo de abordagem e oferta de retenção]

## ESTRATÉGIA DE REDUÇÃO DE CHURN
[Ações concretas para reduzir o churn nos próximos 90 dias]`);
        console.log(result);
        save(path.join(dir,'reports'), `churn_analysis_${date}.md`, result);
        break;
      }

      case 'dashboard': {
        const mrr     = parseNum('mrr', 0);
        const clientes = parseNum('clientes', 0);
        const cac     = parseNum('cac', 0);
        const ltv     = parseNum('ltv', 0);
        const metrics = { mrr, clientes, cac, ltv, ltv_cac_ratio: cac > 0 ? +(ltv/cac).toFixed(2) : 0 };
        console.log(buildRevenueTable(metrics));
        save(path.join(dir,'reports'), 'revenue_dashboard.json', { metrics, date });
        break;
      }

      case 'report': {
        const result = await ask(`${BASE}

Data: ${date}

# REVENUE INTELLIGENCE REPORT — ${date}

## SCORECARD DE RECEITA
| Métrica | Atual | Meta | Status |
|---------|-------|------|--------|
| MRR | R$ 0 | R$ ${CONFIG.metas.mrr_90d.toLocaleString('pt-BR')} | 🔴 |
| Clientes | 0 | ${CONFIG.metas.clientes_meta} | 🔴 |
| CAC | — | < R$ ${CONFIG.benchmarks.cac_max_consultoria.toLocaleString('pt-BR')} | — |
| LTV/CAC | — | > ${CONFIG.benchmarks.ltv_cac_ratio_min}x | — |
| Churn | — | < ${CONFIG.benchmarks.churn_max_mensal_pct}% | — |

## ANÁLISE DE CRESCIMENTO
[Ritmo atual vs. necessário para atingir a meta]

## MIX DE RECEITA IDEAL
[Distribuição ideal entre serviços recorrentes e projetos]

## CANAIS COM MELHOR PERFORMANCE
[ROI por canal — onde investir e o que cortar]

## PLANO DE RECEITA PRÓXIMOS 30 DIAS
[Ações específicas, canal, ticket esperado, prazo]

## DECISÃO DE REVENUE PARA O CEO
[A uma coisa mais importante para aumentar o MRR esta semana]`);
        console.log(result);
        save(path.join(dir,'reports'), `revenue_report_${date}.md`, result);
        break;
      }

      default:
        console.log('Modos: mrr | cac | ltv | forecast | attribution | churn | dashboard | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch(e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
