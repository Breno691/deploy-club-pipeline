// AutomationProductizationAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// Catálogo de automações reutilizáveis com potencial de venda
const PRODUCTIZABLE_AUTOMATIONS = [
  {
    id: 'PROD_WA_LEAD',
    name: 'Bot WhatsApp de Qualificação de Leads',
    sectors: ['clínicas', 'academia', 'prestadores de serviço', 'imobiliária'],
    price_range: 'R$ 2.500 - R$ 5.000',
    mrr_potential: 'R$ 500 - R$ 800/mês (suporte)',
    implementation_days: 5,
    reuse_pct: 80,
  },
  {
    id: 'PROD_REPORT',
    name: 'Relatório Automático Semanal para Gestores',
    sectors: ['indústria', 'comércio', 'serviços', 'saúde'],
    price_range: 'R$ 1.500 - R$ 3.000',
    mrr_potential: 'R$ 300 - R$ 500/mês',
    implementation_days: 3,
    reuse_pct: 90,
  },
  {
    id: 'PROD_INVOICE',
    name: 'Automação de Cobrança e Follow-up de Pagamento',
    sectors: ['todos os setores'],
    price_range: 'R$ 1.200 - R$ 2.500',
    mrr_potential: 'R$ 200 - R$ 400/mês',
    implementation_days: 2,
    reuse_pct: 95,
  },
  {
    id: 'PROD_SCHEDULING',
    name: 'Agendamento Automático via WhatsApp + Google Calendar',
    sectors: ['clínicas', 'salão', 'consultórios', 'prestadores'],
    price_range: 'R$ 2.000 - R$ 4.000',
    mrr_potential: 'R$ 400 - R$ 600/mês',
    implementation_days: 4,
    reuse_pct: 85,
  },
  {
    id: 'PROD_DASHBOARD',
    name: 'Dashboard Automático de KPIs para PME',
    sectors: ['indústria', 'varejo', 'serviços'],
    price_range: 'R$ 3.000 - R$ 6.000',
    mrr_potential: 'R$ 600 - R$ 1.000/mês',
    implementation_days: 7,
    reuse_pct: 70,
  },
];

function evaluateProductizationPotential(automation) {
  const score = (
    (automation.reuse_pct || 0) * 0.4 +
    (automation.monthly_volume >= 20 ? 30 : automation.monthly_volume >= 10 ? 20 : 10) +
    (automation.roi?.roi_12m_pct >= 200 ? 30 : automation.roi?.roi_12m_pct >= 100 ? 20 : 10)
  );

  return {
    ...automation,
    productization_score: Math.round(score),
    productizable:        score >= 60,
    product_type:         score >= 80 ? 'produto_packaged' : score >= 60 ? 'servico_recorrente' : 'projeto_customizado',
    price_estimate:       estimateProductPrice(automation),
  };
}

function estimateProductPrice(automation) {
  const hours = automation.impl_hours || 8;
  const rate   = 300; // R$/hora para produto
  const base   = hours * rate;
  return {
    implementation: Math.round(base / 500) * 500,
    monthly_support: Math.round(base * 0.1 / 100) * 100,
    annual_contract: Math.round(base + base * 0.1 * 12),
  };
}

async function productizeAutomationWithClaude(automation, targetSector = 'PME') {
  const potential = evaluateProductizationPotential(automation);

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Automation Productization Agent da SmartOps IA.

Missão: Transformar automações internas provadas em produtos vendáveis para clientes PME.

Automação a productizar: ${automation.name || JSON.stringify(automation)}
Setor alvo: ${targetSector}
Score de productização: ${potential.productization_score}/100
Tipo de produto: ${potential.product_type}
Preço estimado: R$ ${potential.price_estimate.implementation.toLocaleString('pt-BR')} + R$ ${potential.price_estimate.monthly_support.toLocaleString('pt-BR')}/mês

Contexto: SmartOps IA usa essa automação internamente e provou que funciona. Agora queremos vender para ${targetSector}.

Responda com o produto comercial completo:

# PRODUTO: [NOME COMERCIAL]

## POSICIONAMENTO
HEADLINE: [1 linha — benefício principal]
SUBTÍTULO: [2 linhas — como funciona]
PARA_QUEM: [setor/perfil do cliente ideal]
PROBLEMA_RESOLVE: [dor específica]
DIFERENCIAL: [por que a SmartOps vs fazer internamente]

## PROPOSTA DE VALOR
ROI_PROMETIDO: [número concreto — horas ou R$]
CASO_DE_USO: [cenário concreto]
PROVA: ["Usamos internamente e economizamos X"]

## PACOTES
STARTER: [R$ X — o que inclui]
PROFESSIONAL: [R$ Y — o que inclui]
ENTERPRISE: [R$ Z — o que inclui]
MRR: [R$ X/mês para suporte e manutenção]

## OBJEÇÕES E RESPOSTAS
[3 objeções comuns + resposta]

## PROCESSO DE VENDA
[como apresentar + demo + fechamento]

## CASE STUDY TEMPLATE
[formato do case para validar a venda]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { productizeAutomationWithClaude, evaluateProductizationPotential, PRODUCTIZABLE_AUTOMATIONS };
