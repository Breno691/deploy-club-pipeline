// SalesEnablementAgent.js — Case Study Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// ── Mapeamento objeções → cases ──────────────────────────────────────────────

const OBJECTION_CASE_MAP = {
  'caro demais':              { focus: 'roi', angle: 'mostrar payback curto e ROI positivo' },
  'não vai funcionar aqui':   { focus: 'setor', angle: 'usar case do mesmo setor' },
  'minha empresa é pequena':  { focus: 'micro_case', angle: 'usar micro case de PME similar' },
  'não tenho dados':          { focus: 'processo', angle: 'mostrar case onde dados foram criados durante o projeto' },
  'vai demorar muito':        { focus: 'tempo', angle: 'usar case com implementação rápida' },
  'já tentamos antes':        { focus: 'metodo', angle: 'mostrar diferencial do método SmartOps' },
  'qual é o ROI real':        { focus: 'roi', angle: 'mostrar calculadora e case com ROI comprovado' },
  'preciso pensar mais':      { focus: 'custo_inacao', angle: 'mostrar custo de não agir com dados do case' },
  'não tenho tempo':          { focus: 'automacao', angle: 'case de automação que liberou horas' },
  'minha equipe não vai aceitar': { focus: 'kaizen', angle: 'case de mudança cultural bem-sucedida' },
};

function getCaseStrategy(objection) {
  const lower = objection.toLowerCase();
  for (const [key, val] of Object.entries(OBJECTION_CASE_MAP)) {
    if (lower.includes(key.split(' ')[0]) || lower.includes(key)) return { objection: key, ...val };
  }
  return { objection, focus: 'roi', angle: 'mostrar resultado concreto mais forte disponível' };
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function enableSales({ objection, targetSector, targetPain, leadProfile = '', context = '' }) {
  const strategy = getCaseStrategy(objection);

  const prompt = `Você é o Sales Enablement Agent da SmartOps IA.
Sua missão é armar o Breno com argumentos, cases e scripts para superar objeções e fechar mais clientes.

OBJEÇÃO RECEBIDA: "${objection}"
SETOR DO LEAD: ${targetSector || 'não informado'}
DOR PRINCIPAL: ${targetPain || 'não informada'}
PERFIL DO LEAD: ${leadProfile || 'PME, decisor, curioso sobre Lean e IA'}
CONTEXTO: ${context || 'nenhum'}

ESTRATÉGIA RECOMENDADA:
- Foco: ${strategy.focus}
- Ângulo: ${strategy.angle}

Gere o kit completo de vendas para essa objeção:

OBJEÇÃO_MAPEADA: [reformular a objeção com empatia]

CAUSA_RAIZ_DA_OBJEÇÃO: [por que o lead fala isso — medo real por trás]

RESPOSTA_DIRETA: [1-2 frases para responder imediatamente]

SCRIPT_DE_REUNIÃO: [roteiro completo de como tratar a objeção — com perguntas, dados e transição]

CASE_IDEAL_PARA_USAR: [descrição do tipo de case que mais quebra essa objeção]

DADO_CONCRETO_PARA_USAR: [número, percentual ou fato que elimina a objeção]

PERGUNTA_INVESTIGATIVA: [pergunta para entender melhor a objeção antes de responder]

PERGUNTA_DE_VIRADA: [pergunta que muda o enquadramento mental do lead]

CUSTO_DE_NÃO_AGIR: [o que acontece se o lead não resolver — argumento baseado em dados]

PRÓXIMO_PASSO_SUGERIDO: [como encerrar a conversa após superar a objeção]

MATERIALS_TO_SEND: [material a enviar por WhatsApp/e-mail após a reunião]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return {
    objection,
    strategy,
    targetSector,
    targetPain,
    analysis: resp.content[0].text,
    created_at: new Date().toISOString(),
  };
}

module.exports = { enableSales, getCaseStrategy, OBJECTION_CASE_MAP };
