// ProofOfAuthorityAgent.js — Personal Brand Intelligence Agent
const { BRENO } = require('../config');

// Current authority proofs
const AUTHORITY_PROOFS = {
  credentials: [
    { type: 'certification', name: 'Black Belt Lean Six Sigma', issuer: 'Certificação oficial', status: 'active' },
    { type: 'company', name: 'Fundador SmartOps IA', description: 'Consultoria Lean + IA para PMEs', status: 'active' },
  ],
  specialties: BRENO.specialty,
  location:    BRENO.location,
  service_area: 'BH e Região Metropolitana de Minas Gerais',
};

// Score authority level based on proofs
function scoreAuthority({ credentials = 0, cases = 0, testimonials = 0, events = 0, articles = 0, followers = 0 }) {
  let score = 40; // base from credentials

  if (credentials >= 2)   score += 10;
  if (cases >= 5)          score += 15;
  else if (cases >= 1)     score += 8;
  if (testimonials >= 5)   score += 10;
  else if (testimonials >= 1) score += 5;
  if (events >= 3)         score += 8;
  else if (events >= 1)    score += 4;
  if (articles >= 5)       score += 7;
  if (followers >= 1000)   score += 5;
  else if (followers >= 500) score += 3;

  return Math.min(100, score);
}

// Generate social proof content from a result
function generateSocialProofPost({ metric, sector, location = 'BH', service }) {
  const templates = [
    `Uma empresa de ${sector} em ${location} ${metric} com ${service}.\n\nProcesso + IA funcionam.\n\nSe quiser descobrir onde sua empresa pode melhorar, agende um diagnóstico gratuito.`,
    `Resultado real de ${sector} em ${location}:\n\n${metric}\n\nSem grandes investimentos. Com método e automação.\n\nDiagnóstico gratuito: link na bio.`,
    `${metric}\n\nEsse foi o resultado de um projeto de ${service} em empresa de ${sector} na região de ${location}.\n\nÉ possível. Com processo certo.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

// Get list of missing authority proofs
function getMissingProofs(current) {
  const missing = [];
  const { cases = 0, testimonials = 0, events = 0, articles = 0 } = current;

  if (cases < 3)       missing.push({ item: 'Cases documentados', priority: 'P1', impact: 'Muito alto' });
  if (testimonials < 3) missing.push({ item: 'Depoimentos de clientes', priority: 'P1', impact: 'Alto' });
  if (events < 1)      missing.push({ item: 'Palestra ou evento', priority: 'P2', impact: 'Alto' });
  if (articles < 3)    missing.push({ item: 'Artigos ou posts de autoridade', priority: 'P2', impact: 'Médio' });

  return missing;
}

// Generate authority audit report
function generateAuthorityAudit(current) {
  const score   = scoreAuthority(current);
  const missing = getMissingProofs(current);

  return {
    authority_score:   score,
    level:             score >= 70 ? 'alto' : score >= 50 ? 'médio' : 'inicial',
    strengths:         ['Black Belt Lean Six Sigma', 'Fundador SmartOps IA', 'Presencial BH/MG'],
    missing_proofs:    missing,
    next_action:       missing[0] ? missing[0].item : 'Manter consistência de conteúdo',
    priority_this_month: missing.filter(m => m.priority === 'P1').map(m => m.item),
    generated_at:      new Date().toISOString(),
  };
}

module.exports = { AUTHORITY_PROOFS, scoreAuthority, generateSocialProofPost, getMissingProofs, generateAuthorityAudit };
