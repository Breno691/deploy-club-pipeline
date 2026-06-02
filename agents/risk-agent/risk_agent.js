#!/usr/bin/env node
/**
 * Risk Agent — SmartOps IA
 * Alertas preventivos, riscos operacionais e financeiros
 *
 * Usage:
 *   node risk_agent.js --mode scan
 *   node risk_agent.js --mode scan --receita 0 --clientes 0 --pipeline 0
 *   node risk_agent.js --mode client --nome "Empresa X" --dias-sem-contato 15
 *   node risk_agent.js --mode financial --receita 2000 --meta 15000 --caixa 3000
 *   node risk_agent.js --mode operational --falhas 4 --entregas-atrasadas 1
 *   node risk_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }
function parseNum(n, fb = 0) { return parseFloat(getArg(n, String(fb))); }

function calcRiskScore(probability, impact) {
  const score = probability * impact;
  if (probability >= 7 && impact >= 7) return { ...CONFIG.risk_matrix.CRITICO, score };
  if (probability >= 5 && impact >= 7) return { ...CONFIG.risk_matrix.ALTO, score };
  if (probability >= 3 && impact >= 5) return { ...CONFIG.risk_matrix.MEDIO, score };
  return { ...CONFIG.risk_matrix.BAIXO, score };
}

function scanRisksLocally(data = {}) {
  const risks = [];
  if (!data.pipeline_valor || data.pipeline_valor === 0) risks.push({ name: 'Pipeline vazio', category: 'FINANCEIRO', probability: 10, impact: 10, risk: calcRiskScore(10, 10) });
  if (!data.clientes_ativos || data.clientes_ativos === 0) risks.push({ name: 'Sem clientes ativos', category: 'FINANCEIRO', probability: 10, impact: 9, risk: calcRiskScore(10, 9) });
  if (data.receita < 7500) risks.push({ name: 'Receita abaixo de 50% da meta', category: 'FINANCEIRO', probability: 8, impact: 9, risk: calcRiskScore(8, 9) });
  if (data.workflow_falhas >= 3) risks.push({ name: 'Workflows falhando repetidamente', category: 'TECNOLOGIA', probability: 7, impact: 6, risk: calcRiskScore(7, 6) });
  if (data.dias_sem_post >= 7) risks.push({ name: 'Sem conteúdo por 7+ dias', category: 'REPUTACAO', probability: 5, impact: 5, risk: calcRiskScore(5, 5) });
  return risks.sort((a, b) => b.risk.score - a.risk.score);
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir = path.join(__dirname, 'outputs', `risk_${date}`);
  ['logs','reports'].forEach(d => { if (!fs.existsSync(path.join(dir,d))) fs.mkdirSync(path.join(dir,d),{recursive:true}); });
  return { dir, date };
}
function save(dir, fn, c) { const p=path.join(dir,fn); fs.writeFileSync(p,typeof c==='string'?c:JSON.stringify(c,null,2),'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r=await client.messages.create({model:CONFIG.claude.model,max_tokens:CONFIG.claude.maxTokens,messages:[{role:'user',content:prompt}]}); return r.content[0].text; }

async function main() {
  const mode = getArg('mode', 'scan');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  RISK AGENT — SmartOps IA                       ║');
  console.log('║  "Risco identificado hoje é crise evitada."     ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();
  const BASE = `Você é o Risk Agent da SmartOps IA.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH
Empresa: SmartOps IA — consultoria Lean + Automação IA, BH — fase de aquisição de primeiros clientes`;

  try {
    switch (mode) {
      case 'scan': {
        const data = {
          receita:          parseNum('receita', 0),
          clientes_ativos:  parseNum('clientes', 0),
          pipeline_valor:   parseNum('pipeline', 0),
          workflow_falhas:  parseNum('falhas', 0),
          dias_sem_post:    parseNum('dias-sem-post', 0),
        };
        const risks = scanRisksLocally(data);
        const criticos = risks.filter(r => r.risk.label === 'Crítico');
        console.log(`RISK SCAN — ${date}`);
        console.log(`Riscos encontrados: ${risks.length} | Críticos: ${criticos.length}\n`);
        risks.slice(0, 5).forEach(r => console.log(`  [${r.risk.label}] ${r.name} — ${r.risk.action}`));
        if (risks.length > 0) {
          const result = await ask(`${BASE}
Riscos detectados: ${JSON.stringify(risks.slice(0,5), null, 2)}
Data: ${date}

Gere o Risk Scan Report:

# RISK SCAN REPORT — ${date}

## SEMÁFORO GERAL
[🔴 CRÍTICO / 🟡 ATENÇÃO / 🟢 OK]

## RISCOS CRÍTICOS (ação em < 24h)
[Para cada: contexto + impacto + ação imediata]

## RISCOS ALTOS (ação em 48h)
[Para cada: plano preventivo]

## RISCOS MONITORADOS
[Lista com quando revisar]

## PLANO DE MITIGAÇÃO
[Top 3 ações para reduzir o risco global]`);
          console.log('\n' + result);
          save(path.join(dir,'reports'), `risk_scan_${date}.md`, result);
        }
        save(path.join(dir,'reports'), 'risks_data.json', risks);
        break;
      }
      case 'client': {
        const nome   = getArg('nome', 'cliente');
        const dias   = parseNum('dias-sem-contato', 0);
        const atraso = parseNum('atraso-dias', 0);
        const result = await ask(`${BASE}

RISCO DE CLIENTE: ${nome}
Dias sem contato: ${dias}
Atraso na entrega: ${atraso} dias

Analise o risco e crie plano de ação:

# CLIENT RISK ANALYSIS — ${nome}

## NÍVEL DE RISCO
[Crítico/Alto/Médio/Baixo — com justificativa]

## SINAIS DE ALERTA
[O que esses dados indicam sobre a relação]

## AÇÃO IMEDIATA
[O que fazer nas próximas 2 horas]

## SCRIPT DE CONTATO
[Mensagem exata para enviar agora]

## PLANO 7 DIAS
[Ações para normalizar a relação]`);
        console.log(result);
        save(path.join(dir,'reports'), `client_risk_${nome.replace(/\s/g,'_')}_${Date.now()}.md`, result);
        break;
      }
      case 'financial': {
        const receita = parseNum('receita', 0), meta = parseNum('meta', 15000), caixa = parseNum('caixa', 0);
        const pct = meta > 0 ? Math.round((receita / meta) * 100) : 0;
        const runway = caixa > 0 ? Math.round(caixa / 600) : 0;
        console.log(`Receita: R$ ${receita.toLocaleString('pt-BR')} (${pct}% da meta) | Caixa: R$ ${caixa.toLocaleString('pt-BR')} | Runway: ~${runway} meses\n`);
        const result = await ask(`${BASE}
Receita: R$ ${receita} (${pct}% da meta de R$ ${meta})
Caixa disponível: R$ ${caixa}
Runway estimado: ${runway} meses

# FINANCIAL RISK REPORT

## STATUS FINANCEIRO
[Saudável / Atenção / Crítico]

## ANÁLISE DOS RISCOS
[Runway, concentração de receita, pipeline, gaps]

## PLANO DE EMERGÊNCIA (se aplicável)
[O que fazer se receita não chegar]

## ALAVANCAS DE RECEITA
[As 3 ações de maior impacto na receita nos próximos 30 dias]`);
        console.log(result);
        save(path.join(dir,'reports'), `financial_risk_${date}.md`, result);
        break;
      }
      case 'report': {
        const result = await ask(`${BASE}
Gere o Risk Report semanal completo para SmartOps IA.
Data: ${date}

# WEEKLY RISK REPORT — ${date}

## OVERVIEW DE RISCO
[Score geral de risco 0-100 — com justificativa]

## TOP 5 RISCOS ATIVOS
[Cada um com: categoria + probabilidade + impacto + ação]

## RISCOS NOVOS ESTA SEMANA
[O que surgiu de novo]

## RISCOS RESOLVIDOS
[O que foi mitigado]

## RECOMENDAÇÕES PREVENTIVAS
[O que fazer para reduzir o risco global esta semana]`);
        console.log(result);
        save(path.join(dir,'reports'), `risk_report_${date}.md`, result);
        break;
      }
      default:
        console.log('Modos: scan | client | financial | operational | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch(e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
