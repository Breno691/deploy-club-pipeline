#!/usr/bin/env node
/**
 * Growth Intelligence Agent — SmartOps IA
 * AARRR: Aquisição, Ativação, Retenção, Receita, Referral
 *
 * Usage:
 *   node growth_intelligence_agent.js --mode aarrr
 *   node growth_intelligence_agent.js --mode acquisition
 *   node growth_intelligence_agent.js --mode experiment --hipotese "landing page com CTA diferente"
 *   node growth_intelligence_agent.js --mode channel --canal google-ads
 *   node growth_intelligence_agent.js --mode north-star
 *   node growth_intelligence_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }

function calcICE(impact, confidence, ease) { return Math.round(impact * confidence * ease / 100); }
function calcChannelScore(cpl, conv_rate, ticket_medio = 5000) {
  const ltv_est = ticket_medio * 2;
  const cac = cpl / conv_rate;
  const ltv_cac = ltv_est / cac;
  return { cac: Math.round(cac), ltv_cac: ltv_cac.toFixed(1), viable: ltv_cac >= 3 };
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir = path.join(__dirname, 'outputs', `growth_${date}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return { dir, date };
}
function save(dir, fn, c) { const p = path.join(dir, fn); fs.writeFileSync(p, typeof c === 'string' ? c : JSON.stringify(c, null, 2), 'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r = await client.messages.create({ model: CONFIG.claude.model, max_tokens: CONFIG.claude.maxTokens, messages: [{ role: 'user', content: prompt }] }); return r.content[0].text; }

const BASE = `Você é o Growth Intelligence Agent da SmartOps IA — estrategista de crescimento focado em AARRR.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH/MG.
Meta: R$50.000 MRR | North Star: ${CONFIG.north_star.metrica} | Meta atual: ${CONFIG.north_star.meta}/mês

CANAIS DE AQUISIÇÃO:
${Object.entries(CONFIG.channels).map(([k, v]) => `- ${k}: CPL est. R$${v.cpl_est_brl} | conv ${(v.conv_rate*100).toFixed(0)}% | escala ${v.escala} | ${v.status}`).join('\n')}

ALAVANCAS PRIORITÁRIAS:
${CONFIG.growth_levers.map(l => `- [${l.status}] ${l.alavanca}: impacto ${l.impacto}/10 | esforço ${l.esforco}/10`).join('\n')}

REGRAS:
- Toda hipótese de crescimento precisa de: ICE Score + métrica de sucesso + prazo
- Priorizar canais com CAC < R$500 e LTV/CAC > 3
- Crescimento sem retenção é balde furado`;

async function main() {
  const mode = getArg('mode', 'report');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  GROWTH INTELLIGENCE AGENT — SmartOps IA        ║');
  console.log('║  "Crescimento sem dado é achismo."              ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();

  try {
    switch (mode) {

      case 'aarrr': {
        console.log('\n📊 Score de Canais (calculado localmente):');
        Object.entries(CONFIG.channels).forEach(([k, v]) => {
          const score = calcChannelScore(v.cpl_est_brl, v.conv_rate);
          console.log(`  ${k}: CAC R$${score.cac} | LTV/CAC ${score.ltv_cac} | Viável: ${score.viable ? '✅' : '❌'}`);
        });
        const result = await ask(`${BASE}

Analise o FUNIL AARRR completo da SmartOps IA:

# AARRR — Diagnóstico Completo SmartOps IA

## ACQUISITION (Aquisição)
Metas: ${CONFIG.aarrr.acquisition.meta}
KPIs: ${CONFIG.aarrr.acquisition.kpis.join(', ')}
[Status atual, principais gaps, ação prioritária]

## ACTIVATION (Ativação)
Metas: ${CONFIG.aarrr.activation.meta}
KPIs: ${CONFIG.aarrr.activation.kpis.join(', ')}
[O que define ativação para SmartOps, taxa atual, como melhorar]

## RETENTION (Retenção)
Metas: ${CONFIG.aarrr.retention.meta}
KPIs: ${CONFIG.aarrr.retention.kpis.join(', ')}
[Estratégias de retenção para consultoria B2B]

## REFERRAL (Indicação)
Metas: ${CONFIG.aarrr.referral.meta}
KPIs: ${CONFIG.aarrr.referral.kpis.join(', ')}
[Programa de indicação: como estruturar]

## REVENUE (Receita)
Metas: ${CONFIG.aarrr.revenue.meta}
KPIs: ${CONFIG.aarrr.revenue.kpis.join(', ')}
[Modelo de receita, mix ideal, expansão]

## Gargalo Principal
[Em qual etapa do funil a SmartOps está perdendo mais oportunidade]

## Plano de 30 dias (foco no gargalo)
[3 ações concretas para resolver o gargalo principal]`);
        console.log(result);
        save(dir, `aarrr_${date}.md`, result);
        break;
      }

      case 'acquisition': {
        const levers = CONFIG.growth_levers.map(l => `${l.alavanca}: ICE=${calcICE(l.impacto, 7, 10-l.esforco)}`);
        console.log('\n📊 ICE Scores das Alavancas:');
        CONFIG.growth_levers.forEach(l => console.log(`  ICE ${calcICE(l.impacto, 7, 10-l.esforco)} | ${l.alavanca} [${l.status}]`));
        const result = await ask(`${BASE}

ALAVANCAS RANKEADAS: ${levers.join(' | ')}

# Estratégia de Aquisição — SmartOps IA

## Canal de Maior Impacto Agora
[O canal com melhor ROI dado o estágio atual — argumento baseado em dados]

## Plano de Aquisição por Canal

### Google Ads Local (keywords: "consultoria lean BH", "automação processos BH")
[Budget mínimo, configuração, bid strategy, landing page]

### Instagram Orgânico
[Frequência, formatos, estratégia de crescimento de base]

### Parcerias (contadores, ERPs, associações)
[Como abordar, proposta de valor, comissão]

### Indicação
[Programa: R$X por indicação convertida, como ativar]

## Quick Win de Aquisição (esta semana)
[Uma ação de aquisição com resultado em < 7 dias]

## Meta 90 dias
[Leads, reuniões, clientes, receita — por canal]`);
        console.log(result);
        save(dir, `acquisition_${date}.md`, result);
        break;
      }

      case 'activation': {
        const result = await ask(`${BASE}

# Estratégia de Ativação — SmartOps IA

## O que Define Ativação para a SmartOps IA
[O momento "aha!" — quando o lead se torna prospecto qualificado]

## Funil de Ativação Atual
Lead → [etapas] → Reunião marcada → [etapas] → Proposta enviada → Cliente

## Gargalos de Ativação
[Onde os leads estão travando antes de virar reunião]

## Estratégias para Aumentar Taxa de Ativação

### Antes da Reunião
[Como aquecer o lead, material de autoridade, sequência de follow-up]

### Na Reunião
[Roteiro que maximiza conversão de reunião em proposta]

### Após a Reunião
[Sequência de follow-up, material de reforço]

## Automações de Ativação
[Como automatizar o processo de ativação com n8n]

## Meta
Taxa de reunião/lead: ${CONFIG.aarrr.activation.meta}`);
        console.log(result);
        save(dir, `activation_${date}.md`, result);
        break;
      }

      case 'retention': {
        const result = await ask(`${BASE}

# Estratégia de Retenção de Clientes — SmartOps IA

## Por que Retenção é Prioridade
[LTV vs CAC — custo de adquirir vs manter]

## Jornada do Cliente SmartOps (pós-fechamento)
[Mapa de touchpoints: kickoff → entrega → renovação → upsell]

## Mecanismos de Retenção

### Sucesso do Cliente
[Check-ins, relatórios de progresso, celebração de marcos]

### Entrega de Valor Contínuo
[Como entregar valor além do escopo contratado]

### Expansão de Contrato
[Gatilhos para upsell: quando e como propor]

### Alerta de Churn
[Sinais de que um cliente está em risco + ação imediata]

## Métricas de Retenção
[NPS, churn rate, expansion revenue — como medir]

## Programa de Fidelidade
[O que oferecer a clientes de longo prazo]`);
        console.log(result);
        save(dir, `retention_${date}.md`, result);
        break;
      }

      case 'referral': {
        const result = await ask(`${BASE}

# Programa de Indicação — SmartOps IA

## Modelo de Indicação Recomendado
[Estrutura: quem indica, quem pode ser indicado, recompensa]

## Proposta de Valor para o Indicador
[Por que indicar a SmartOps é bom para o indicador]

## Mecânica do Programa
[Como registrar, rastrear, pagar, comunicar]

## Parceiros Estratégicos para Indicação
[Contadores, advogados empresariais, ERPs, associações empresariais BH]

## Script de Abordagem para Pedir Indicação
[Como Breno pede indicação sem parecer desesperado]

## Automação do Programa
[Como automatizar tracking e pagamento via n8n]

## Meta: ${CONFIG.aarrr.referral.meta}
[Como chegar lá em 90 dias]`);
        console.log(result);
        save(dir, `referral_${date}.md`, result);
        break;
      }

      case 'revenue': {
        const result = await ask(`${BASE}

# Estratégia de Revenue Growth — SmartOps IA

## Mix de Receita Atual vs Ideal
[Projetos vs recorrente vs produtos — onde estamos e onde queremos chegar]

## Alavancas de Crescimento de Receita

### Aumentar Ticket Médio
[Estratégias de upsell, anchor pricing, bundling]

### Aumentar Volume de Clientes
[Meta: X novos clientes/mês]

### Receita Recorrente
[Como converter projetos em retainer — proposta de valor]

### Novos Fluxos de Receita
[Produtos digitais, treinamentos, licença de método]

## Modelo Financeiro (12 meses)
| Mês | Clientes | Ticket Médio | MRR | ARR |
|-----|---------|-------------|-----|-----|

## Decisão de Pricing
[O que mudar no pricing para chegar em R$50k MRR mais rápido]`);
        console.log(result);
        save(dir, `revenue_growth_${date}.md`, result);
        break;
      }

      case 'experiment': {
        const hipotese = getArg('hipotese', 'landing page com CTA diferente converte mais');
        const ice = calcICE(7, 6, 5);
        console.log(`\n📊 ICE Score estimado: ${ice}`);
        const result = await ask(`${BASE}

HIPÓTESE: ${hipotese}
ICE SCORE ESTIMADO: ${ice}

# Experimento de Growth

## Hipótese Estruturada
"Se [fizermos X], então [esperamos Y], porque [razão Z]"
[Formatar a hipótese corretamente]

## Design do Experimento
**Variável de teste:** [o que muda]
**Grupo de controle:** [o que fica igual]
**Duração:** [mínimo ${CONFIG.experiments.min_sample} conversões ou ${CONFIG.experiments.test_duration_days} dias]
**Amostra mínima:** [cálculo]

## Métricas de Sucesso
**Primária:** [o que define sucesso]
**Secundárias:** [métricas de suporte]
**Guardrails:** [o que não pode piorar]

## Implementação
[Como executar — passo a passo]

## Análise dos Resultados
[Como analisar e tomar decisão]

## Próximo Experimento (se validar)
[O que testar depois`);
        console.log(result);
        save(dir, `experiment_${date}.md`, result);
        break;
      }

      case 'channel': {
        const canal = getArg('canal', 'google-ads');
        const chInfo = CONFIG.channels[canal.replace('-','_')] || CONFIG.channels.google_ads_local;
        const score = calcChannelScore(chInfo.cpl_est_brl, chInfo.conv_rate);
        console.log(`\n📊 ${canal}: CAC R$${score.cac} | LTV/CAC ${score.ltv_cac} | Viável: ${score.viable ? '✅' : '❌'}`);
        const result = await ask(`${BASE}

CANAL: ${canal}
CPL Estimado: R$${chInfo.cpl_est_brl} | Conv. Rate: ${(chInfo.conv_rate*100).toFixed(0)}% | Escala: ${chInfo.escala}
CAC calculado: R$${score.cac} | LTV/CAC: ${score.ltv_cac}

# Análise do Canal: ${canal.toUpperCase()}

## Diagnóstico
[Por que este canal é ou não viável para SmartOps neste momento]

## Estratégia de Ativação do Canal
[Como começar com budget mínimo e testar viabilidade]

## Configuração Recomendada
[Setup específico: targeting, criativo, landing page, orçamento inicial]

## KPIs de Monitoramento
[O que acompanhar nos primeiros 30 dias]

## Quando Escalar / Quando Cortar
[Thresholds de decisão baseados em CAC e LTV/CAC]

## Budget Sugerido (por fase)
Fase de teste: R$X | Fase de escala: R$X | Break-even: R$X`);
        console.log(result);
        save(dir, `channel_${canal.replace(/[^a-z0-9]/gi,'_')}_${date}.md`, result);
        break;
      }

      case 'north-star': {
        const ns = CONFIG.north_star;
        console.log(`\n⭐ North Star: ${ns.metrica} | Meta: ${ns.meta}/mês | Atual: ${ns.atual}/mês`);
        const result = await ask(`${BASE}

NORTH STAR: ${ns.metrica}
PROXY: ${ns.proxy}
META: ${ns.meta}/mês | ATUAL: ${ns.atual}/mês

# North Star Metric — SmartOps IA

## Por que Esta é a North Star Certa
[Justificativa: conecta direto ao valor para o cliente e para a empresa]

## Decomposição da North Star
North Star = [input 1] × [input 2] × [input 3]
[Como cada alavanca contribui]

## Input Metrics (métricas de input que movem a North Star)
| Input | Atual | Meta 30d | Meta 90d | Ação |
|-------|-------|---------|---------|------|

## Roadmap para Atingir a Meta
[Semana a semana por 90 dias]

## O que NÃO Medir (vanity metrics)
[O que parece importante mas não move a North Star]`);
        console.log(result);
        save(dir, `north_star_${date}.md`, result);
        break;
      }

      case 'report': {
        const result = await ask(`${BASE}

# Growth Intelligence Report — Semanal

## Status do Funil AARRR
| Etapa | KPI | Meta | Status |
|-------|-----|------|--------|

## Maior Oportunidade de Crescimento Esta Semana
[A alavanca de maior impacto que ainda não foi ativada]

## Experimento Recomendado
[Uma hipótese de crescimento para testar esta semana — ICE score]

## Canal Para Ativar
[O próximo canal a testar baseado em custo de aquisição]

## North Star: ${CONFIG.north_star.metrica}
Meta: ${CONFIG.north_star.meta}/mês | Progresso: [X%]

## Decisão Para o CEO
[Uma decisão de growth que Breno deve tomar esta semana]`);
        console.log(result);
        save(dir, `growth_report_${date}.md`, result);
        break;
      }

      default:
        console.log('Modos: aarrr | acquisition | activation | retention | referral | revenue | experiment | channel | north-star | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch (e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
