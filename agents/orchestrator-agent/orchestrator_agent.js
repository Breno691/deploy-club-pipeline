#!/usr/bin/env node
/**
 * Orchestrator Agent — SmartOps IA
 * Coordena pipeline de conteúdo 3x/semana e agenda de agentes
 *
 * Usage:
 *   node orchestrator_agent.js --mode pipeline --taskName "lean-waste" --taskDate "2026-06-03"
 *   node orchestrator_agent.js --mode brief --tema "8 desperdícios" --data "ter"
 *   node orchestrator_agent.js --mode agenda
 *   node orchestrator_agent.js --mode weekly
 *   node orchestrator_agent.js --mode status
 *   node orchestrator_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir = path.join(__dirname, 'outputs', `orch_${date}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return { dir, date };
}
function save(dir, fn, c) { const p = path.join(dir, fn); fs.writeFileSync(p, typeof c === 'string' ? c : JSON.stringify(c, null, 2), 'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r = await client.messages.create({ model: CONFIG.claude.model, max_tokens: CONFIG.claude.maxTokens, messages: [{ role: 'user', content: prompt }] }); return r.content[0].text; }

const BASE = `Você é o Orchestrator Agent da SmartOps IA — o maestro que coordena todos os agentes e pipelines.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH/MG.

SQUADS E AGENTES:
${Object.entries(CONFIG.squads).map(([squad, agents]) => `- ${squad}: ${agents.join(', ')}`).join('\n')}

PIPELINE DE CONTEÚDO: ${CONFIG.content_pipeline.frequencia}
Server: ${CONFIG.content_pipeline.server}
Etapas: ${CONFIG.content_pipeline.etapas.join(' → ')}

ROTINAS DIÁRIAS (${CONFIG.daily_routines.length} horários):
${CONFIG.daily_routines.map(r => `${r.hora}: ${r.agentes.join(', ')}${r.consolidador ? ' ← CONSOLIDADOR' : ''}`).join('\n')}

REGRAS:
- Nunca paralelizar agentes que dependem uns dos outros
- CEO Advisor sempre o último a rodar (consolida todos)
- Content pipeline: Research primeiro, Distribution por último
- Priorizar por ROI direto: vendas > operações > marketing`;

async function main() {
  const mode = getArg('mode', 'report');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  ORCHESTRATOR AGENT — SmartOps IA               ║');
  console.log('║  "O orquestrador não executa. Ele coordena."    ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();

  try {
    switch (mode) {

      case 'pipeline': {
        const taskName = getArg('taskName', 'lean-waste');
        const taskDate = getArg('taskDate', date);
        const result   = await ask(`${BASE}

TASK: ${taskName} | DATA: ${taskDate}

Orquestre o PIPELINE DE CONTEÚDO completo:

# Pipeline: ${taskName} — ${taskDate}

## 1. Research Brief
**Agente:** Marketing Research Agent
**Instrução:** Pesquisar tendências sobre [tema derivado de ${taskName}] para PMEs em BH
**Output esperado:** research_results.json + research_brief.md
**Tempo estimado:** 3-5 min

## 2. Copy Generation
**Agente:** Copywriter Agent
**Input:** research_results.json
**Instrução:** Gerar caption Instagram + post Threads + metadata YouTube
**Output esperado:** copy/ (3 arquivos)
**Tempo estimado:** 2-3 min

## 3. Ad Creative
**Agente:** Ad Creative Designer Agent
**Input:** research_brief.md + copy/
**Instrução:** Gerar layout.json + briefing visual para ad
**Output esperado:** ads/layout.json + ads/ad.html
**Tempo estimado:** 2-3 min

## 4. Video Brief
**Agente:** Video Ad Specialist Agent
**Input:** layout.json
**Instrução:** Roteiro para Reel de 30s sobre o tema
**Output esperado:** video/roteiro.md
**Tempo estimado:** 2 min

## 5. Distribution
**Agente:** Distribution Agent
**Input:** copy/ + ads/
**Instrução:** Calendário de publicação + horários + hashtags
**Output esperado:** schedule.md
**Tempo estimado:** 1-2 min

## Trigger no n8n
POST ${CONFIG.content_pipeline.server}/run-pipeline
\`\`\`json
{ "taskName": "${taskName}", "taskDate": "${taskDate}", "skipPost": false }
\`\`\`

## Aprovação via Telegram
Chat ID: 1349738505 | Botões: ✅ Aprovar / ❌ Rejeitar`);
        console.log(result);
        save(dir, `pipeline_${taskName}_${taskDate}.md`, result);
        break;
      }

      case 'brief': {
        const tema = getArg('tema', '8 desperdícios');
        const dia  = getArg('data', 'terca');
        const result = await ask(`${BASE}

TEMA: ${tema} | DIA: ${dia}

Crie o BRIEF COMPLETO para o pipeline de conteúdo:

# Content Brief — ${tema}

## Contexto do Tema
[Por que este tema agora? Relevância para PMEs em BH]

## Ângulo Principal
[O ângulo mais impactante para este tema no momento]

## Brief por Agente

### Para Marketing Research Agent
[Queries de pesquisa específicas — 5 perguntas]

### Para Copywriter Agent
[Hook central + framework + CTA]

### Para Ad Creative Designer Agent
[Conceito visual + ângulo + brand tokens]

### Para Video Ad Specialist Agent
[Hook de vídeo + estrutura 30s]

### Para Distribution Agent
[Canal prioritário + horário + hashtags]

## KPI de Sucesso
[O que define sucesso para este conteúdo]`);
        console.log(result);
        save(dir, `brief_${tema.replace(/\s/g,'_')}_${date}.md`, result);
        break;
      }

      case 'agenda': {
        const result = await ask(`${BASE}

Crie a AGENDA COMPLETA DOS AGENTES para hoje e esta semana:

# Agenda de Agentes — ${date}

## Rotinas Diárias (ordem de execução)
${CONFIG.daily_routines.map(r => `### ${r.hora} — Squad: ${r.squad}
Agentes: ${r.agentes.join(', ')}
${r.consolidador ? '⭐ CONSOLIDADOR — aguarda todos os anteriores' : ''}
Output esperado: [relatório diário]`).join('\n\n')}

## Pipeline de Conteúdo da Semana
| Data | Tema | Status | Agentes Envolvidos |
|------|------|--------|-------------------|
| Ter | [tema] | Pendente | Research→Copy→Design→Video→Dist |
| Qui | [tema] | Pendente | [idem] |
| Sáb | [tema] | Pendente | [idem] |

## Alertas e Dependências
[O que pode travar o pipeline e como resolver]`);
        console.log(result);
        save(dir, `agenda_${date}.md`, result);
        break;
      }

      case 'assign': {
        const tarefa = getArg('tarefa', 'criar campanha de anúncios');
        const result = await ask(`${BASE}

TAREFA: ${tarefa}

## Atribuição de Agentes

### Agente Responsável Principal
[Qual agente é o dono desta tarefa]

### Agentes de Suporte
[Quais outros agentes precisam contribuir]

### Sequência de Execução
1. [Agente A] — [o que faz] — [output]
2. [Agente B] — [recebe output de A] — [output]
3. [Agente C] — [consolida] — [entregável final]

### Timeline
[Estimativa de tempo total]

### Entregável Final
[O que será produzido — formato e onde salvar]

### Critério de Qualidade
[O que define que a tarefa foi bem feita]`);
        console.log(result);
        save(dir, `assign_${date}.md`, result);
        break;
      }

      case 'review': {
        const pipeline = getArg('pipeline', 'lean-waste');
        const result   = await ask(`${BASE}

PIPELINE REVISADO: ${pipeline}

Faça o REVIEW DO PIPELINE:

## Qualidade do Output

### Research
[O brief foi suficientemente específico?]

### Copy
[O hook é forte? O CTA é claro? A linguagem é natural?]

### Design
[O layout segue os brand tokens? O visual é impactante?]

### Video
[O roteiro tem hook nos primeiros 3s? A duração está correta?]

### Distribution
[Os horários estão corretos? As hashtags são relevantes?]

## Score Geral do Pipeline
[0-100 — o que passou e o que precisa melhorar]

## Aprovação
[Aprovar / Reprovar / Aprovar com ajustes]

## Feedback para Cada Agente
[Uma linha de melhoria por agente]`);
        console.log(result);
        save(dir, `review_${pipeline}_${date}.md`, result);
        break;
      }

      case 'weekly': {
        const result = await ask(`${BASE}

Crie o PLANEJAMENTO SEMANAL COMPLETO dos agentes:

# Planejamento Semanal — Semana de ${date}

## Objetivo da Semana
[O que a SmartOps precisa atingir esta semana — foco em receita]

## Temas do Pipeline de Conteúdo
| Dia | Tema | Ângulo | Canal Principal |
|-----|------|--------|----------------|
| Terça | | | |
| Quinta | | | |
| Sábado | | | |

## Prioridades por Squad
${Object.keys(CONFIG.squads).map(s => `### Squad ${s}: [prioridade da semana]`).join('\n')}

## Quick Wins da Semana
[3 ações de alto impacto e baixo esforço]

## Risco da Semana
[O que pode dar errado e plano de contingência]

## Meta Numérica
[Leads / Reuniões / Receita esperada]`);
        console.log(result);
        save(dir, `weekly_plan_${date}.md`, result);
        break;
      }

      case 'status': {
        const result = await ask(`${BASE}

Gere o STATUS ATUAL do sistema SmartOps IA:

# System Status — ${date}

## Pipeline de Conteúdo
[Último conteúdo publicado, próximo agendado, status]

## Agentes por Status
| Agente | Status | Último Run | Próximo Run | Alert |
|--------|--------|-----------|------------|-------|

## Squads Health
${Object.entries(CONFIG.squads).map(([s, agents]) => `### Squad ${s}: ${agents.length} agentes
Status: [verde/amarelo/vermelho]`).join('\n')}

## Alertas Ativos
[Problemas identificados que precisam de atenção]

## Métricas do Sistema
[Execuções hoje / Esta semana / Problemas / Uptime]`);
        console.log(result);
        save(dir, `status_${date}.md`, result);
        break;
      }

      case 'priority': {
        const result = await ask(`${BASE}

Defina as PRIORIDADES DO SISTEMA para hoje:

# Prioridades — ${date}

## URGENTE + IMPORTANTE (fazer agora)
[Max 3 items]

## IMPORTANTE (fazer hoje)
[Max 5 items]

## PODE ESPERAR (esta semana)
[Max 5 items]

## DELEGAR/AUTOMATIZAR
[O que pode ser automatizado ou delegado a um agente]

## Foco do CEO Breno (hoje)
[As 2-3 ações que só Breno pode fazer e têm maior ROI]`);
        console.log(result);
        save(dir, `priorities_${date}.md`, result);
        break;
      }

      case 'debrief': {
        const result = await ask(`${BASE}

Faça o DEBRIEF do período e gere aprendizados:

# Debrief — Semana de ${date}

## O que Funcionou Bem
[Top 3 sucessos — com motivo]

## O que Não Funcionou
[Top 3 falhas — com causa raiz]

## Aprendizados para o Sistema
[Como ajustar os agentes, o pipeline e a agenda]

## Mudanças no Playbook
[O que atualizar nas instruções dos agentes]

## Próxima Semana
[O que fazer diferente]`);
        console.log(result);
        save(dir, `debrief_${date}.md`, result);
        break;
      }

      case 'report': {
        const result = await ask(`${BASE}

# Orchestrator Report — Semanal

## Sistema Status
[Saúde geral do sistema de agentes]

## Pipeline de Conteúdo
[3 temas para esta semana + calendário]

## Prioridade dos Agentes (hoje)
[Quais agentes têm outputs mais críticos]

## Coordenação Entre Squads
[Algo que um squad precisa do outro esta semana]

## Otimização do Sistema
[Uma melhoria no orçamento ou coordenação]

## Decisão Para o Orquestrador
[Algo que precisa de atenção humana — não pode ser automatizado]`);
        console.log(result);
        save(dir, `orch_report_${date}.md`, result);
        break;
      }

      default:
        console.log('Modos: pipeline | brief | agenda | assign | review | weekly | status | priority | debrief | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch (e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
