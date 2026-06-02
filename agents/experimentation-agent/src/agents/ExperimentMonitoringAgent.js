// ExperimentMonitoringAgent.js — Monitora experimentos em andamento
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const { calcStatSignificance, calcUplift, detectExperimentBiases } = require('../scoring/iceScore');

const client = new Anthropic();

function checkExperimentHealth(experiment = {}) {
  const {
    name = 'Experimento', start_date, duration_days = 0,
    n_control = 0, conversions_control = 0,
    n_variant  = 0, conversions_variant  = 0,
    target_n_per_variant = 100,
  } = experiment;

  const progress_pct = Math.min(100, Math.round((Math.min(n_control, n_variant) / target_n_per_variant) * 100));
  const sig = n_control && n_variant ? calcStatSignificance({ n_control, conversions_control, n_variant, conversions_variant }) : null;
  const uplift = sig ? calcUplift(conversions_control / n_control, conversions_variant / n_variant) : null;
  const biases = detectExperimentBiases({ duration_days, n_control, n_variant, start_date });

  const days_remaining = start_date
    ? Math.max(0, 14 - Math.floor((Date.now() - new Date(start_date)) / 86400000))
    : null;

  const status =
    biases.biases.some(b => b.risk === 'alto') ? 'PAUSAR — viés alto detectado'
    : sig?.significant ? 'VENCEDOR DECLARADO'
    : progress_pct < 50 ? 'EM ANDAMENTO — coletar mais dados'
    : progress_pct >= 100 && !sig?.significant ? 'INCONCLUSIVO — amostra completa sem diferença'
    : 'EM ANDAMENTO';

  return {
    name,
    status,
    progress_pct,
    days_remaining,
    current_significance: sig?.confidence || 0,
    current_uplift_pct:   uplift?.uplift_pct || 0,
    current_winner:       sig?.winner || 'INCONCLUSIVO',
    biases:               biases.biases_found,
    ready_to_decide:      sig?.significant && !biases.biases.some(b => b.risk === 'alto'),
    action: sig?.significant ? 'Declarar vencedor e implementar'
      : progress_pct < 50 ? 'Aguardar — dados insuficientes'
      : 'Aguardar ou estender prazo',
    checked_at: new Date().toISOString(),
  };
}

function monitorExperimentPortfolio(experiments = []) {
  const monitored = experiments.map(e => checkExperimentHealth(e));
  return {
    total:           monitored.length,
    winners:         monitored.filter(e => e.status === 'VENCEDOR DECLARADO'),
    running:         monitored.filter(e => e.status.startsWith('EM ANDAMENTO')),
    needs_attention: monitored.filter(e => e.status.startsWith('PAUSAR')),
    inconclusive:    monitored.filter(e => e.status === 'INCONCLUSIVO — amostra completa sem diferença'),
    experiments:     monitored,
  };
}

async function generateMonitoringAlertWithClaude(portfolio) {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Você é o Experiment Monitoring Agent da SmartOps IA.

Portfolio de experimentos:
Total: ${portfolio.total}
Vencedores: ${portfolio.winners.length}
Em andamento: ${portfolio.running.length}
Precisam atenção: ${portfolio.needs_attention.length}
Inconclusivos: ${portfolio.inconclusive.length}

Detalhes:
${portfolio.experiments.map(e =>
  `[${e.status}] ${e.name} — ${e.progress_pct}% completo | uplift atual: ${e.current_uplift_pct}% | sig: ${e.current_significance}%`
).join('\n')}

Gere um monitoring report conciso:

# EXPERIMENT MONITORING — ${new Date().toISOString().split('T')[0]}

## STATUS GERAL
[semáforo: VERDE/AMARELO/VERMELHO] — [resumo em 1 linha]

## AÇÕES URGENTES
[O que decidir ou pausar AGORA]

## EXPERIMENTOS PRONTOS PARA DECISÃO
[Experimentos com vencedor — o que implementar]

## EXPERIMENTOS COM PROBLEMAS
[Viés ou outro problema — o que corrigir]

## EXPERIMENTOS SAUDÁVEIS
[Resumo dos que estão bem]

## PRÓXIMO CHECK
[Quando monitorar de novo]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { checkExperimentHealth, monitorExperimentPortfolio, generateMonitoringAlertWithClaude };
