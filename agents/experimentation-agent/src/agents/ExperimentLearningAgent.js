// ExperimentLearningAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const fs   = require('fs');
const path = require('path');

const client = new Anthropic();

const LEARNING_LIBRARY_PATH = path.join(__dirname, '../../memory/experimentsLibrary.json');

function loadLearnings() {
  try { return JSON.parse(fs.readFileSync(LEARNING_LIBRARY_PATH, 'utf8')); } catch { return { experiments: [], learnings: [], winners: [] }; }
}

function saveLearnings(data) {
  const dir = path.dirname(LEARNING_LIBRARY_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(LEARNING_LIBRARY_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function registerExperimentResult(experiment) {
  const lib = loadLearnings();

  const entry = {
    id:           `exp_${Date.now()}`,
    date:         new Date().toISOString().split('T')[0],
    hypothesis:   experiment.hypothesis,
    area:         experiment.area,
    control:      experiment.control,
    variant:      experiment.variant,
    winner:       experiment.winner,
    uplift_pct:   experiment.uplift_pct,
    significance: experiment.significance,
    insight:      experiment.insight || '',
    next_test:    experiment.next_test || '',
  };

  lib.experiments.push(entry);

  if (experiment.winner === 'VARIANTE') {
    lib.winners.push({ ...entry, implemented: false });
  }

  // Extrai learning genérico
  if (experiment.insight) {
    lib.learnings.push({
      area:     experiment.area,
      learning: experiment.insight,
      date:     entry.date,
      strength: experiment.significance >= 95 ? 'forte' : 'moderado',
    });
  }

  saveLearnings(lib);
  return entry;
}

function getLearningsByArea(area = null) {
  const lib = loadLearnings();
  const learnings = area ? lib.learnings.filter(l => l.area === area) : lib.learnings;
  const winners   = area ? lib.winners.filter(w => w.area === area) : lib.winners;
  return { learnings, winners, total_experiments: lib.experiments.length };
}

async function synthesizeLearningsWithClaude(area = null) {
  const { learnings, winners, total_experiments } = getLearningsByArea(area);

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Experiment Learning Agent da SmartOps IA.

Missão: Sintetizar aprendizados de experimentos passados e gerar recomendações para os próximos testes.

Total de experimentos: ${total_experiments}
Área filtro: ${area || 'todas'}
Aprendizados registrados: ${learnings.length}
Variantes vencedoras: ${winners.length}

APRENDIZADOS ACUMULADOS:
${learnings.length > 0 ? learnings.map(l => `[${l.area}] ${l.learning} (${l.strength})`).join('\n') : 'Nenhum aprendizado registrado ainda'}

VARIANTES VENCEDORAS:
${winners.length > 0 ? winners.map(w => `[${w.area}] ${w.hypothesis} → uplift ${w.uplift_pct}%`).join('\n') : 'Nenhuma variante vencedora ainda'}

---

Sintetize:

# EXPERIMENT LEARNING REPORT

## PADRÕES ENCONTRADOS
[O que os dados coletados revelam em padrões de comportamento]

## O QUE FUNCIONOU
[Tipos de mudanças que geraram mais uplift]

## O QUE NÃO FUNCIONOU
[Hipóteses que falharam e por quê]

## REGRAS DERIVADAS DOS DADOS
[Princípios que podem guiar próximos testes sem precisar testar de novo]

## PRÓXIMAS HIPÓTESES RECOMENDADAS
[Baseadas nos padrões — 3-5 hipóteses para testar a seguir]

## O QUE AINDA NÃO SABEMOS
[Gaps de conhecimento — onde precisamos de mais dados]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { synthesizeLearningsWithClaude, registerExperimentResult, getLearningsByArea, loadLearnings };
