// ProductValidationAgent.js — Productization Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

const VALIDATION_METHODS = {
  landing_page:  'Criar landing page simples e medir interesse com CTR e inscrições',
  waitlist:      'Anunciar produto e pedir pré-cadastro antes de construir',
  pre_sale:      'Vender antes de entregar — cobrar pré-venda com desconto',
  survey:        'Pesquisa com leads e clientes sobre interesse e disposição de pagar',
  interview:     'Entrevistas com 5-10 potenciais compradores',
  test_post:     'Post orgânico sobre o problema que o produto resolve — medir engajamento',
  small_ad:      'Anúncio com R$50-100 para medir CTR e interesse',
  direct_offer:  'Oferecer diretamente em reunião ou WhatsApp para leads quentes',
};

async function createValidationPlan(productId, context = '') {
  const product = CONFIG.initial_products[productId];
  if (!product) throw new Error(`Product not found: ${productId}`);

  const prompt = `Você é o Product Validation Agent da SmartOps IA.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.
Fase: pré-receita — validar tudo antes de construir grande.

Crie um plano de validação para este produto.

Produto: ${product.name}
Tier: ${product.tier}
Preço: R$ ${product.price}
Público: ${product.target}
Dor: ${product.pain}
Promessa: ${product.promise}
Score atual: ${product.score}/100
Contexto: ${context || 'produto na fase de ideia'}

Métodos de validação disponíveis:
${JSON.stringify(VALIDATION_METHODS, null, 2)}

Regra crítica: não construir produto grande sem validação mínima.

Para produto gratuito (score > 85): criar e distribuir diretamente.
Para produto B2B (score 70-84): validar com 3-5 leads antes de construir completo.
Para produto core (score < 70): validar com landing page ou pesquisa primeiro.

Retorne JSON:
{
  "product": "${product.name}",
  "validation_strategy": "rápido (< 1 semana) | médio (1-3 semanas) | profundo (> 3 semanas)",
  "recommended_method": "método recomendado",
  "hypothesis": "hipótese a validar: se [produto] for criado, [X%] de [público] vai [ação]",
  "success_metric": "o que precisa acontecer para confirmar demanda",
  "minimum_signal": "sinal mínimo para decidir construir (ex: 3 pré-vendas, 20 inscrições)",
  "test_duration_days": 7,
  "test_cost_estimate": "R$ X",
  "steps": [
    { "day": "Dia 1-2", "action": "ação de validação", "tool": "ferramenta", "output": "resultado esperado" }
  ],
  "content_to_test": "post ou copy a testar",
  "channels_to_use": ["LinkedIn", "WhatsApp", "Instagram"],
  "decision_criteria": {
    "build":    "sinal para construir o produto",
    "iterate":  "sinal para ajustar hipótese",
    "discard":  "sinal para arquivar a ideia"
  },
  "risk_if_no_validation": "consequência de construir sem validar",
  "fast_mvp": "versão mínima para validar em 3 dias",
  "direct_offer_script": "como oferecer diretamente para lead quente",
  "validation_status": "not_started",
  "estimated_validation_date": "em ${7} dias"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('ProductValidationAgent: no JSON from Claude');
  const data = JSON.parse(jsonMatch[0]);
  data.product_data = { id: productId, name: product.name, price: product.price };
  data.created_at = new Date().toISOString();
  return data;
}

async function createDiagnosticProduct(focus = 'operacional') {
  const prompt = `Você é o Product Validation Agent e Diagnostic Product Agent da SmartOps IA.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.
Breno Luiz: Black Belt Lean Six Sigma, presencial em BH.

Crie a especificação completa de um produto de diagnóstico productizado.

Foco: ${focus} (operacional | automação | lean | financeiro | geral)

O diagnóstico deve ser:
- entregável em 3-5 dias
- com processo claro e repetível
- com resultado tangível (relatório + plano de ação)
- que gere upsell natural para consultoria

Retorne JSON:
{
  "diagnostic_name": "nome do diagnóstico",
  "tagline": "subtítulo em 1 linha",
  "target_audience": "quem compra",
  "trigger_event": "quando o empresário procura isso",
  "pain_addressed": "dor específica que resolve",
  "promise": "o que o cliente terá ao final",
  "process": {
    "step1": { "name": "Pré-diagnóstico", "actions": ["ação 1", "ação 2"], "tool": "formulário / n8n / Claude", "output": "resultado", "time": "30 min" },
    "step2": { "name": "Reunião de Diagnóstico", "actions": ["ação 1", "ação 2"], "tool": "presencial ou online", "output": "resultado", "time": "60-90 min" },
    "step3": { "name": "Análise", "actions": ["ação 1"], "tool": "Claude + n8n", "output": "resultado", "time": "2h" },
    "step4": { "name": "Relatório", "actions": ["ação 1", "ação 2"], "tool": "Claude + Canva", "output": "PDF", "time": "1h" },
    "step5": { "name": "Apresentação", "actions": ["ação 1"], "tool": "reunião", "output": "próximos passos", "time": "30 min" }
  },
  "deliverables": ["entregável 1", "entregável 2", "entregável 3"],
  "report_sections": ["seção 1", "seção 2", "seção 3"],
  "price": 0,
  "cost_to_deliver_hours": 0,
  "cost_to_deliver_brl": 0,
  "margin_pct": 0,
  "upsell_script": "como apresentar o próximo passo ao final do diagnóstico",
  "upsell_product": "produto para oferecer",
  "conversion_expected": "X% dos diagnósticos viram projeto",
  "questions_to_ask": ["pergunta diagnóstica 1", "pergunta 2", "pergunta 3"],
  "scoring_criteria": "como pontuar o resultado do diagnóstico",
  "automation_opportunity": "o que pode ser automatizado neste diagnóstico",
  "scalability_note": "limitações e como escalar"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('DiagnosticProduct: no JSON');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { createValidationPlan, createDiagnosticProduct, VALIDATION_METHODS };
