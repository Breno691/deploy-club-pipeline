#!/usr/bin/env node
/**
 * Chief of Staff Agent — SmartOps IA
 * Transforma estratégia em execução semanal
 * "Estratégia sem execução é sonho."
 *
 * Usage:
 *   node chief_of_staff_agent.js --mode weekly-plan
 *   node chief_of_staff_agent.js --mode task-breakdown --goal "fechar 2 clientes este mês"
 *   node chief_of_staff_agent.js --mode standup
 *   node chief_of_staff_agent.js --mode sprint --sprint 1
 *   node chief_of_staff_agent.js --mode review --week "semana 22"
 *   node chief_of_staff_agent.js --mode delegate --task "criar relatório semanal"
 *   node chief_of_staff_agent.js --mode okr-check
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }
function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir = path.join(__dirname, 'outputs', `cos_${date}`);
  ['logs','reports'].forEach(d => { if (!fs.existsSync(path.join(dir,d))) fs.mkdirSync(path.join(dir,d),{recursive:true}); });
  return { dir, date };
}
function save(dir, fn, content) {
  const p = path.join(dir, fn);
  fs.writeFileSync(p, typeof content === 'string' ? content : JSON.stringify(content, null, 2), 'utf-8');
  console.log(`  ✓ ${p}`);
}
async function ask(prompt) {
  const r = await client.messages.create({ model: CONFIG.claude.model, max_tokens: CONFIG.claude.maxTokens, messages: [{ role: 'user', content: prompt }] });
  return r.content[0].text;
}

async function main() {
  const mode = getArg('mode', 'weekly-plan');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  CHIEF OF STAFF AGENT — SmartOps IA             ║');
  console.log('║  Estratégia → Execução                          ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();

  const BASE = `Você é o Chief of Staff Agent da SmartOps IA.
CEO: Breno Luiz — Black Belt Lean Six Sigma, fundador SmartOps IA, BH
Stage: pré-receita → primeiros clientes. Metas: 3 clientes, R$ 15.000/mês.
Semana atual: ${date}
Metas semanais: ${JSON.stringify(CONFIG.weekly_targets)}`;

  try {
    switch (mode) {
      case 'weekly-plan': {
        const result = await ask(`${BASE}

Crie o Plano Semanal de Execução para esta semana.

# PLANO SEMANAL — ${date}

## OBJETIVO DA SEMANA (1 meta principal)
[A única coisa que, se feita, faz a semana ser bem-sucedida]

## TAREFAS POR DIA (blocos de trabalho)
Segunda:  [3 tarefas — foco em prospecção/vendas]
Terça:    [3 tarefas — foco em conteúdo/marketing]
Quarta:   [3 tarefas — foco em execução/entrega]
Quinta:   [3 tarefas — foco em clientes/follow-up]
Sexta:    [3 tarefas — foco em revisão + preparação semana seguinte]

## ROTINAS NÃO NEGOCIÁVEIS (diárias)
[3 hábitos operacionais que acontecem todo dia]

## BLOQUEADORES PREVISTOS
[O que pode atrapalhar a semana + como mitigar]

## CRITÉRIO DE SUCESSO DA SEMANA
[3 resultados que definem uma semana excelente]`);
        console.log(result);
        save(path.join(dir,'reports'), `weekly_plan_${date}.md`, result);
        break;
      }
      case 'task-breakdown': {
        const goal = getArg('goal', 'fechar 2 clientes neste mês');
        const result = await ask(`${BASE}

Quebre o objetivo abaixo em tarefas executáveis menores:
OBJETIVO: "${goal}"

# TASK BREAKDOWN — ${goal}

## ANÁLISE DO OBJETIVO
[Por que esse objetivo importa agora? Qual o impacto financeiro?]

## TAREFAS (do mais simples ao mais complexo)
Para cada tarefa:
TAREFA: [nome acionável — começa com verbo]
TIPO: [${CONFIG.task_types.map(t=>t.type).join(' / ')}]
ESTIMATIVA: [tempo em minutos]
DEPENDÊNCIAS: [o que precisa estar pronto antes]
ENTREGÁVEL: [o que indica que a tarefa está concluída]
RESPONSÁVEL: Breno

## SEQUÊNCIA DE EXECUÇÃO
[Ordem ótima para executar as tarefas]

## CRONOGRAMA (quando fazer cada tarefa)
[Distribuição ao longo da semana]

## PRIMEIRA TAREFA
[O que fazer agora mesmo — nos próximos 30 minutos]`);
        console.log(result);
        save(path.join(dir,'reports'), `task_breakdown_${Date.now()}.md`, result);
        break;
      }
      case 'standup': {
        const yesterday = getArg('yesterday', '');
        const today_plan = getArg('today', '');
        const blockers  = getArg('blockers', '');
        const result = await ask(`${BASE}

DAILY STANDUP — ${date}
Ontem: ${yesterday || 'não informado'}
Hoje planejado: ${today_plan || 'não informado'}
Bloqueadores: ${blockers || 'nenhum'}

Gere o Standup Report e o plano do dia:

# DAILY STANDUP — ${date}

## ONTEM (análise rápida)
[O que foi feito + o que não foi + por quê]

## HOJE (plano executável)
[Top 3 tarefas do dia em ordem de prioridade]
Para cada: tarefa + tempo estimado + critério de conclusão

## BLOQUEADORES
[Como resolver cada bloqueador — ação específica]

## MÉTRICA DO DIA
[O número que define se o dia foi bem-sucedido]`);
        console.log(result);
        save(path.join(dir,'reports'), `standup_${date}.md`, result);
        break;
      }
      case 'sprint': {
        const sprint = getArg('sprint', '1');
        const result = await ask(`${BASE}

Crie o Sprint ${sprint} de 2 semanas para SmartOps IA.

# SPRINT ${sprint} — SmartOps IA

## META DO SPRINT
[O resultado específico ao final de 2 semanas]

## BACKLOG DO SPRINT (tarefas selecionadas)
| # | Tarefa | Tipo | Pontos | Prioridade |
[preencher — 10-15 tarefas]

## SEMANA 1 (dias 1-5)
[Distribuição das tarefas]

## SEMANA 2 (dias 6-10)
[Distribuição das tarefas]

## CRITÉRIO DE DONE
[Como saber que cada tarefa está realmente concluída]

## RETROSPECTIVA TEMPLATE
[Perguntas para a retro ao final do sprint]`);
        console.log(result);
        save(path.join(dir,'reports'), `sprint_${sprint}_${date}.md`, result);
        break;
      }
      case 'review': {
        const week = getArg('week', date);
        const wins = getArg('wins', '');
        const losses = getArg('losses', '');
        const result = await ask(`${BASE}

REVISÃO SEMANAL — Semana ${week}
Vitórias: ${wins || 'não informado'}
Problemas: ${losses || 'não informado'}

# WEEKLY REVIEW — ${week}

## RESULTADO vs PLANEJADO
[O que estava planejado vs o que aconteceu]

## TOP 3 VITÓRIAS
[Com impacto concreto]

## TOP 3 PROBLEMAS (com causa raiz)
[Não sintoma — causa raiz]

## APRENDIZADO DA SEMANA
[1 insight que muda como agir na próxima semana]

## AJUSTE DE ROTA
[O que mudar no processo ou estratégia]

## PLANO DA PRÓXIMA SEMANA
[Top 5 prioridades]`);
        console.log(result);
        save(path.join(dir,'reports'), `review_week_${week}.md`, result);
        break;
      }
      case 'okr-check': {
        const result = await ask(`${BASE}

Faça uma revisão dos OKRs da SmartOps IA:

OKRs definidos:
- O1: Adquirir primeiros 3 clientes pagantes
  - KR1: 10 leads/semana
  - KR2: 3 reuniões/semana
  - KR3: 1 proposta/semana
  - KR4: R$ 15k/mês receita
- O2: Construir autoridade em BH
  - KR1: 500 seguidores LinkedIn
  - KR2: 3 posts/semana publicados
  - KR3: 1 parceria ativa
- O3: Operação automatizada
  - KR1: 5 workflows n8n ativos
  - KR2: 20h/mês liberadas por automação

# OKR CHECK — ${date}

## STATUS POR OKR
Para cada: % de progresso + status (ON TRACK / AT RISK / OFF TRACK) + causa

## RED FLAGS
[KRs em risco que precisam de ação]

## AJUSTE DE ESTRATÉGIA
[O que mudar para recuperar KRs OFF TRACK]

## PRÓXIMAS 2 SEMANAS
[Ações específicas para avançar os OKRs críticos]`);
        console.log(result);
        save(path.join(dir,'reports'), `okr_check_${date}.md`, result);
        break;
      }
      case 'delegate': {
        const task = getArg('task', 'criar relatório semanal');
        const result = await ask(`${BASE}

Analise se a tarefa abaixo deve ser delegada ou feita pelo Breno, e se delegada, como:
TAREFA: "${task}"

# DELEGATION ANALYSIS

## DEVE DELEGAR?
[Sim/Não + justificativa baseada no valor por hora de Breno]

## SE SIM — COMO DELEGAR
Para quem: [agente IA / freelancer / parceiro / automação]
Como:      [instruções claras para quem vai receber]
Critério:  [como saber que foi feito certo]
Prazo:     [quando deve ser entregue]

## SE NÃO — QUANDO FAZER
[Bloco de tempo ideal no calendário]

## AUTOMAÇÃO POSSÍVEL
[Pode ser automatizado com n8n/Claude? Como?]`);
        console.log(result);
        save(path.join(dir,'reports'), `delegate_${Date.now()}.md`, result);
        break;
      }
      default:
        console.log('Modos: weekly-plan | task-breakdown | standup | sprint | review | delegate | okr-check');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch(e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
