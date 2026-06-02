#!/usr/bin/env node
/**
 * Lead Scoring Agent — SmartOps IA
 * Qualificação, priorização e scoring de leads por BANT + ICP
 *
 * Usage:
 *   node lead_scoring_agent.js --mode score --nome "Empresa X" --setor industria --funcionarios 50 --budget medio --authority decisor --need critico --timeline imediato
 *   node lead_scoring_agent.js --mode qualify --lead "Dono de distribuidora, 30 funcionários, BH"
 *   node lead_scoring_agent.js --mode icp
 *   node lead_scoring_agent.js --mode pipeline
 *   node lead_scoring_agent.js --mode followup --lead "Lead B com 3 dias sem resposta"
 *   node lead_scoring_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }

function calcBANTScore(budget_key, authority_key, need_key, timeline_key) {
  const b = CONFIG.bant.budget.criterios[budget_key]?.score || 0;
  const a = CONFIG.bant.authority.criterios[authority_key]?.score || 0;
  const n = CONFIG.bant.need.criterios[need_key]?.score || 0;
  const t = CONFIG.bant.timeline.criterios[timeline_key]?.score || 0;
  return b + a + n + t;
}

function classifyLead(score) {
  if (score >= CONFIG.thresholds.A.min) return { ...CONFIG.thresholds.A, score };
  if (score >= CONFIG.thresholds.B.min) return { ...CONFIG.thresholds.B, score };
  if (score >= CONFIG.thresholds.C.min) return { ...CONFIG.thresholds.C, score };
  return { ...CONFIG.thresholds.D, score };
}

function isICP(setor, funcionarios, localizacao) {
  const setorOk = CONFIG.icp.segmentos.some(s => setor?.toLowerCase().includes(s.toLowerCase()));
  const sizeOk = funcionarios >= CONFIG.icp.funcionarios.min && funcionarios <= CONFIG.icp.funcionarios.max;
  const locOk = !localizacao || CONFIG.icp.localizacao.some(l => localizacao.toLowerCase().includes(l.toLowerCase()));
  return { setorOk, sizeOk, locOk, isICP: setorOk && sizeOk };
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir = path.join(__dirname, 'outputs', `leads_${date}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return { dir, date };
}
function save(dir, fn, c) { const p = path.join(dir, fn); fs.writeFileSync(p, typeof c === 'string' ? c : JSON.stringify(c, null, 2), 'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r = await client.messages.create({ model: CONFIG.claude.model, max_tokens: CONFIG.claude.maxTokens, messages: [{ role: 'user', content: prompt }] }); return r.content[0].text; }

const BASE = `Você é o Lead Scoring Agent da SmartOps IA — especialista em qualificação e priorização de leads.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH/MG.

ICP SmartOps IA:
Segmentos: ${CONFIG.icp.segmentos.join(', ')}
Porte: ${CONFIG.icp.funcionarios.min}-${CONFIG.icp.funcionarios.max} funcionários
Faturamento mínimo: R$${CONFIG.icp.faturamento_min_brl.toLocaleString('pt-BR')}
Localização: ${CONFIG.icp.localizacao.join(', ')}
Decisores: ${CONFIG.icp.perfil_decisor.join(', ')}

CLASSIFICAÇÃO BANT:
A (≥80): ${CONFIG.thresholds.A.acao}
B (60-79): ${CONFIG.thresholds.B.acao}
C (40-59): ${CONFIG.thresholds.C.acao}
D (<40): ${CONFIG.thresholds.D.acao}

DESQUALIFICADORES AUTOMÁTICOS: ${CONFIG.disqualifiers.join(' | ')}`;

async function main() {
  const mode = getArg('mode', 'report');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  LEAD SCORING AGENT — SmartOps IA               ║');
  console.log('║  "Priorize quem vai comprar."                   ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();

  try {
    switch (mode) {

      case 'score': {
        const budget     = getArg('budget', 'medio');
        const authority  = getArg('authority', 'influencer');
        const need       = getArg('need', 'alto');
        const timeline   = getArg('timeline', 'curto');
        const nome       = getArg('nome', 'Lead Anônimo');
        const setor      = getArg('setor', 'servicos');
        const func       = parseInt(getArg('funcionarios', '20'));

        const score      = calcBANTScore(budget, authority, need, timeline);
        const lead       = classifyLead(score);
        const icp        = isICP(setor, func, 'BH');

        console.log(`\n📊 SCORE BANT (calculado localmente):`);
        console.log(`  Budget (${budget}):    ${CONFIG.bant.budget.criterios[budget]?.score || 0} pts`);
        console.log(`  Authority (${authority}): ${CONFIG.bant.authority.criterios[authority]?.score || 0} pts`);
        console.log(`  Need (${need}):       ${CONFIG.bant.need.criterios[need]?.score || 0} pts`);
        console.log(`  Timeline (${timeline}): ${CONFIG.bant.timeline.criterios[timeline]?.score || 0} pts`);
        console.log(`  ─────────────────────────────────`);
        console.log(`  TOTAL: ${score}/100 → ${lead.label}`);
        console.log(`  ICP: ${icp.isICP ? '✅' : '❌'} (setor: ${icp.setorOk}, porte: ${icp.sizeOk})`);
        console.log(`  AÇÃO: ${lead.acao}`);

        const result = await ask(`${BASE}

LEAD: ${nome}
SETOR: ${setor} | FUNCIONÁRIOS: ${func} | LOCALIZAÇÃO: BH
SCORE BANT: ${score}/100 → ${lead.label}
ICP: ${icp.isICP ? '✅ SIM' : '❌ NÃO'} (setor: ${icp.setorOk ? 'OK' : 'Fora'}, porte: ${icp.sizeOk ? 'OK' : 'Fora'})

## Análise do Lead

### Diagnóstico
[Leitura qualitativa dos dados — o que eles indicam]

### Pontos Fortes do Lead
[O que o favorece para o fechamento]

### Pontos de Atenção
[O que pode dificultar ou demorar]

### Plano de Ação
[O que fazer nas próximas 24h / 7 dias / 30 dias]

### Mensagem de Abertura Recomendada
[Texto exato para WhatsApp ou email — personalizado para este lead]

### Próxima Reunião
[Como propor a reunião diagnóstica de forma natural]`);
        console.log(result);
        const output = { nome, setor, funcionarios: func, bant: { budget, authority, need, timeline }, score, classificacao: lead.label, acao: lead.acao, isICP: icp.isICP, analise: result };
        save(dir, `lead_${nome.replace(/\s/g,'_')}_${date}.json`, output);
        break;
      }

      case 'qualify': {
        const lead = getArg('lead', 'dono de empresa, BH, 20 funcionários');
        const result = await ask(`${BASE}

DESCRIÇÃO DO LEAD: ${lead}

## Qualificação Completa

### Avaliação de ICP
[Setor, porte, localização, decisor — encaixa no ICP?]

### Análise BANT Estimada
Budget: [estimativa baseada no perfil]
Authority: [quem provavelmente decide]
Need: [dor provável baseada no setor/porte]
Timeline: [urgência estimada]

**Score Estimado:** [X]/100 → [classificação]

### Perguntas de Qualificação
[5 perguntas para fazer na 1ª conversa para confirmar BANT]

### Red Flags
[Sinais de que este lead pode não ser qualificado]

### Próximos Passos
[Ação imediata + o que preparar para a reunião]`);
        console.log(result);
        save(dir, `qualify_${date}.md`, result);
        break;
      }

      case 'icp': {
        const result = await ask(`${BASE}

Descreva o ICP COMPLETO da SmartOps IA e como usá-lo:

# ICP — Ideal Customer Profile — SmartOps IA

## Perfil Demográfico
${JSON.stringify(CONFIG.icp, null, 2)}

## Perfil Psicográfico
[Mentalidade, crenças, objetivos do dono de PME ideal]

## Dores Específicas (com exemplos reais do mercado BH)
${CONFIG.icp.dores.map(d => `- ${d}: [como se manifesta em empresa de 20-100 funcionários]`).join('\n')}

## O que os Faz Comprar
[Gatilhos de decisão de compra para este perfil]

## O que os Impede de Comprar
[Objeções mais comuns — com resposta]

## Como Encontrá-los
[Canais, eventos, grupos, associações em BH]

## Exemplo de Lead Ideal (persona detalhada)
[Nome fictício + empresa + situação + como chegou até a SmartOps]`);
        console.log(result);
        save(dir, `icp_guide_${date}.md`, result);
        break;
      }

      case 'pipeline': {
        const result = await ask(`${BASE}

Analise e estruture o PIPELINE DE VENDAS da SmartOps IA:

# Pipeline de Vendas — SmartOps IA

## Estágios do Pipeline
| Estágio | Critério de Entrada | Ação Principal | SLA | Taxa de Conv. Meta |
|---------|--------------------|--------------|----|-------------------|
| Novo Lead | | | 24h | |
| Qualificado | | | 48h | |
| Reunião Marcada | | | 7 dias | |
| Proposta Enviada | | | 5 dias | |
| Em Negociação | | | 10 dias | |
| Fechado/Perdido | | | — | |

## Velocidade do Pipeline
[Tempo médio em cada estágio e onde está o gargalo]

## Alertas de Pipeline
[Lead parado > X dias → alerta | Proposta sem resposta > Y dias → ação]

## Forecast Semanal
[Como fazer forecast realista com pipeline atual]

## Ações de Aquecimento de Pipeline
[O que fazer com leads frios antes de descartá-los]`);
        console.log(result);
        save(dir, `pipeline_${date}.md`, result);
        break;
      }

      case 'prioritize': {
        const result = await ask(`${BASE}

Crie o SISTEMA DE PRIORIZAÇÃO DE LEADS para a SmartOps IA:

# Priorização de Leads — Framework

## Matriz de Prioridade
| Score | ICP | Urgência | Prioridade | Ação |
|-------|-----|---------|-----------|------|
| 80+ | Sim | Alta | P1 — Ligar hoje | |
| 80+ | Não | Alta | P2 — Avaliar caso a caso | |
| 60-79 | Sim | Média | P2 — Follow-up 24h | |
| 40-59 | Sim | Baixa | P3 — Nurture | |
| <40 | Qualquer | Qualquer | P4 — Arquivar | |

## Rotina Semanal de Priorização (toda segunda-feira)
[O que fazer com cada grupo no início da semana]

## Como Usar o Score na Prática
[Exemplo de conversa: lead entra → score em 5 min → ação imediata]

## Criação de Urgência (para leads B)
[Como acelerar o processo de decisão de forma ética]`);
        console.log(result);
        save(dir, `prioritize_${date}.md`, result);
        break;
      }

      case 'followup': {
        const leadInfo = getArg('lead', 'Lead B, 3 dias sem resposta após envio de proposta');
        const result   = await ask(`${BASE}

SITUAÇÃO DO LEAD: ${leadInfo}

## Estratégia de Follow-up

### Diagnóstico
[Por que provavelmente não respondeu]

### Sequência de Follow-up

**Mensagem 1 — Hoje (WhatsApp)**
[Texto exato — curto, natural, sem pressão]

**Mensagem 2 — Em 2 dias (Email)**
[Assunto + corpo — agregando valor novo]

**Mensagem 3 — Em 5 dias (WhatsApp)**
[Última tentativa — break-up message]

### O que EVITAR
[Mensagens de pressão, cobranças, "só passando para verificar"]

### Quando Desistir
[Depois de X tentativas em Y dias, arquivar e retornar em Z dias]

### Como Reativar um Lead Frio (45+ dias)
[Abordagem para leads arquivados que voltam no radar]`);
        console.log(result);
        save(dir, `followup_${date}.md`, result);
        break;
      }

      case 'segment': {
        const result = await ask(`${BASE}

Crie a SEGMENTAÇÃO COMPLETA da base de leads da SmartOps IA:

## Segmentos por Setor
${CONFIG.icp.segmentos.map(s => `### ${s}
[Dor típica | Serviço ideal | Ticket médio | Como abordar]`).join('\n\n')}

## Segmentos por Porte
[Micro 1-10 | Pequena 11-50 | Média 51-200 — abordagem para cada]

## Segmentos por Maturidade Operacional
[Caótico | Reativo | Definido — mensagem para cada nível]

## Mensagens por Segmento
[Como personalizar o pitch para cada combinação]`);
        console.log(result);
        save(dir, `segmentacao_${date}.md`, result);
        break;
      }

      case 'nurture': {
        const segmento = getArg('segmento', 'Lead C — frio');
        const result = await ask(`${BASE}

SEGMENTO: ${segmento}
SEQUÊNCIA DE NURTURE: ${JSON.stringify(CONFIG.nurture_sequences.C)}

## Plano de Nurture

### Objetivo
[Transformar lead frio em quente ao longo do tempo]

### Frequência
[Com que frequência entrar em contato sem incomodar]

### Conteúdo de Nurture (8 semanas)
| Semana | Canal | Conteúdo | Objetivo |
|--------|-------|---------|---------|

### Gatilhos de Requalificação
[Eventos que indicam que o lead está pronto para avançar]

### Automação do Nurture
[Como automatizar com n8n + WhatsApp/Email]`);
        console.log(result);
        save(dir, `nurture_${segmento.replace(/\s/g,'_')}_${date}.md`, result);
        break;
      }

      case 'convert': {
        const result = await ask(`${BASE}

Crie o PLAYBOOK DE CONVERSÃO para leads qualificados:

## Roteiro da Reunião Diagnóstica (45 min)

**[0-5min] Abertura e Rapport**
[O que dizer, como criar conexão]

**[5-20min] Diagnóstico**
Perguntas: ${CONFIG.icp.dores.slice(0,4).map(d => `"Como vocês lidam com ${d}?"`).join(' | ')}

**[20-30min] Apresentação do Valor**
[Como apresentar a SmartOps sem parecer vendedor]

**[30-40min] Proposta de Próximo Passo**
[Como fechar o diagnóstico pago ou proposta]

**[40-45min] Compromisso e Próximo Passo**
[Calendário, prazo, responsável]

## Resposta às 5 Objeções Mais Comuns
1. "Está caro" → [resposta]
2. "Vou pensar" → [resposta]
3. "Não é o momento" → [resposta]
4. "Já tentei consultoria antes" → [resposta]
5. "Deixa eu ver com meu sócio" → [resposta]`);
        console.log(result);
        save(dir, `convert_playbook_${date}.md`, result);
        break;
      }

      case 'report': {
        const result = await ask(`${BASE}

# Lead Scoring Report — Semanal

## Resumo do Pipeline
[Status de cada estágio com estimativa de receita]

## Lead da Semana
[O lead mais promissor e plano de ação]

## Leads em Risco
[Quem pode cair do funil e o que fazer]

## Score Médio dos Leads Esta Semana
[Qualidade do pipeline — subindo ou caindo?]

## Próximas Ações (esta semana)
| Lead | Score | Ação | Prazo |
|------|-------|------|-------|

## Insight de Qualificação
[Uma lição sobre qualificação de leads para melhorar o processo]`);
        console.log(result);
        save(dir, `leads_report_${date}.md`, result);
        break;
      }

      default:
        console.log('Modos: score | qualify | icp | pipeline | prioritize | followup | segment | nurture | convert | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch (e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
