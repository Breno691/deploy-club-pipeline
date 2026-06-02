// opportunityScore.js — Market Opportunity Intelligence Agent
const { CONFIG } = require('../config');

// Score an opportunity 0–100
function scoreOpportunity(opportunity) {
  const weights = CONFIG.scoringWeights;
  const {
    pain_score         = 5,   // 0-10
    fit_with_smartops  = 5,
    payment_capacity   = 5,
    low_competition    = 5,
    geo_proximity      = 5,
    decision_maker_access = 5,
    roi_potential      = 5,
    case_potential     = 5,
    referral_potential = 5,
  } = opportunity;

  const raw =
    (pain_score          / 10) * weights.painStrength         +
    (fit_with_smartops   / 10) * weights.fitWithSmartOps      +
    (payment_capacity    / 10) * weights.paymentCapacity       +
    (low_competition     / 10) * weights.lowCompetition        +
    (geo_proximity       / 10) * weights.geoProximity          +
    (decision_maker_access/10) * weights.decisionMakerAccess   +
    (roi_potential       / 10) * weights.roiPotential          +
    (case_potential      / 10) * weights.casePotential         +
    (referral_potential  / 10) * weights.referralPotential;

  return Math.round(raw);
}

// Classify by score
function classifyOpportunity(score) {
  const c = CONFIG.classification;
  if (score >= c.attack.min)  return { ...c.attack,  score };
  if (score >= c.test.min)    return { ...c.test,    score };
  if (score >= c.monitor.min) return { ...c.monitor, score };
  return { ...c.skip, score };
}

// Build a scored opportunity object from sector data
function buildOpportunityFromSector(sectorId, sectorData, geo = 'Belo Horizonte') {
  const proximity = CONFIG.geography.primary.includes(geo) ? 10 : 6;
  const opportunity = {
    opportunity_id: `opp-${sectorId}-${geo.replace(/\s/g, '-').toLowerCase()}`,
    sector:         sectorId,
    location:       geo,
    main_pain:      (sectorData.main_pains || [])[0] || '',
    offer_match:    (sectorData.offers || [])[0] || 'diagnostico-gratuito',
    expected_ticket: sectorData.avg_ticket_brl || 10000,

    // Scoring dimensions (0-10)
    pain_score:           sectorData.pain_score || 5,
    fit_with_smartops:    Math.round((sectorData.lean_fit + sectorData.automation_fit) / 2),
    payment_capacity:     sectorData.payment_capacity || 5,
    low_competition:      7,     // default — update from competition analysis
    geo_proximity:        proximity,
    decision_maker_access: 7,
    roi_potential:        8,
    case_potential:       6,
    referral_potential:   7,
  };

  const score        = scoreOpportunity(opportunity);
  const classification = classifyOpportunity(score);
  return { ...opportunity, score, ...classification };
}

// Rank a list of opportunities
function rankOpportunities(opportunities) {
  return [...opportunities].sort((a, b) => b.score - a.score);
}

module.exports = { scoreOpportunity, classifyOpportunity, buildOpportunityFromSector, rankOpportunities };
