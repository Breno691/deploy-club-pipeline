#!/usr/bin/env node
/**
 * Productization Intelligence Agent — SmartOps IA
 * Diretor de Produtos, Ofertas e Escalabilidade
 *
 * Missão: transformar serviços e conhecimento em produtos escaláveis
 * Ciclo: Serviço → Padronização → Template → Oferta → Validação → Funil → Escala
 *
 * Usage:
 *   node productization_agent.js --mode catalog
 *   node productization_agent.js --mode discover
 *   node productization_agent.js --mode score --service "análise de gargalos"
 *   node productization_agent.js --mode offer --product diagnostico-express
 *   node productization_agent.js --mode ladder
 *   node productization_agent.js --mode validate --product checklist-desperdicios
 *   node productization_agent.js --mode diagnostic --focus operacional
 *   node productization_agent.js --mode launch --product diagnostico-express
 *   node productization_agent.js --mode roadmap
 *   node productization_agent.js --mode funnel
 *   node productization_agent.js --mode report
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const { discoverProductOpportunities, scoreService, listInitialProducts } = require('./src/agents/ServiceToProductAgent');
const { designOffer, designValueLadder }                                   = require('./src/agents/OfferDesignAgent');
const { createValidationPlan, createDiagnosticProduct }                    = require('./src/agents/ProductValidationAgent');
const { createLaunchPlan, generateProductRoadmap, generateProductFunnel }  = require('./src/agents/ProductLaunchAgent');
const { CONFIG } = require('./src/config');

function getArg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function saveOutput(filename, content) {
  const dir = path.join(__dirname, 'outputs');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, filename);
  fs.writeFileSync(p, JSON.stringify(content, null, 2), 'utf-8');
  console.log(`  ✓ Saved: ${p}`);
  return p;
}

function fmt(value) {
  return `R$ ${Number(value || 0).toLocaleString('pt-BR')}`;
}

function tierLabel(tier) {
  const labels = {
    free: '🎁 Gratuito', entry: '🔰 Entrada', b2b_low: '💼 B2B', core: '⭐ Core',
    premium: '💎 Premium', recurring: '🔄 Recorrência',
  };
  return labels[tier] || tier;
}

async function main() {
  const mode = getArg('mode', 'catalog');
  const ts   = Date.now();

  console.log('\n=== PRODUCTIZATION INTELLIGENCE AGENT ===');
  console.log('Diretor de Produtos, Ofertas e Escalabilidade');
  console.log(`Missão: transformar conhecimento SmartOps em produtos escaláveis`);
  console.log(`Modo: ${mode}\n`);

  // ── CATALOG — catálogo de produtos iniciais ────────────────────────────────
  if (mode === 'catalog') {
    const products = listInitialProducts();
    saveOutput(`catalog-${ts}.json`, { products, generated_at: new Date().toISOString() });

    console.log(`  Catálogo SmartOps IA — ${products.length} produtos mapeados\n`);
    console.log(`  ${'#'.padEnd(2)} ${'Nome'.padEnd(40)} ${'Tier'.padEnd(22)} ${'Preço'.padEnd(12)} ${'Score'.padEnd(7)} ${'Status'}`);
    console.log(`  ${'─'.repeat(100)}`);
    products.forEach((p, i) => {
      console.log(`  ${String(i + 1).padEnd(2)} ${p.name.slice(0, 38).padEnd(40)} ${tierLabel(p.tier).padEnd(22)} ${fmt(p.price).padEnd(12)} ${String(p.score).padEnd(7)} ${p.status}`);
    });

    // Escada de valor
    console.log('\n  Escada de Valor:');
    const sorted = products.sort((a, b) => a.price - b.price);
    sorted.forEach((p, i) => {
      const arrow = i < sorted.length - 1 ? ' ↓' : '';
      console.log(`  ${tierLabel(p.tier)} ${p.name} (${fmt(p.price)})${arrow}`);
    });
  }

  // ── DISCOVER — descobrir novos produtos ───────────────────────────────────
  else if (mode === 'discover') {
    console.log('  → Descobrindo oportunidades de productização...');
    const result = await discoverProductOpportunities({
      recent_services: ['diagnóstico operacional', 'mapeamento de processos', 'automação n8n'],
      client_pain_points: ['retrabalho excessivo', 'processos manuais', 'custo alto operacional'],
    });
    saveOutput(`discover-${ts}.json`, result);

    console.log(`\n  Top oportunidade: ${result.top_recommendation}`);
    console.log(`  Insight: ${result.insight}`);
    console.log(`\n  Oportunidades identificadas:\n`);
    (result.opportunities || []).slice(0, 5).forEach((opp, i) => {
      const cls = opp.total_score >= 85 ? '🟢' : opp.total_score >= 70 ? '🟡' : '🔴';
      console.log(`  ${cls} ${i + 1}. [${opp.total_score}] ${opp.product_idea}`);
      console.log(`     Tipo: ${opp.product_type} | Preço: ${opp.price_range} | Tier: ${opp.tier}`);
      console.log(`     ${opp.promise}`);
      console.log(`     Upsell → ${opp.upsell_to} | Validar: ${opp.validation_method}`);
    });
    if (result.quick_wins?.length > 0) {
      console.log(`\n  ⚡ Quick wins: ${result.quick_wins.join(', ')}`);
    }
  }

  // ── SCORE — pontuar serviço para productização ────────────────────────────
  else if (mode === 'score') {
    const service = getArg('service', 'análise de gargalos operacionais');
    const context = getArg('context', '');
    console.log(`  → Pontuando: "${service}"...`);
    const result = await scoreService({ service, context });
    saveOutput(`score-${ts}.json`, result);

    const icon = result.total_score >= 85 ? '🟢' : result.total_score >= 70 ? '🟡' : '🔴';
    console.log(`\n  ${icon} Score: ${result.total_score}/100 — ${result.classification}`);
    console.log(`  Melhor formato: ${result.best_format}`);
    console.log(`  Preço sugerido: ${result.price_suggestion}`);
    console.log(`  Papel no funil: ${result.funnel_role}`);
    console.log(`  Principal obstáculo: ${result.main_blocker}`);
    console.log(`  Primeiro passo: ${result.first_step}`);
    console.log('\n  Score por critério:');
    if (result.scores) {
      Object.entries(result.scores).forEach(([k, v]) => {
        const bar = '█'.repeat(Math.round(v / 10 * 5));
        console.log(`  ${k.padEnd(25)} ${bar.padEnd(10)} ${v}/10`);
      });
    }
  }

  // ── OFFER — criar oferta completa para produto ────────────────────────────
  else if (mode === 'offer') {
    const productId = getArg('product', 'diagnostico-express');
    console.log(`  → Criando oferta para: ${productId}...`);
    const result = await designOffer(productId);
    saveOutput(`offer-${productId}-${ts}.json`, result);

    console.log(`\n  ${result.headline}`);
    console.log(`  ${result.subheadline}\n`);
    console.log(`  Público: ${result.target_audience}`);
    console.log(`  Dor: ${result.main_pain}`);
    console.log(`  Promessa: ${result.promise}`);
    console.log(`  Preço: ${fmt(result.price)} | Âncora: ${result.price_anchor}`);
    console.log(`  Justificativa: ${result.price_justification}`);
    console.log('\n  Entregáveis:');
    (result.deliverables || []).forEach((d, i) => console.log(`  ${i+1}. ${d.item} — ${d.description}`));
    if (result.bonuses?.length > 0) {
      console.log('\n  Bônus:');
      result.bonuses.forEach(b => console.log(`  + ${b.bonus} (${b.value})`));
    }
    console.log(`\n  CTA: ${result.cta}`);
    console.log(`  Próxima oferta: ${result.upsell_path}`);
    console.log('\n  --- WhatsApp Pitch ---');
    console.log(`  ${result.whatsapp_pitch}`);
    console.log(`\n  Ponto mais forte: ${result.strongest_element}`);
    console.log(`  Ponto mais fraco: ${result.weakest_element}`);
  }

  // ── LADDER — escada de valor completa ─────────────────────────────────────
  else if (mode === 'ladder') {
    console.log('  → Desenhando escada de valor completa...');
    const result = await designValueLadder();
    saveOutput(`ladder-${ts}.json`, result);

    console.log(`\n  Escada de Valor SmartOps IA\n`);
    (result.value_ladder || []).forEach(step => {
      console.log(`  Passo ${step.step}: ${step.product} (${fmt(step.price)})`);
      console.log(`    Papel: ${step.role}`);
      console.log(`    Promessa: ${step.promise}`);
      console.log(`    Conversão alvo: ${step.conversion_target}`);
      console.log(`    Trigger upsell: ${step.trigger_to_next}\n`);
    });
    console.log(`  LTV estimado: ${result.avg_ltv_estimate}`);
    console.log(`  Passo mais fraco: ${result.weakest_step}`);
    console.log(`  Produto faltando: ${result.missing_step}`);
    console.log(`  Foco nos próximos 30d: ${result.recommended_focus}`);
  }

  // ── VALIDATE — plano de validação ─────────────────────────────────────────
  else if (mode === 'validate') {
    const productId = getArg('product', 'diagnostico-express');
    const context   = getArg('context', '');
    console.log(`  → Criando plano de validação para: ${productId}...`);
    const result = await createValidationPlan(productId, context);
    saveOutput(`validation-${productId}-${ts}.json`, result);

    console.log(`\n  Produto: ${result.product}`);
    console.log(`  Estratégia: ${result.validation_strategy}`);
    console.log(`  Método: ${result.recommended_method}`);
    console.log(`  Hipótese: ${result.hypothesis}`);
    console.log(`  Sinal mínimo: ${result.minimum_signal}`);
    console.log(`  Duração: ${result.test_duration_days} dias`);
    console.log(`  Custo: ${result.test_cost_estimate}`);
    console.log('\n  Passos:');
    (result.steps || []).forEach(s => console.log(`  ${s.day}: ${s.action} [${s.tool}] → ${s.output}`));
    console.log(`\n  MVP rápido: ${result.fast_mvp}`);
    console.log('\n  Critério de decisão:');
    if (result.decision_criteria) {
      console.log(`  ✓ Construir: ${result.decision_criteria.build}`);
      console.log(`  ↻ Iterar:   ${result.decision_criteria.iterate}`);
      console.log(`  ✗ Arquivar: ${result.decision_criteria.discard}`);
    }
    console.log('\n  --- Script de Oferta Direta ---');
    console.log(`  ${result.direct_offer_script}`);
  }

  // ── DIAGNOSTIC — criar produto de diagnóstico ──────────────────────────────
  else if (mode === 'diagnostic') {
    const focus = getArg('focus', 'operacional');
    console.log(`  → Criando diagnóstico productizado [${focus}]...`);
    const result = await createDiagnosticProduct(focus);
    saveOutput(`diagnostic-${focus}-${ts}.json`, result);

    console.log(`\n  ${result.diagnostic_name}`);
    console.log(`  ${result.tagline}\n`);
    console.log(`  Público: ${result.target_audience}`);
    console.log(`  Dor: ${result.pain_addressed}`);
    console.log(`  Promessa: ${result.promise}`);
    console.log(`  Preço: ${fmt(result.price)} | Custo: ${fmt(result.cost_to_deliver_brl)} | Margem: ${result.margin_pct}%`);
    console.log('\n  Processo:');
    Object.values(result.process || {}).forEach(step => {
      console.log(`  ${step.name} [${step.time}]: ${step.output}`);
    });
    console.log(`\n  Upsell: ${result.upsell_product}`);
    console.log(`  Script upsell: ${result.upsell_script}`);
    console.log(`  Conversão esperada: ${result.conversion_expected}`);
    console.log(`  Automação: ${result.automation_opportunity}`);
  }

  // ── LAUNCH — plano de lançamento ──────────────────────────────────────────
  else if (mode === 'launch') {
    const productId = getArg('product',  'diagnostico-express');
    const budget    = parseFloat(getArg('budget', '0'));
    const launchDate = getArg('date',   '');
    console.log(`  → Criando plano de lançamento para: ${productId}...`);
    const result = await createLaunchPlan(productId, { budget, launch_date: launchDate });
    saveOutput(`launch-${productId}-${ts}.json`, result);

    const plan = result.launch_plan;
    console.log(`\n  Produto: ${plan?.product}`);
    console.log(`  Lançamento alvo: ${plan?.launch_date_target}`);
    console.log(`  Estratégia: ${plan?.launch_strategy}`);
    console.log('\n  Pré-lançamento:');
    (result.pre_launch?.actions || []).slice(0, 3).forEach(a => {
      console.log(`  ${a.day}: ${a.action} [${a.channel}]`);
    });
    console.log('\n  Dia do lançamento:');
    (result.launch_day?.content || []).forEach(c => console.log(`  • ${c}`));
    console.log('\n  Métricas de sucesso:');
    if (result.success_metrics) {
      console.log(`  Mínimo:  ${result.success_metrics.minimum}`);
      console.log(`  Esperado: ${result.success_metrics.expected}`);
      console.log(`  Excelente: ${result.success_metrics.excellent}`);
    }
    console.log('\n  Checklist:');
    (result.launch_checklist || []).slice(0, 5).forEach(c => console.log(`  ${c}`));
  }

  // ── ROADMAP — roadmap 90 dias ─────────────────────────────────────────────
  else if (mode === 'roadmap') {
    console.log('  → Gerando roadmap de produtos 90 dias...');
    const result = await generateProductRoadmap();
    saveOutput(`roadmap-${ts}.json`, result);

    console.log(`\n  ${result.roadmap_title}`);
    console.log(`  Estratégia: ${result.strategy}\n`);

    Object.values(result.phases || {}).forEach(phase => {
      console.log(`  ${phase.label}`);
      console.log(`  Meta: ${phase.goal}`);
      (phase.products_to_launch || []).forEach(p => {
        console.log(`  [${p.priority}] ${p.action}: ${p.product}`);
      });
      console.log(`  Receita esperada: ${phase.expected_revenue}`);
      console.log(`  Ação chave: ${phase.key_action}\n`);
    });

    console.log('  Prioridade de produtos:');
    (result.product_priority_ranking || []).slice(0, 3).forEach(p => {
      console.log(`  ${p.rank}. ${p.product} — ${p.why} (${p.expected_revenue_30d})`);
    });

    console.log('\n  Forecast de receita 90 dias:');
    if (result.revenue_forecast) {
      console.log(`  Conservador: ${result.revenue_forecast.conservative}`);
      console.log(`  Realista:    ${result.revenue_forecast.realistic}`);
      console.log(`  Otimista:    ${result.revenue_forecast.optimistic}`);
    }
    console.log(`\n  Recomendação: ${result.recommendation}`);
  }

  // ── FUNNEL — mapa do funil de produtos ────────────────────────────────────
  else if (mode === 'funnel') {
    console.log('  → Mapeando funil de produtos SmartOps IA...');
    const result = await generateProductFunnel();
    saveOutput(`funnel-${ts}.json`, result);

    console.log(`\n  ${result.funnel_name}\n`);
    (result.stages || []).forEach(s => {
      console.log(`  Etapa ${s.stage}: ${s.name}`);
      console.log(`    Produto: ${s.product}`);
      console.log(`    Meta: ${s.goal}`);
      console.log(`    CTA: ${s.cta}`);
      console.log(`    Conversão alvo: ${s.conversion_target}`);
      console.log(`    Próximo: ${s.trigger_to_next}\n`);
    });
    console.log(`  LTV da jornada completa: ${result.lifetime_value_journey}`);
    console.log(`  Maior drop-off: ${result.biggest_drop_off}`);
    console.log(`  Maior alavanca: ${result.optimization_opportunity}`);
  }

  // ── REPORT — relatório de produtos ───────────────────────────────────────
  else if (mode === 'report') {
    const products = listInitialProducts();
    const byTier = products.reduce((acc, p) => {
      if (!acc[p.tier]) acc[p.tier] = [];
      acc[p.tier].push(p);
      return acc;
    }, {});

    const report = {
      generated_at:    new Date().toISOString(),
      total_products:  products.length,
      products_by_tier: byTier,
      top_by_score:    products.slice(0, 3),
      launch_ready:    products.filter(p => p.score >= 85),
      need_validation: products.filter(p => p.score >= 70 && p.score < 85),
      backlog:         products.filter(p => p.score < 70),
      potential_mrr:   CONFIG.initial_products['smartops-monthly'].price,
      max_ticket:      Math.max(...products.map(p => p.price)),
      summary:         `${products.length} produtos mapeados | ${products.filter(p => p.score >= 85).length} prontos para lançar | MRR potencial: ${fmt(CONFIG.initial_products['smartops-monthly'].price)}/cliente`,
    };
    saveOutput(`product-report-${ts}.json`, report);

    console.log(`\n  Relatório de Produtos SmartOps IA`);
    console.log(`  ${report.summary}\n`);
    console.log(`  Prontos para lançar (score ≥ 85):`);
    report.launch_ready.forEach(p => console.log(`  ✓ [${p.score}] ${p.name} — ${fmt(p.price)}`));
    console.log(`\n  Para validar (score 70-84):`);
    report.need_validation.forEach(p => console.log(`  ~ [${p.score}] ${p.name} — ${fmt(p.price)}`));
    if (report.backlog.length > 0) {
      console.log(`\n  Backlog (score < 70):`);
      report.backlog.forEach(p => console.log(`  ○ [${p.score}] ${p.name}`));
    }
  }

  else {
    console.log('Modos disponíveis:');
    console.log('  catalog | discover | score | offer | ladder');
    console.log('  validate | diagnostic | launch | roadmap | funnel | report');
  }
}

main().catch(err => {
  console.error('\n✗ Productization Agent error:', err.message);
  process.exit(1);
});
