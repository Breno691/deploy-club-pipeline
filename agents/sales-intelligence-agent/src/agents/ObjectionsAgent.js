// ObjectionsAgent.js — Mapeia objeções e gera respostas para SmartOps
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

function identifyObjectionLocally(objectionText = '') {
  const text = objectionText.toLowerCase();
  const match = CONFIG.common_objections.find(o =>
    o.objection.toLowerCase().split(' ').filter(w => w.length > 3).some(w => text.includes(w))
  );
  return match || { objection: objectionText, frequency: 0, response_strategy: 'Entender a objeção real antes de responder' };
}

async function handleObjectionWithClaude(objectionText, context = '') {
  const knownObjection = identifyObjectionLocally(objectionText);

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Você é o Sales Intelligence Agent da SmartOps IA.

Empresa: SmartOps IA — consultoria Lean + Automação IA, BH
Consultor: Breno Luiz — Black Belt Lean Six Sigma
Serviços: Quick Win (R$ 5.500), Diagnóstico+Plano (R$ 11.500), Projeto Completo (R$ 32.000), Parceria Mensal (R$ 5.500/mês)

OBJEÇÃO RECEBIDA: "${objectionText}"
Contexto da conversa: ${context || 'sem contexto específico'}
Objeção conhecida: ${knownObjection.objection}
Estratégia base: ${knownObjection.response_strategy}

Responda:

# OBJECTION HANDLING

## DIAGNÓSTICO DA OBJEÇÃO
[O que realmente está por trás dessa objeção — medo, experiência ruim, falta de info, orçamento real?]

## RESPOSTA RECOMENDADA (texto pronto para usar)
[Resposta natural, consultiva, sem forçar — pode ser por WhatsApp ou em reunião]

## VARIANTE A (mais direta):
"[texto]"

## VARIANTE B (mais empática):
"[texto]"

## SE A OBJEÇÃO PERSISTIR
[O que fazer se a pessoa repetir a objeção após a resposta]

## GATILHO PARA FECHAR
[O que pode mover essa pessoa para o próximo passo após essa objeção]

## RED FLAG
[Se essa objeção significa que o lead não é ideal — quando parar de investir tempo]`,
    }],
  });

  return response.content[0].text;
}

async function buildObjectionsPlaybook() {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Sales Intelligence Agent da SmartOps IA.

Crie o Playbook de Objeções completo para SmartOps:

Empresa: SmartOps IA — consultoria Lean + Automação IA, BH
Consultor: Breno Luiz — Black Belt Lean Six Sigma
Serviços: ${Object.entries(CONFIG.services).map(([k, v]) => `${k}: R$ ${v.ticket}`).join(', ')}
ICP: ${CONFIG.icp.porte} | ${CONFIG.icp.setor} | BH

Top 8 objeções a cobrir:
${CONFIG.common_objections.map((o, i) => `${i + 1}. "${o.objection}"`).join('\n')}

Para cada objeção:
## [Objeção]
**CAUSA RAIZ:** [por que dizem isso realmente]
**RESPOSTA CURTA (WhatsApp):** [2-3 linhas]
**RESPOSTA COMPLETA (reunião):** [1-2 parágrafos]
**PROVA/ARGUMENTO:** [dado, caso, analogia]
**SE PERSISTIR:** [próximo passo]
**RED FLAG:** [quando parar]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { handleObjectionWithClaude, buildObjectionsPlaybook, identifyObjectionLocally };
