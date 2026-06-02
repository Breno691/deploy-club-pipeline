// Tech Radar Schema — AI Lab Intelligence Agent

const RADAR_STATUSES = ['adopt', 'trial', 'assess', 'hold'];

const RADAR_CATEGORIES = [
  'llm', 'agent-framework', 'automation', 'rag-knowledge',
  'video-voice', 'design', 'analytics', 'marketing',
  'sales', 'client-delivery', 'infrastructure',
];

const RADAR_ITEM_SCHEMA = {
  id:           '',
  name:         '',
  category:     '',           // from RADAR_CATEGORIES
  status:       'assess',     // from RADAR_STATUSES
  version:      '',
  url:          '',
  description:  '',
  why_it_matters: '',
  use_case_smartops:   '',
  use_case_clients:    '',
  estimated_roi:       '',    // 'alto' | 'médio' | 'baixo'
  risk:                '',    // 'baixo' | 'médio' | 'alto'
  cost:                '',
  integration_effort:  '',    // 'baixo' | 'médio' | 'alto'
  maturity:            '',    // 'experimental' | 'growing' | 'mature'
  next_action:         '',
  related_agents:      [],    // SmartOps agents that could benefit
  score:               0,
  evaluated_at:        '',
  evaluated_by:        'AI Lab Agent',
};

// Build a radar item from raw data
function buildRadarItem(raw, score) {
  const { CONFIG } = require('../config');
  const status = score >= CONFIG.radar.ADOPT.threshold ? 'adopt'
               : score >= CONFIG.radar.TRIAL.threshold ? 'trial'
               : score >= CONFIG.radar.ASSESS.threshold ? 'assess'
               : 'hold';

  return {
    ...RADAR_ITEM_SCHEMA,
    ...raw,
    score,
    status,
    evaluated_at: new Date().toISOString(),
  };
}

// Validate a radar item
function validateRadarItem(item) {
  const required = ['name', 'category', 'use_case_smartops'];
  const missing  = required.filter(f => !item[f]);
  if (missing.length > 0) throw new Error(`Radar item missing: ${missing.join(', ')}`);
  if (!RADAR_CATEGORIES.includes(item.category)) {
    throw new Error(`Unknown category: ${item.category}`);
  }
  return true;
}

module.exports = { RADAR_STATUSES, RADAR_CATEGORIES, RADAR_ITEM_SCHEMA, buildRadarItem, validateRadarItem };
