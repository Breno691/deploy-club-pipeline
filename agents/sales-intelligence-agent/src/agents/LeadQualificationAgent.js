// LeadQualificationAgent.js — Qualifica leads com BANT e gera próximo passo
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const { calcBANTScore } = require('../calculations/salesCalculators');

const client = new Anthropic();

async function qualifyLeadWithClaude(leadData = {}) {
  const bant = calcBANTScore({
    budget:    leadData.tem_budget   ? 8 : 3,
    authority: leadData.e_decisor    ? 9 : 4,
    need:      leadData.urgencia >= 7 ? 9 : leadData.urgencia >= 4 ? 6 : 3,
    timeline:  leadData.prazo === 'urgente' ? 10 : leadData.prazo === '30_dias' ? 7 : 4,
  });

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Você é o Sales Intelligence Agent da SmartOps IA.

CEO: Breno Luiz — consultoria Lean + Automação IA, BH
ICP (cliente ideal): ${CONFIG.icp.porte} | ${CONFIG.icp.setor} | BH | dor: ${CONFIG.icp.dor_principal}

LEAD RECEBIDO:
Nome: ${leadData.nome || 'não informado'}
Empresa: ${leadData.empresa || 'não informada'}
Setor: ${leadData.setor || 'não informado'}
Porte: ${leadData.porte || 'não informado'}
Dor/Problema: ${leadData.problema || 'não informado'}
Urgência (1-10): ${leadData.urgencia || '?'}
Decisor: ${leadData.e_decisor ? 'sim' : 'não/incerto'}
Tem budget: ${leadData.tem_budget ? 'sim' : 'não/incerto'}
Prazo: ${leadData.prazo || 'não informado'}
Canal de origem: ${leadData.origem || 'não informado'}

BANT Score calculado: ${bant.score}/100 (${bant.classification})
Próxima ação local: ${bant.next_action}

Responda:

# LEAD QUALIFICATION REPORT

## VEREDICTO
[HOT 🔥 / WARM ⭐ / COLD ❄️ / DESCARTE] — [1 linha de justificativa]

## ANÁLISE BANT
Budget: [X/10] — [justificativa]
Authority: [X/10] — [justificativa]
Need: [X/10] — [justificativa]
Timeline: [X/10] — [justificativa]
BANT Total: ${bant.score}/100

## FIT COM ICP
[Quanto esse lead se encaixa no cliente ideal SmartOps — alto/médio/baixo]
[O que se encaixa + o que não se encaixa]

## SERVIÇO RECOMENDADO
[Qual dos 4 serviços SmartOps melhor resolve a dor desse lead — com justificativa]
Ticket estimado: R$ [X]

## PRÓXIMA AÇÃO (nas próximas 2 horas)
[O que fazer agora — específico: mensagem/ligação/email + texto sugerido]

## PERGUNTAS PARA APROFUNDAR
[3 perguntas para fazer na primeira conversa e descobrir mais]`,
    }],
  });

  return { analysis: response.content[0].text, bant };
}

module.exports = { qualifyLeadWithClaude };
