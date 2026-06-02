// OfferDesignAgent.js — Productization Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

async function designOffer(productId, customData = {}) {
  const product = CONFIG.initial_products[productId] || customData;
  if (!product) throw new Error(`Product not found: ${productId}`);

  const prompt = `Você é o Offer Design Agent da SmartOps IA.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.
Breno Luiz: Black Belt Lean Six Sigma, presencial em BH.

Crie uma oferta completa e irresistível para este produto.

Produto: ${product.name}
Categoria: ${product.category || 'consultoria'}
Público: ${product.target}
Dor principal: ${product.pain}
Promessa: ${product.promise}
Entregáveis: ${JSON.stringify(product.deliverables)}
Preço: R$ ${product.price}
Margem estimada: ${product.margin}%
Upsell: ${product.upsell}

Toda oferta deve ter:
- público definido
- dor clara
- promessa específica
- entregáveis detalhados
- prazo de entrega
- preço
- bônus (se aplicável)
- garantia (se aplicável)
- CTA
- próximos passos

Retorne JSON:
{
  "offer_id": "offer-${productId}-${Date.now()}",
  "product_name": "${product.name}",
  "headline": "título da oferta (máx 10 palavras)",
  "subheadline": "subtítulo explicativo (1 linha)",
  "target_audience": "para quem exatamente",
  "main_pain": "dor principal em linguagem do cliente",
  "promise": "promessa central em 1 frase",
  "proof_points": ["prova 1", "prova 2", "prova 3"],
  "deliverables": [
    { "item": "entregável", "description": "descrição do valor" }
  ],
  "bonuses": [
    { "bonus": "bônus", "value": "R$ X de valor", "why": "por que este bônus" }
  ],
  "timeline": "prazo de entrega",
  "price": ${product.price},
  "price_anchor": "preço de referência para anchoring",
  "price_justification": "como justificar o preço para o cliente",
  "guarantee": "garantia | sem garantia | satisfação X dias",
  "cta": "chamada para ação principal",
  "objection_responses": {
    "muito_caro": "resposta para 'é caro'",
    "nao_tenho_tempo": "resposta para 'não tenho tempo'",
    "vou_pensar": "resposta para 'vou pensar'"
  },
  "next_steps": ["passo 1", "passo 2", "passo 3"],
  "upsell_path": "${product.upsell || 'consultoria completa'}",
  "sales_page_hook": "primeira linha da página de vendas",
  "whatsapp_pitch": "pitch de 3 linhas para WhatsApp",
  "linkedin_pitch": "pitch de 2 linhas para LinkedIn",
  "offer_score": 0,
  "strongest_element": "elemento mais forte desta oferta",
  "weakest_element": "elemento mais fraco — o que melhorar"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('OfferDesignAgent: no JSON from Claude');
  const data = JSON.parse(jsonMatch[0]);
  data.product_data = product;
  data.generated_at = new Date().toISOString();
  return data;
}

async function designValueLadder() {
  const products = CONFIG.initial_products;
  const ladder = Object.values(products).sort((a, b) => a.price - b.price);

  const prompt = `Você é o Offer Design Agent da SmartOps IA.

Desenhe a escada de valor completa da SmartOps IA.

Produtos disponíveis:
${JSON.stringify(ladder.map(p => ({ name: p.name, price: p.price, tier: p.tier, funnel_role: p.funnel_role, upsell: p.upsell })), null, 2)}

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.

Retorne JSON:
{
  "value_ladder": [
    {
      "step": 1,
      "product": "nome",
      "price": 0,
      "tier": "free",
      "role": "capturar lead",
      "promise": "promessa",
      "next_offer": "próximo passo",
      "conversion_goal": "% alvo de conversão",
      "trigger_to_upsell": "quando oferecer próximo produto"
    }
  ],
  "funnel_journey": "descrição da jornada do lead ao cliente premium",
  "avg_ltv_estimate": "estimativa de LTV na escada completa",
  "weakest_step": "passo mais fraco na escada",
  "missing_step": "produto que falta na escada",
  "optimization_opportunity": "maior oportunidade de melhoria",
  "recommended_focus": "produto para focar nos próximos 30 dias"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('OfferDesignAgent ladder: no JSON');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { designOffer, designValueLadder };
