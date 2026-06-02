// Tool Evaluation Schema — AI Lab Intelligence Agent

const TOOL_EVALUATION_SCHEMA = {
  tool_id:          '',
  name:             '',
  category:         '',
  website:          '',
  description:      '',
  cost:             '',       // free | freemium | paid | $X/mo
  status:           'researching',

  // Scores (0–10 each)
  scores: {
    business_impact:       0,
    technical_fit:         0,
    integration_fit:       0,
    cost_efficiency:       0,
    risk:                  0,
    maturity:              0,
    strategic_advantage:   0,
  },

  total_score:      0,        // weighted 0–100
  recommendation:   '',       // reject | monitor | poc | adopt
  use_case_smartops:'',
  use_case_clients: '',
  risks:            [],
  alternatives:     [],
  next_action:      '',
  evaluated_at:     '',
};

// Score weights (must sum to 100)
const SCORE_WEIGHTS = {
  business_impact:      20,
  technical_fit:        15,
  integration_fit:      15,
  cost_efficiency:      15,
  risk:                 15,
  maturity:             10,
  strategic_advantage:  10,
};

// Calculate weighted total score
function calculateTotalScore(scores) {
  return Math.round(
    Object.entries(SCORE_WEIGHTS).reduce((sum, [key, weight]) => {
      return sum + ((scores[key] || 0) / 10) * weight;
    }, 0)
  );
}

// Map score to recommendation
function scoreToRecommendation(score) {
  if (score >= 85) return 'adopt';
  if (score >= 70) return 'poc';
  if (score >= 50) return 'monitor';
  return 'reject';
}

// Validate evaluation object
function validateEvaluation(evaluation) {
  const required = ['name', 'category', 'scores'];
  const missing  = required.filter(f => !evaluation[f]);
  if (missing.length > 0) throw new Error(`Evaluation missing: ${missing.join(', ')}`);
  return true;
}

module.exports = {
  TOOL_EVALUATION_SCHEMA, SCORE_WEIGHTS,
  calculateTotalScore, scoreToRecommendation, validateEvaluation,
};
