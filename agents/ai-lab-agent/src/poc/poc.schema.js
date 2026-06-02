// PoC Schema — AI Lab Intelligence Agent

const POC_SCHEMA = {
  poc_id:       '',
  name:         '',
  problem:      '',
  hypothesis:   '',
  technology:   '',
  owner_agent:  '',        // SmartOps agent that benefits
  status:       'planned', // planned | running | completed | cancelled
  start_date:   '',
  end_date:     '',
  timebox:      7,         // days
  cost_estimate: 0,        // USD
  success_metric: '',
  expected_result: '',
  risk:         '',
  implementation_steps: [],
  result:       null,
  was_successful: null,
  decision:     '',        // implement | reject | iterate | monitor
  lessons:      '',
  next_action:  '',
  created_at:   '',
};

// PoC status transitions
const POC_TRANSITIONS = {
  planned:   ['running', 'cancelled'],
  running:   ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

// Validate PoC before creating
function validatePoC(poc) {
  const required = ['name', 'problem', 'hypothesis', 'technology', 'success_metric'];
  const missing  = required.filter(f => !poc[f]);
  if (missing.length > 0) throw new Error(`PoC missing: ${missing.join(', ')}`);
  if (poc.timebox > 14)   throw new Error('PoC timebox must be ≤ 14 days');
  return true;
}

// Evaluate PoC result
function evaluatePoC(poc, actualResult) {
  return {
    ...poc,
    result:         actualResult,
    was_successful: actualResult.success,
    decision:       actualResult.success ? 'implement' : actualResult.partial ? 'iterate' : 'reject',
    lessons:        actualResult.lessons || '',
    status:         'completed',
  };
}

module.exports = { POC_SCHEMA, POC_TRANSITIONS, validatePoC, evaluatePoC };
