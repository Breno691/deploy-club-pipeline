#!/usr/bin/env node
/**
 * Executive Dashboard Agent — SmartOps IA
 * Consolida os 9 dashboards em visão executiva acionável
 *
 * Usage:
 *   node executive_dashboard_agent.js --mode daily
 *   node executive_dashboard_agent.js --mode weekly --mrr 5000 --clientes 1 --leads 8 --reunioes 3
 *   node executive_dashboard_agent.js --mode monthly
 *   node executive_dashboard_agent.js --mode squad --squad marketing
 *   node executive_dashboard_agent.js --mode kpis --mrr 5000 --clientes 1 --leads 8
 *   node executive_dashboard_agent.js --mode alert --mrr 0 --clientes 0
 *   node executive_dashboard_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }
function parseNum(n, fb = 0)   { return parseFloat(getArg(n, String(fb))); }

// ─── PURE FUNCTIONS ─────────────────────────────────────────────────────────

function calcBusinessHealthScore(kpis) {
  const { receita = 0, clientes = 0, leads = 0, reunioes = 0, sla = 100 } = kpis;
  const metas = CONFIG.metas;
  const scores = {
    receita:   Math.min(100, (receita / metas.mrr_meta) * 100),
    clientes:  Math.min(100, (clientes / metas.clientes_meta) * 100),
    marketing: Math.min(100, (leads / metas.leads_mes_meta) * 100),
    operacoes: Math.min(100, sla),
    estrategia: clientes > 0 && leads > 5 ? 70 : 30,
  };
  const w = CONFIG.health_weights;
  const total = Object.entries(scores).reduce((sum, [k, v]) => sum + (v * (w[k]?.weight || 10) / 100), 0);
  const label = total >= 80 ? 'SAUDÁVEL' : total >= 60 ? 'ATENÇÃO' : total >= 40 ? 'EM RISCO' : 'CRÍTICO';
  const emoji = total >= 80 ? '🟢' : total >= 60 ? '🟡' : total >= 40 ? '🟠' : '🔴';
  return { score: +total.toFixed(1), label, emoji, scores };
}

function detectAlerts(kpis) {
  const alerts = [];
  const metas = CONFIG.metas;
  if (kpis.mrr < metas.mrr_meta * 0.3)  alerts.push({ level: 'CRÍTICO', area: 'Finance',   msg: `MRR R$${kpis.mrr} — muito abaixo da meta R$${metas.mrr_meta}` });
  if (kpis.clientes === 0)               alerts.push({ level: 'CRÍTICO', area: 'Sales',     msg: 'Zero clientes ativos — pipeline em colapso' });
  if (kpis.leads < 5)                    alerts.push({ level: 'ALTO',    area: 'Marketing', msg: `Apenas ${kpis.leads} leads no mês — meta ${metas.leads_mes_meta}` });
  if (kpis.reunioes < 3)                 alerts.push({ level: 'ALTO',    area: 'Sales',     msg: `Apenas ${kpis.reunioes} reuniões — funil de vendas travado` });
  if ((kpis.margem || 65) < 50)          alerts.push({ level: 'ALTO',    area: 'Finance',   msg: `Margem ${kpis.margem}% — abaixo do mínimo saudável (50%)` });
  return alerts.sort((a, b) => a.level === 'CRÍTICO' ? -1 : 1);
}

function buildDashboardTable(kpis) {
  const { mrr = 0, clientes = 0, leads = 0, reunioes = 0 } = kpis;
  const metas = CONFIG.metas;
  const row = (label, v, meta, unit = '') => {
    const pct = meta > 0 ? Math.min(100, (v / meta) * 100) : 100;
    const status = pct >= 90 ? '🟢' : pct >= 60 ? '🟡' : '🔴';
    return `  ${status} ${label.padEnd(22)} ${String(v + unit).padStart(10)} / ${String(meta + unit).padStart(10)}  (${pct.toFixed(0)}%)`;
  };
  return [
    '┌─────────────────────────────────────────────────────────────┐',
    '│  EXECUTIVE KPI DASHBOARD                                    │',
    '├─────────────────────────────────────────────────────────────┤',
    row('MRR', `R$${mrr.toLocaleString('pt-BR')}`, `R$${metas.mrr_meta.toLocaleString('pt-BR')}`),
    row('Clientes Ativos', clientes, metas.clientes_meta),
    row('Leads/Mês', leads, metas.leads_mes_meta),
    row('Reuniões/Mês', reunioes, metas.reunioes_mes_meta),
    '└─────────────────────────────────────────────────────────────┘',
  ].join('\n');
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `exec_dashboard_${date}`);
  ['logs','reports'].forEach(d => { if (!fs.existsSync(path.join(dir,d))) fs.mkdirSync(path.join(dir,d),{recursive:true}); });
  return { dir, date };
}
function save(dir, fn, c) { const p=path.join(dir,fn); fs.writeFileSync(p,typeof c==='string'?c:JSON.stringify(c,null,2),'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r=await client.messages.create({model:CONFIG.claude.model,max_tokens:CONFIG.claude.maxTokens,messages:[{role:'user',content:prompt}]}); return r.content[0].text; }

// ─── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  const mode = getArg('mode', 'daily');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  EXECUTIVE DASHBOARD AGENT — SmartOps IA        ║');
  console.log('║  "Dados consolidados. Decisões claras."         ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();

  // KPIs do CLI (aceita --mrr, --clientes, --leads, --reunioes, --margem, --sla)
  const kpis = {
    mrr:      parseNum('mrr', 0),
    clientes: parseNum('clientes', 0),
    leads:    parseNum('leads', 0),
    reunioes: parseNum('reunioes', 0),
    margem:   parseNum('margem', 65),
    sla:      parseNum('sla', 100),
  };

  const health   = calcBusinessHealthScore(kpis);
  const alerts   = detectAlerts(kpis);
  const BASE = `Você é o Executive Dashboard Agent da SmartOps IA.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH, MG.
Business Health Score atual: ${health.score}/100 — ${health.emoji} ${health.label}
KPIs: MRR R$${kpis.mrr.toLocaleString('pt-BR')}, Clientes ${kpis.clientes}, Leads ${kpis.leads}/mês, Reuniões ${kpis.reunioes}/mês
Alertas ativos: ${alerts.length} (${alerts.filter(a=>a.level==='CRÍTICO').length} críticos)
Metas: MRR R$${CONFIG.metas.mrr_meta.toLocaleString('pt-BR')}, ${CONFIG.metas.clientes_meta} clientes, ${CONFIG.metas.leads_mes_meta} leads/mês`;

  try {
    switch (mode) {

      case 'kpis': {
        console.log(buildDashboardTable(kpis));
        console.log(`\nBusiness Health Score: ${health.emoji} ${health.score}/100 — ${health.label}`);
        if (alerts.length) {
          console.log('\nAlertas:');
          alerts.forEach(a => console.log(`  [${a.level}] ${a.area}: ${a.msg}`));
        }
        save(path.join(dir,'reports'), 'kpis_data.json', { kpis, health, alerts });
        break;
      }

      case 'daily': {
        console.log(buildDashboardTable(kpis));
        console.log(`Business Health: ${health.emoji} ${health.score}/100 — ${health.label}\n`);
        const result = await ask(`${BASE}

Data: ${date}

# DAILY EXECUTIVE BRIEF — ${date}

## STATUS GERAL: ${health.emoji} ${health.label} (${health.score}/100)

## ONTEM — O QUE ACONTECEU
[Análise dos KPIs de ontem vs. padrão esperado]

## ALERTAS ATIVOS
${alerts.map(a => `- [${a.level}] ${a.area}: ${a.msg}`).join('\n') || '- Nenhum alerta crítico'}

## FOCO DO DIA (top 3 ações)
[As 3 coisas mais importantes para fazer hoje baseado nos dados]

## DECISÃO NECESSÁRIA
[Uma coisa que o CEO precisa decidir agora para destravar o crescimento]

## PREVISÃO DO DIA
[O que esperar acontecer hoje se as ações corretas forem tomadas]`);
        console.log(result);
        save(path.join(dir,'reports'), `daily_brief_${date}.md`, result);
        break;
      }

      case 'weekly': {
        console.log(buildDashboardTable(kpis));
        const result = await ask(`${BASE}

Data: ${date}

# WEEKLY EXECUTIVE REPORT — ${date}

## SCORECARD DA SEMANA
| Dashboard | KPI Principal | Realizado | Meta | Status |
|-----------|---------------|-----------|------|--------|
| Marketing | Leads/semana | ${Math.round(kpis.leads/4)} | ${Math.round(CONFIG.metas.leads_mes_meta/4)} | ${kpis.leads >= CONFIG.metas.leads_mes_meta/4 ? '🟢' : '🔴'} |
| Sales | Reuniões/semana | ${Math.round(kpis.reunioes/4)} | ${Math.round(CONFIG.metas.reunioes_mes_meta/4)} | ${kpis.reunioes >= CONFIG.metas.reunioes_mes_meta/4 ? '🟢' : '🔴'} |
| Finance | MRR | R$${kpis.mrr.toLocaleString('pt-BR')} | R$${CONFIG.metas.mrr_meta.toLocaleString('pt-BR')} | ${kpis.mrr >= CONFIG.metas.mrr_meta ? '🟢' : '🔴'} |

## HIGHLIGHTS DA SEMANA
[Top 3 coisas que foram bem]

## PROBLEMAS DA SEMANA
[Top 3 coisas que precisam de atenção]

## ANÁLISE POR SQUAD
[Para cada squad: status, KPI crítico, bloqueio ou avanço]

## PLANO PARA A PRÓXIMA SEMANA
[5 ações prioritárias com responsável e data]

## DECISÃO ESTRATÉGICA SEMANAL
[Uma decisão de alto impacto que deve ser tomada esta semana]`);
        console.log(result);
        save(path.join(dir,'reports'), `weekly_report_${date}.md`, result);
        break;
      }

      case 'monthly': {
        const result = await ask(`${BASE}

Data: ${date}

# MONTHLY EXECUTIVE REPORT — ${date}

## BUSINESS HEALTH: ${health.emoji} ${health.score}/100

## SCORECARD MENSAL COMPLETO
[Todos os 9 dashboards com KPIs reais vs. metas]

## TOP 3 WINS DO MÊS
[O que foi conquistado — com números]

## TOP 3 LOSSES DO MÊS
[O que não saiu como planejado — sem desculpas]

## ANÁLISE OKR — PROGRESSO VS META
[Para cada OKR: % de progresso, status, ajuste necessário]

## ANÁLISE FINANCEIRA
[MRR, margem, runway, projeção próximo mês]

## ANÁLISE DE PIPELINE
[Leads → Reuniões → Propostas → Clientes — taxa de conversão em cada etapa]

## DECISÕES ESTRATÉGICAS DO PRÓXIMO MÊS
[Top 3 decisões que definirão o resultado do próximo período]

## PLANO DE AÇÃO MENSAL
[10 ações rankeadas por ROI para o próximo mês]`);
        console.log(result);
        save(path.join(dir,'reports'), `monthly_report_${date}.md`, result);
        break;
      }

      case 'squad': {
        const squad = getArg('squad', 'marketing');
        const squadInfo = CONFIG.squads[squad] || CONFIG.squads.marketing;
        const result = await ask(`${BASE}

SQUAD: ${squad.toUpperCase()}
Agentes: ${squadInfo.agents.join(', ')}

# SQUAD DASHBOARD — ${squad.toUpperCase()}

## STATUS DO SQUAD
[Health score do squad 0-100 — justificativa]

## KPIs PRINCIPAIS
[Top 5 KPIs do squad com: atual, meta, status, tendência]

## AGENTES ATIVOS
[Para cada agente: última execução, resultado, próxima ação]

## BLOQUEIOS DO SQUAD
[O que está impedindo este squad de performar melhor]

## RECOMENDAÇÃO DE PRIORIDADE
[O que este squad deve focar nos próximos 7 dias]`);
        console.log(result);
        save(path.join(dir,'reports'), `squad_${squad}_${date}.md`, result);
        break;
      }

      case 'alert': {
        if (!alerts.length) { console.log('✅ Nenhum alerta crítico detectado.'); break; }
        console.log(`⚠️ ${alerts.length} alertas detectados:\n`);
        alerts.forEach(a => console.log(`  [${a.level}] ${a.area}: ${a.msg}`));
        const result = await ask(`${BASE}

ALERTAS DETECTADOS:
${alerts.map(a => `[${a.level}] ${a.area}: ${a.msg}`).join('\n')}

# ALERT REPORT — ${date}

## SITUAÇÃO DE EMERGÊNCIA
[Nível geral de risco e interpretação dos alertas combinados]

## PLANO DE CRISE (se necessário)
[Para cada alerta crítico: ação em < 24h para estancar o problema]

## COMUNICAÇÃO
[O que comunicar para a equipe e parceiros neste momento]

## LINHA DO TEMPO DE RECUPERAÇÃO
[Se nada mudar, quando a situação fica insustentável? O que fazer hoje/amanhã/semana?]

## PLANO DE REVERSÃO
[Passos concretos para sair desta situação — baseado no que funciona para consultoria B2B]`);
        console.log(result);
        save(path.join(dir,'reports'), `alert_report_${date}.md`, result);
        save(path.join(dir,'reports'), 'alerts_data.json', { alerts, health, kpis });
        break;
      }

      case 'report': {
        const result = await ask(`${BASE}

Gere o Executive Dashboard Report completo — visão consolidada de todos os 9 dashboards.
Data: ${date}

# EXECUTIVE DASHBOARD — ${date}

## BUSINESS HEALTH SCORE: ${health.emoji} ${health.score}/100

## SCORECARD EXECUTIVO
[Tabela com todos os 9 dashboards: status, KPI principal, realizado, meta]

## ALERTAS CRÍTICOS
${alerts.length ? alerts.map(a => `- ${a.emoji || '⚠️'} [${a.level}] ${a.msg}`).join('\n') : '- Sistema operando normalmente'}

## ANÁLISE POR SQUAD (10 squads)
[Status rápido de cada squad — uma linha por squad]

## TOP 5 PRIORIDADES EXECUTIVAS
[As 5 ações de maior impacto para o CEO nos próximos 7 dias]

## DECISÃO DO DIA
[Uma coisa que o CEO deve decidir hoje — com contexto e opções]

## PRÓXIMA MILESTONE
[Qual é o próximo marco significativo e o que falta para chegar lá]`);
        console.log(result);
        save(path.join(dir,'reports'), `exec_report_${date}.md`, result);
        save(path.join(dir,'reports'), 'dashboard_data.json', { kpis, health, alerts, date });
        break;
      }

      default:
        console.log('Modos: daily | weekly | monthly | squad | kpis | alert | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch(e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
