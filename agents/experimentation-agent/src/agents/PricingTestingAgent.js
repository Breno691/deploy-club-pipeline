// PricingTestingAgent.js — Testa precificação, ancoragem e apresentação de preço
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// Estratégias de precificação a testar
const PRICING_STRATEGIES = [
  { name: 'ancoragem_alto',   desc: 'Mostrar opção mais cara primeiro — âncora o valor',       uplift: '15-30%' },
  { name: 'pacote_3_opcoes',  desc: 'Três opções (básico/recomendado/premium) — empurra para o meio', uplift: '20-40%' },
  { name: 'roi_explicito',    desc: 'Mostrar ROI calculado antes do preço',                    uplift: '25-45%' },
  { name: 'investimento_vs_custo', desc: 'Palavra "investimento" vs "custo" ou "preço"',       uplift: '5-15%' },
  { name: 'parcelamento',     desc: 'Mostrar valor mensal primeiro (R$ X/mês) vs total',       uplift: '10-25%' },
  { name: 'garantia',         desc: 'Garantia de satisfação ou resultado mínimo',              uplift: '15-30%' },
  { name: 'escassez_tempo',   desc: 'Oferta válida por período limitado (com reason why)',     uplift: '10-20%' },
  { name: 'social_proof_preco', desc: 'X clientes pagam este valor',                           uplift: '5-15%' },
];

function analyzeCurrentPricingLocally(pricingData = {}) {
  const { ticket_medio = 0, taxa_fechamento_pct = 0, proposals_sent = 0, closed = 0 } = pricingData;
  const issues = [];
  const opportunities = [];

  if (taxa_fechamento_pct < 20) {
    issues.push({ issue: 'Taxa de fechamento baixa', possible_cause: 'Preço percebido como alto sem ROI claro ou âncora', action: 'Testar apresentação de ROI antes do preço' });
  }
  if (!pricingData.has_anchor) {
    opportunities.push({ strategy: 'ancoragem_alto', expected: '+15-25% fechamento' });
  }
  if (!pricingData.has_three_options) {
    opportunities.push({ strategy: 'pacote_3_opcoes', expected: '+20-30% ticket médio' });
  }
  if (!pricingData.shows_roi) {
    opportunities.push({ strategy: 'roi_explicito', expected: '+25-40% fechamento' });
  }

  return { issues, opportunities, revenue_potential: Math.round(ticket_medio * proposals_sent * 0.25 - ticket_medio * closed) };
}

async function analyzePricingWithClaude(pricingData) {
  const local = analyzeCurrentPricingLocally(pricingData);

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Pricing Testing Agent da SmartOps IA.

Missão: Testar como o preço é apresentado para aumentar taxa de fechamento e ticket médio — sem necessariamente mudar o preço.

Empresa: SmartOps IA — consultoria Lean + Automação IA, BH
Serviços: Quick Win (R$ 5.500), Diagnóstico+Plano (R$ 11.500), Projeto Completo (R$ 32.000), Parceria Mensal (R$ 5.500/mês)
Dados atuais: ${JSON.stringify(pricingData, null, 2)}

Oportunidades locais detectadas:
${local.opportunities.map(o => `- ${o.strategy}: ${o.expected}`).join('\n')}

Estratégias de pricing test disponíveis:
${PRICING_STRATEGIES.map(s => `${s.name}: ${s.desc} (uplift esperado: ${s.uplift})`).join('\n')}

Responda:

# PRICING TEST REPORT

## DIAGNÓSTICO ATUAL
[O que os dados revelam sobre como o preço é percebido]

## TESTES A/B DE PRECIFICAÇÃO (TOP 3)
Para cada teste:
ESTRATÉGIA: [nome]
HIPÓTESE: [afirmação testável]
CONTROLE (A): [como o preço é apresentado hoje]
VARIANTE (B): [como apresentar de forma diferente — seja específico com texto/estrutura]
MÉTRICA: [taxa de fechamento / ticket médio]
DURAÇÃO: [N propostas]
CRITÉRIO DE SUCESSO: [o que precisa melhorar]

## REESCRITA DA PROPOSTA DE PREÇOS
[Como reorganizar a apresentação de valor + preço na proposta atual]

## PACOTES SUGERIDOS (com ancoragem)
Opção 1 (Starter): [nome, o que inclui, preço]
Opção 2 (Recomendado): [nome, o que inclui, preço — marcar como MAIS POPULAR]
Opção 3 (Premium): [nome, o que inclui, preço]

## OBJEÇÕES DE PREÇO E RESPOSTAS
[Top 3 objeções + resposta que remove o atrito]

## IMPACTO ESTIMADO
Se implementar os 3 testes: receita potencial adicional R$ X/mês`,
    }],
  });

  return response.content[0].text;
}

module.exports = { analyzePricingWithClaude, analyzeCurrentPricingLocally, PRICING_STRATEGIES };
