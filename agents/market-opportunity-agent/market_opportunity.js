#!/usr/bin/env node
/**
 * Market Opportunity Intelligence Agent — SmartOps IA
 * Diretor de Expansão Estratégica e Inteligência de Mercado
 *
 * Usage:
 *   node market_opportunity.js --mode sectors --geo "Belo Horizonte"
 *   node market_opportunity.js --mode sector --id industrias_pequenas --geo "Contagem"
 *   node market_opportunity.js --mode local --city "Betim" --sector transportadoras
 *   node market_opportunity.js --mode prospects --sector clinicas --city "BH" --count 20
 *   node market_opportunity.js --mode campaign --sector clinicas --pain "agendamento manual" --channel "Instagram Reels"
 *   node market_opportunity.js --mode report
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const { getTopOpportunities, getAllSectorOpportunities, researchSector } = require('./src/agents/SectorResearchAgent');
const { researchLocalMarket, generateProspectList } = require('./src/agents/LocalMarketAgent');
const { generateCampaignBrief, generateLocalOutreach } = require('./src/agents/CampaignOpportunityAgent');

function getArg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function saveOutput(filename, content) {
  const dir = path.join(process.cwd(), 'outputs');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, filename);
  fs.writeFileSync(p, JSON.stringify(content, null, 2), 'utf-8');
  console.log(`  ✓ Saved: ${p}`);
}

async function main() {
  const mode = getArg('mode', 'sectors');
  const ts   = Date.now();

  console.log('\n=== MARKET OPPORTUNITY INTELLIGENCE AGENT ===');
  console.log(`Modo: ${mode}`);

  // ── LIST ALL SECTOR OPPORTUNITIES ─────────────────────────────────────────
  if (mode === 'sectors') {
    const geo  = getArg('geo', 'Belo Horizonte');
    const top  = parseInt(getArg('top', '8'), 10);
    console.log(`\n  → Top oportunidades em ${geo}...`);
    const opps = getTopOpportunities(top, geo);
    saveOutput(`opportunities-${geo.replace(/\s/g, '-')}-${ts}.json`, opps);

    console.log(`\n  Ranking de Oportunidades — ${geo}:`);
    opps.forEach((o, i) => {
      console.log(`  ${i+1}. [${o.score}] ${o.sector} — ${o.label} | Ticket: R$${o.expected_ticket}`);
      console.log(`     Dor: ${o.main_pain} | Oferta: ${o.offer_match}`);
    });
  }

  // ── DEEP SECTOR RESEARCH ───────────────────────────────────────────────────
  else if (mode === 'sector') {
    const sectorId = getArg('id', 'industrias_pequenas');
    const geo      = getArg('geo', 'Belo Horizonte');
    console.log(`\n  → Pesquisando setor: ${sectorId} em ${geo}...`);
    const research = await researchSector(sectorId, geo);
    saveOutput(`sector-research-${sectorId}-${ts}.json`, research);

    console.log(`\n  Setor: ${research.label || sectorId}`);
    console.log(`  Urgência: ${research.urgency_level}`);
    console.log(`  Concorrência: ${research.competition_level}`);
    console.log(`  Melhor oferta: ${research.best_offer}`);
    console.log(`  Canal: ${research.best_channel}`);
    console.log(`  Headline: "${research.best_message}"`);
    console.log(`  Primeiro passo: ${research.first_action}`);
  }

  // ── LOCAL MARKET RESEARCH ──────────────────────────────────────────────────
  else if (mode === 'local') {
    const city   = getArg('city', 'Belo Horizonte');
    const sector = getArg('sector', null);
    console.log(`\n  → Pesquisando mercado local: ${city}${sector ? ' / ' + sector : ''}...`);
    const market = await researchLocalMarket(city, sector);
    saveOutput(`local-market-${city.replace(/\s/g, '-')}-${ts}.json`, market);

    console.log(`\n  Cidade: ${market.city}`);
    console.log(`  Setores fortes: ${(market.strongest_sectors || []).join(', ')}`);
    console.log(`  Abordagem: ${market.prospect_approach}`);
    console.log(`  Ângulo: ${market.outreach_angle}`);
    console.log(`  Score: ${market.local_score}/100`);
  }

  // ── PROSPECT LIST ──────────────────────────────────────────────────────────
  else if (mode === 'prospects') {
    const sector = getArg('sector', 'industrias_pequenas');
    const city   = getArg('city', 'Belo Horizonte');
    const count  = parseInt(getArg('count', '20'), 10);
    console.log(`\n  → Gerando lista de prospects: ${sector} em ${city}...`);
    const list = await generateProspectList({ sector, city, count });
    saveOutput(`prospects-${sector}-${city.replace(/\s/g, '-')}-${ts}.json`, list);

    console.log(`\n  ${(list.prospects || []).length} prospects gerados.`);
    console.log(`  Top prospect: ${list.top_prospect_today}`);
    console.log(`  Ação da semana: ${list.weekly_action}`);
    console.log(`  Reuniões esperadas: ${list.expected_meetings}`);
  }

  // ── CAMPAIGN BRIEF ─────────────────────────────────────────────────────────
  else if (mode === 'campaign') {
    const sector   = getArg('sector', 'industrias_pequenas');
    const location = getArg('location', 'Belo Horizonte');
    const pain     = getArg('pain', 'retrabalho operacional');
    const offer    = getArg('offer', 'diagnóstico gratuito de desperdícios');
    const channel  = getArg('channel', 'Instagram Reels + Google Ads');
    console.log(`\n  → Gerando brief de campanha: ${sector} / ${channel}...`);
    const brief = await generateCampaignBrief({ sector, location, pain, offer, channel });
    saveOutput(`campaign-brief-${sector}-${ts}.json`, brief);

    console.log(`\n  Campanha: ${brief.campaign_name}`);
    console.log(`  Headline selecionada: "${brief.selected_headline}"`);
    console.log(`  CTA: ${brief.cta}`);
    console.log(`  CPL esperado: ${brief.expected_cpl} | CTR esperado: ${brief.expected_ctr}`);
    console.log(`  Budget: ${brief.budget_recommendation}`);
  }

  // ── LOCAL OUTREACH ─────────────────────────────────────────────────────────
  else if (mode === 'outreach') {
    const sector = getArg('sector', 'clinicas');
    const city   = getArg('city', 'Belo Horizonte');
    console.log(`\n  → Gerando abordagens de prospecção: ${sector} em ${city}...`);
    const outreach = await generateLocalOutreach({ sector, city });
    saveOutput(`outreach-${sector}-${ts}.json`, outreach);

    console.log(`\n  Melhor abordagem: ${outreach.best_approach}`);
    console.log(`\n  Script WhatsApp:\n${outreach.script_whatsapp}`);
  }

  // ── FULL REPORT ────────────────────────────────────────────────────────────
  else if (mode === 'report') {
    const geo  = getArg('geo', 'Belo Horizonte');
    const opps = getAllSectorOpportunities(geo);
    const top3 = opps.slice(0, 3);

    const report = {
      generated_at:  new Date().toISOString(),
      location:      geo,
      total_sectors: opps.length,
      top_opportunities: top3,
      attack_now:    opps.filter(o => o.priority === 'P0'),
      test_campaign: opps.filter(o => o.priority === 'P1'),
      monitor:       opps.filter(o => o.priority === 'P2'),
    };

    saveOutput(`market-report-${ts}.json`, report);
    console.log(`\n  Market Report — ${geo}`);
    console.log(`  Atacar agora: ${report.attack_now.map(o => o.sector).join(', ')}`);
    console.log(`  Testar campanha: ${report.test_campaign.map(o => o.sector).join(', ')}`);
    console.log(`  Top setor: ${top3[0]?.sector} (score ${top3[0]?.score})`);
  }

  else {
    console.log('Modos disponíveis: sectors | sector | local | prospects | campaign | outreach | report');
  }
}

main().catch(err => {
  console.error('\n✗ Market Opportunity Agent error:', err.message);
  process.exit(1);
});
