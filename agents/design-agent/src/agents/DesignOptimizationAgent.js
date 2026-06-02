// DesignOptimizationAgent.js — Design Intelligence Agent (SmartOps IA)

const { COLORS } = require('../brand/brandTokens');

// Thresholds
const THRESHOLDS = {
  ctr_high:      3.0,
  ctr_low:       1.0,
  saves_high:    100,
  shares_high:   30,
  leads_high:    10,
  cpa_target:    60,
  carousel_retention: 70,
};

// Score a design based on performance metrics
function scoreDesign(metrics) {
  const { ctr, saves, shares, leads, cpa, carousel_retention } = metrics;
  let score = 50;

  if (ctr >= THRESHOLDS.ctr_high)             score += 20;
  else if (ctr < THRESHOLDS.ctr_low)          score -= 20;
  else                                          score += 5;

  if (saves && saves >= THRESHOLDS.saves_high) score += 10;
  if (shares && shares >= THRESHOLDS.shares_high) score += 8;
  if (leads && leads >= THRESHOLDS.leads_high) score += 15;

  if (cpa && cpa <= THRESHOLDS.cpa_target)    score += 15;
  else if (cpa && cpa > THRESHOLDS.cpa_target * 2) score -= 20;

  if (carousel_retention && carousel_retention >= THRESHOLDS.carousel_retention) score += 10;

  return Math.max(0, Math.min(100, score));
}

// Determine actions to take based on performance
function optimizeDesign(design, metrics) {
  const score   = scoreDesign(metrics);
  const status  = score >= 75 ? 'winner' : score >= 50 ? 'average' : 'loser';
  const actions = [];

  // CTR issues
  if (metrics.ctr < THRESHOLDS.ctr_low) {
    actions.push({ priority: 'P1', action: 'Trocar headline visual — criar 3 variações de hook mais agressivo' });
    actions.push({ priority: 'P1', action: 'Trocar thumbnail — testar versão com número grande' });
  }

  // CPA issues
  if (metrics.cpa && metrics.cpa > THRESHOLDS.cpa_target * 2) {
    actions.push({ priority: 'P1', action: 'Revisar CTA e oferta — testar versão WhatsApp click-to-chat' });
    actions.push({ priority: 'P2', action: 'Acionar CRO Agent — otimizar landing page' });
  }

  // Low engagement
  if (metrics.saves < 20 && metrics.shares < 5) {
    actions.push({ priority: 'P2', action: 'Reformular para formato carrossel educativo — gera mais salvamentos' });
  }

  // Carousel retention
  if (metrics.carousel_retention && metrics.carousel_retention < 40) {
    actions.push({ priority: 'P2', action: 'Encurtar carrossel — remover slides 4-5, ir direto para solução' });
  }

  // Winner
  if (score >= 75) {
    actions.push({ priority: 'P0', action: 'DESIGN VENCEDOR — criar 5 variações e transformar em template padrão' });
    if (metrics.ctr >= THRESHOLDS.ctr_high) {
      actions.push({ priority: 'P0', action: 'Adaptar para anúncio pago — enviar para Ads Agent' });
    }
  }

  return {
    design_id:   design.id || design.design_id,
    score,
    status,
    should_replicate: score >= 75,
    should_pause:     score < 25,
    next_variations:  score >= 75 ? '5 variações do criativo vencedor' : null,
    recommended_actions: actions.sort((a, b) => a.priority.localeCompare(b.priority)),
    generated_at: new Date().toISOString(),
  };
}

// Generate a learning entry from performance data
function generateLearning(design, metrics, outcome) {
  const score = scoreDesign(metrics);
  return {
    design_id:      design.id || design.design_id,
    template:       design.template || '',
    headline:       design.headline || '',
    visual_style:   design.visual_style || '',
    performance_score: score,
    metrics,
    outcome,        // 'winner' | 'average' | 'loser'
    insight:        score >= 75
                      ? `Layout "${design.template}" com headline "${design.headline}" gerou alto CTR — padrão a replicar`
                      : `Layout "${design.template}" com headline "${design.headline}" não performou — evitar padrão`,
    recommendation: score >= 75
                      ? 'Criar template a partir deste design e usar como padrão em campanhas similares'
                      : 'Testar headline mais curta e visual mais contrastante',
    created_at: new Date().toISOString(),
  };
}

module.exports = { scoreDesign, optimizeDesign, generateLearning, THRESHOLDS };
