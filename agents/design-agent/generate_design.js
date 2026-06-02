#!/usr/bin/env node
/**
 * Design Intelligence Agent — SmartOps IA
 * Diretor Criativo Autônomo
 *
 * Usage:
 *   node generate_design.js --type post --topic "retrabalho" --headline "Retrabalho custa caro."
 *   node generate_design.js --type carousel --topic "desperdícios Lean" --slides 7
 *   node generate_design.js --type ad --pain "retrabalho" --offer "diagnóstico gratuito"
 *   node generate_design.js --type hero --headline "Lean + IA para PMEs"
 *   node generate_design.js --type page-audit --page "/diagnostico" --conversion 2.1 --ctr 1.4
 */

require('dotenv').config();
const path = require('path');
const fs   = require('fs');

const { generateAdCreative }              = require('./src/generators/generateAdCreative');
const { generateCarousel }                = require('./src/agents/CarouselAgent');
const { generateAdVariations }            = require('./src/agents/AdsDesignAgent');
const { analyzePageDesign, generateHeroSection } = require('./src/agents/WebsiteDesignAgent');

function getArg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function hasFlag(name) { return process.argv.includes(`--${name}`); }

function saveOutput(dir, filename, content) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, filename);
  fs.writeFileSync(p, typeof content === 'string' ? content : JSON.stringify(content, null, 2), 'utf-8');
  console.log(`  ✓ Saved: ${p}`);
  return p;
}

async function main() {
  const type         = getArg('type', 'post');
  const topic        = getArg('topic', 'retrabalho operacional');
  const headline     = getArg('headline', '');
  const subheadline  = getArg('sub', '');
  const cta          = getArg('cta', 'Diagnóstico gratuito — 30 min');
  const slides       = parseInt(getArg('slides', '7'), 10);
  const pain         = getArg('pain', topic);
  const offer        = getArg('offer', 'Diagnóstico Gratuito de Desperdícios');
  const audience     = getArg('audience', 'Donos de PMEs em BH/MG');
  const service      = getArg('service', 'lean');
  const ts           = Date.now();
  const outputDir    = path.join(process.cwd(), 'outputs', `design-${type}-${ts}`);

  console.log('\n=== DESIGN INTELLIGENCE AGENT ===');
  console.log(`Tipo: ${type} | Tema: ${topic}`);

  // ── Instagram Single Post ─────────────────────────────────────────────────
  if (type === 'post') {
    const designInput = {
      design_id:    `post-${ts}`,
      type:         'instagram_post',
      dimensions:   { width: 1080, height: 1080 },
      objective:    'lead_generation',
      audience,
      theme:        topic,
      headline:     headline || `${topic.charAt(0).toUpperCase() + topic.slice(1)} custa caro.`,
      subheadline:  subheadline || 'Descubra onde sua operação perde dinheiro com Lean + IA.',
      cta,
      template:     'pain_hook',
      visual_style: 'dark-premium-tech',
      service_mode: service,
    };
    await generateAdCreative(designInput, outputDir);
    console.log(`\n✓ Post gerado em: ${outputDir}`);
  }

  // ── Carousel ──────────────────────────────────────────────────────────────
  else if (type === 'carousel') {
    await generateCarousel({ topic, objective: 'education', slides, audience, service_mode: service, outputDir });
    console.log(`\n✓ Carrossel gerado em: ${outputDir}`);
  }

  // ── Ad Creative (3 variations) ────────────────────────────────────────────
  else if (type === 'ad') {
    console.log('\n  → Generating 3 ad variations...');
    const variations = await generateAdVariations({ offer, pain, audience, platform: 'instagram_square', service_mode: service });
    saveOutput(outputDir, 'ad-variations.json', variations);

    console.log('\n  Top 3 Variations:');
    variations.slice(0, 3).forEach((v, i) => {
      console.log(`  ${i+1}. [score ${v.score}] "${v.headline}" → ${v.creative_type}`);
    });

    // Generate HTML for the top variation
    const top = variations[0];
    const designInput = {
      design_id:    `ad-top-${ts}`,
      type:         'meta_ad_square',
      dimensions:   { width: 1080, height: 1080 },
      objective:    'lead_generation',
      audience,
      theme:        pain,
      headline:     top.headline,
      subheadline:  top.subheadline,
      cta:          top.cta,
      template:     top.layout || 'pain_hook',
      visual_style: top.visual_style || 'dark-premium-tech',
      service_mode: service,
    };
    await generateAdCreative(designInput, path.join(outputDir, 'top-variation'));
    console.log(`\n✓ Ad creatives gerados em: ${outputDir}`);
  }

  // ── Hero Section ──────────────────────────────────────────────────────────
  else if (type === 'hero') {
    console.log('\n  → Generating hero section HTML...');
    const html = await generateHeroSection({ headline, subheadline, cta, service_mode: service });
    saveOutput(outputDir, 'hero.html', html);
    console.log(`\n✓ Hero section gerado em: ${outputDir}`);
  }

  // ── Page Audit ────────────────────────────────────────────────────────────
  else if (type === 'page-audit') {
    const page          = getArg('page', '/diagnostico');
    const conversion    = parseFloat(getArg('conversion', '2.5'));
    const ctrAudit      = parseFloat(getArg('ctr', '1.2'));
    const bounce        = parseFloat(getArg('bounce', '72'));
    const issue         = getArg('issue', 'Conversão abaixo da meta de 5%');
    const heatmap       = getArg('heatmap', 'Usuários não chegam ao CTA');

    console.log(`\n  → Analyzing page: ${page}...`);
    const analysis = await analyzePageDesign({
      page, conversion_rate: conversion, ctr: ctrAudit,
      bounce_rate: bounce, issue, heatmap_insight: heatmap,
    });
    saveOutput(outputDir, 'page-audit.json', analysis);

    console.log('\n  Diagnóstico Visual:');
    console.log(`  Score: ${analysis.performance_score}/100`);
    console.log(`  Diagnóstico: ${analysis.visual_diagnosis}`);
    (analysis.priority_fixes || []).slice(0, 3).forEach((f, i) => {
      console.log(`  Fix ${i+1}: ${f.element} — ${f.fix} (${f.expected_impact})`);
    });
    console.log(`\n✓ Análise salva em: ${outputDir}`);
  }

  else {
    console.log(`Tipo desconhecido: ${type}`);
    console.log('Tipos disponíveis: post | carousel | ad | hero | page-audit');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\n✗ Design Agent error:', err.message);
  process.exit(1);
});
