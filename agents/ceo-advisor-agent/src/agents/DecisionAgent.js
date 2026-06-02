// DecisionAgent.js — Ajuda Breno a tomar decisões estratégicas com framework
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// Frameworks de decisão disponíveis
const DECISION_FRAMEWORKS = {
  roi:         'Calcular ROI de cada opção — escolher a de maior retorno por esforço',
  speed:       'Qual opção dá feedback mais rápido? Testar pequeno primeiro',
  reversible:  'Prefira decisões reversíveis. Se irreversível, analisar mais',
  lean:        'Eliminar opções que são desperdício. Simplificar.',
  customer:    'Qual opção o cliente ideal preferiria? Centrar no cliente',
  iceberg:     '10% visível (decisão). 90% invisível (contexto). Explorar o que não está óbvio',
};

async function supportDecisionWithClaude(decisionDescription, options = [], constraints = '') {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o CEO Advisor Agent da SmartOps IA — conselheiro estratégico.

CEO: Breno Luiz — Black Belt Lean Six Sigma, fundador SmartOps IA, BH
Contexto da empresa: ${CONFIG.company.stage}
Metas: ${CONFIG.goals.clientes_meta} clientes, R$ ${CONFIG.goals.receita_meta_mes.toLocaleString('pt-BR')}/mês

DECISÃO A TOMAR:
"${decisionDescription}"

${options.length > 0 ? `OPÇÕES CONSIDERADAS:\n${options.map((o, i) => `${i + 1}. ${o}`).join('\n')}` : ''}
${constraints ? `RESTRIÇÕES: ${constraints}` : ''}

Frameworks disponíveis: ${Object.keys(DECISION_FRAMEWORKS).join(', ')}

Responda:

# DECISION SUPPORT

## CLARIFICAÇÃO
[Reformulação da decisão para garantir que está resolvendo o problema certo]

## ANÁLISE DAS OPÇÕES
Para cada opção:
OPÇÃO: [nome]
PRÓs: [3 vantagens]
CONTRAs: [3 desvantagens]
ROI ESTIMADO: [R$ ou % de impacto]
REVERSIBILIDADE: [alta/média/baixa]
RISCO: [o que pode dar errado]
ALINHAMENTO COM META: [como impacta a meta de R$ ${CONFIG.goals.receita_meta_mes.toLocaleString('pt-BR')}/mês]

## OPÇÃO RECOMENDADA
[Qual escolher — com justificativa em 3 linhas]

## CRITÉRIO DE SUCESSO
[Como saber em 30 dias se foi a decisão certa]

## PRÓXIMO PASSO IMEDIATO
[A primeira ação para executar a decisão nas próximas 24h]

## ARMADILHA A EVITAR
[O erro mais comum nesse tipo de decisão]`,
    }],
  });

  return response.content[0].text;
}

async function generateWeeklyReviewWithClaude(weekData = {}) {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o CEO Advisor Agent da SmartOps IA.

Revisão semanal — CEO Breno Luiz
Semana: ${weekData.week || 'atual'}
Empresa: SmartOps IA — consultoria Lean + Automação IA, BH

RESULTADOS DA SEMANA:
Receita gerada: R$ ${weekData.receita || 0}
Leads novos: ${weekData.leads || 0}
Reuniões realizadas: ${weekData.reunioes || 0}
Propostas enviadas: ${weekData.propostas || 0}
Vendas fechadas: ${weekData.vendas || 0}
Posts publicados: ${weekData.posts || 0}
Automações ativadas: ${weekData.automacoes || 0}
Horas trabalhadas: ${weekData.horas || 0}

O que funcionou: ${weekData.wins || 'não informado'}
O que não funcionou: ${weekData.losses || 'não informado'}
Principal aprendizado: ${weekData.learning || 'não informado'}

Metas: ${CONFIG.goals.clientes_meta} clientes, R$ ${CONFIG.goals.receita_meta_mes.toLocaleString('pt-BR')}/mês

Gere a revisão semanal:

# WEEKLY CEO REVIEW

## RESULTADO GERAL
[Semana foi: excelente / boa / ok / fraca / crítica — em 2 linhas]

## O QUE FUNCIONOU
[Top 3 vitórias da semana com impacto]

## O QUE NÃO FUNCIONOU
[Top 3 problemas com causa raiz — não sintoma]

## A LIÇÃO DA SEMANA
[1 aprendizado que vai mudar como você age na próxima semana]

## META DA PRÓXIMA SEMANA
[1 meta SMART: específica, mensurável, atingível, relevante, com prazo]

## DECISÃO PARA SEGUNDA-FEIRA
[A primeira coisa a decidir ou fazer na próxima semana]

## PERGUNTA INCÔMODA
[A pergunta que você está evitando mas precisa responder — sobre o negócio]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { supportDecisionWithClaude, generateWeeklyReviewWithClaude, DECISION_FRAMEWORKS };
