#!/usr/bin/env node
/**
 * Client Success Agent — SmartOps IA
 * Retenção, satisfação, health score e alertas de churn
 *
 * Usage:
 *   node client_success_agent.js --mode health --nome "Empresa X" --roi 85 --engagement 7
 *   node client_success_agent.js --mode risk
 *   node client_success_agent.js --mode action --nome "Empresa X" --status em_risco
 *   node client_success_agent.js --mode onboarding --nome "Empresa X" --service quick-win
 *   node client_success_agent.js --mode nps --nome "Empresa X" --score 7
 *   node client_success_agent.js --mode upsell --nome "Empresa X"
 *   node client_success_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }
function parseNum(n, fb = 0) { return parseFloat(getArg(n, String(fb))); }

function calcHealthScore(data = {}) {
  const { roi_atingido = 5, engajamento = 5, progresso = 5, satisfacao = 5, pagamentos = 10 } = data;
  const w = CONFIG.health_dimensions;
  const score = Math.round(
    (roi_atingido / 10) * w.roi_atingido.weight +
    (engajamento  / 10) * w.engajamento.weight +
    (progresso    / 10) * w.progresso_projeto.weight +
    (satisfacao   / 10) * w.satisfacao.weight +
    (pagamentos   / 10) * w.pagamentos.weight
  );
  const status = Object.entries(CONFIG.health_thresholds).find(([,v]) => score >= v.min)?.[1] || CONFIG.health_thresholds.CRITICO;
  return { score, ...status };
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir = path.join(__dirname, 'outputs', `cs_${date}`);
  ['logs','reports'].forEach(d => { if (!fs.existsSync(path.join(dir,d))) fs.mkdirSync(path.join(dir,d),{recursive:true}); });
  return { dir, date };
}
function save(dir, fn, c) { const p=path.join(dir,fn); fs.writeFileSync(p,typeof c==='string'?c:JSON.stringify(c,null,2),'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r=await client.messages.create({model:CONFIG.claude.model,max_tokens:CONFIG.claude.maxTokens,messages:[{role:'user',content:prompt}]}); return r.content[0].text; }

async function main() {
  const mode = getArg('mode', 'health');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  CLIENT SUCCESS AGENT — SmartOps IA             ║');
  console.log('║  "Cliente feliz é o melhor vendedor."           ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();

  const BASE = `Você é o Client Success Agent da SmartOps IA.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH
Empresa: SmartOps IA — consultoria Lean + Automação IA`;

  try {
    switch (mode) {
      case 'health': {
        const nome       = getArg('nome', 'Cliente');
        const roi        = parseNum('roi', 5);
        const engagement = parseNum('engagement', 5);
        const progress   = parseNum('progress', 5);
        const satisfaction = parseNum('satisfaction', 5);
        const payments   = parseNum('payments', 10);
        const health = calcHealthScore({ roi_atingido: roi, engajamento: engagement, progresso: progress, satisfacao: satisfaction, pagamentos: payments });

        console.log(`HEALTH SCORE — ${nome}`);
        console.log(`Score: ${health.score}/100 — ${health.label} (${health.color})`);
        console.log(`Ação recomendada: ${health.action}\n`);

        const result = await ask(`${BASE}

HEALTH CHECK — ${nome}
Score calculado: ${health.score}/100 (${health.label})
ROI atingido: ${roi}/10 | Engajamento: ${engagement}/10 | Progresso: ${progress}/10
Satisfação: ${satisfaction}/10 | Pagamentos: ${payments}/10

Gere o relatório de saúde do cliente:

# CLIENT HEALTH REPORT — ${nome}

## DIAGNÓSTICO
[O que os scores indicam sobre a saúde desse cliente]

## PONTOS FORTES
[O que está indo bem nessa relação]

## PONTOS DE ATENÇÃO
[O que pode virar problema se não endereçado]

## PLANO DE AÇÃO (próximos 14 dias)
[3-5 ações concretas para manter/melhorar a saúde]

## RISCO DE CHURN
[Baixo / Médio / Alto — com justificativa]

## OPORTUNIDADE
[Upsell, indicação ou renovação — quando e como abordar]`);
        console.log(result);
        save(path.join(dir,'reports'), `health_${nome.replace(/\s/g,'_')}_${date}.md`, result);
        save(path.join(dir,'reports'), `health_score_${nome}.json`, health);
        break;
      }
      case 'risk': {
        const result = await ask(`${BASE}

Gere uma análise de risco de clientes para SmartOps IA.
Clientes típicos: PMEs 10-200 funcionários, projetos de 3-16 semanas, ticket R$ 5.500-32.000

Inclua:

# CLIENT RISK ANALYSIS — ${date}

## SINAIS DE ALERTA (o que monitorar em cada cliente)
[Para cada sinal: o que observar + ação preventiva]

## CHECKLIST DE SAÚDE (semanal)
[10 perguntas para avaliar cada cliente toda semana]

## PLANO DE RESGATE (cliente em risco)
[Passo a passo para recuperar um cliente insatisfeito]

## COMO PREVENIR CHURN
[3 práticas que a SmartOps deve adotar em todo projeto]

## TEMPLATE DE CHECK-IN MENSAL
[Mensagem + perguntas para o check-in mensal]`);
        console.log(result);
        save(path.join(dir,'reports'), `risk_analysis_${date}.md`, result);
        break;
      }
      case 'onboarding': {
        const nome    = getArg('nome', 'Novo Cliente');
        const service = getArg('service', 'quick-win');
        const milestones = CONFIG.delivery_milestones[service] || CONFIG.delivery_milestones['quick-win'];
        const result = await ask(`${BASE}

Crie o plano de onboarding para:
CLIENTE: ${nome}
SERVIÇO: ${service}
MARCOS: ${milestones.join(' → ')}

# ONBOARDING PLAN — ${nome}

## SEMANA DE KICKOFF (dias 1-5)
[Agenda detalhada + materiais + acessos necessários]

## PRIMEIRAS ENTREGAS
[O que ${nome} vai receber e quando — gera entusiasmo inicial]

## COMUNICAÇÃO (cadência)
[Com que frequência e por qual canal se comunicar]

## EXPECTATIVAS (alinhar)
[O que a SmartOps vai entregar + o que o cliente precisa fazer]

## RED FLAGS (o que monitorar nos primeiros 30 dias)
[Sinais de que o onboarding não está indo bem]

## MENSAGEM DE BOAS-VINDAS
[Texto pronto para enviar no dia 1]`);
        console.log(result);
        save(path.join(dir,'reports'), `onboarding_${nome.replace(/\s/g,'_')}.md`, result);
        break;
      }
      case 'nps': {
        const nome  = getArg('nome', 'cliente');
        const score = parseNum('score', 8);
        const cat   = score >= 9 ? 'PROMOTOR' : score >= 7 ? 'NEUTRO' : 'DETRATOR';
        const result = await ask(`${BASE}

NPS de ${nome}: ${score}/10 (${cat})

Gere a análise e plano de ação do NPS:

# NPS ANALYSIS — ${nome}

## INTERPRETAÇÃO
[O que o score ${score} significa para essa relação]

## RESPOSTA ADEQUADA (texto pronto para enviar)
[Resposta personalizada para ${cat}]

## AÇÃO PÓS-NPS
Se PROMOTOR: [como pedir indicação / depoimento]
Se NEUTRO: [como transformar em promotor]
Se DETRATOR: [como recuperar urgentemente]

## APRENDIZADO
[O que esse NPS revela sobre o projeto/serviço]`);
        console.log(result);
        save(path.join(dir,'reports'), `nps_${nome.replace(/\s/g,'_')}_${Date.now()}.md`, result);
        break;
      }
      case 'report': {
        const result = await ask(`${BASE}

Gere o Client Success Report semanal da SmartOps IA.

# CLIENT SUCCESS REPORT — ${date}

## OVERVIEW DA BASE
[Status geral dos clientes ativos]

## HEALTH SCORES
[Tabela com scores por cliente — hipotético mas realista]

## ALERTAS DA SEMANA
[O que precisa de atenção imediata]

## ENTREGAS DESTA SEMANA
[O que foi entregue + qualidade]

## PRÓXIMAS ENTREGAS
[O que vence nos próximos 7 dias]

## OPORTUNIDADES
[Upsell, indicação, renovação iminente]

## AÇÕES DO CLIENT SUCCESS
[Top 5 ações para a semana]`);
        console.log(result);
        save(path.join(dir,'reports'), `cs_report_${date}.md`, result);
        break;
      }
      default:
        console.log('Modos: health | risk | action | onboarding | nps | upsell | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch(e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
