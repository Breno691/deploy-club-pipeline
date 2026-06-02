#!/usr/bin/env node
/**
 * Authority Building Intelligence Agent — SmartOps IA
 * Diretor de Autoridade, Relações Públicas e Thought Leadership
 *
 * Usage:
 *   node authority_agent.js --mode events
 *   node authority_agent.js --mode events --city "Belo Horizonte"
 *   node authority_agent.js --mode pitch --event "SEBRAE BH" --audience "donos de PMEs" --topic "lean-pmes"
 *   node authority_agent.js --mode linkedin --topic "retrabalho em PMEs" --type opinion
 *   node authority_agent.js --mode linkedin-plan --theme "custos ocultos"
 *   node authority_agent.js --mode podcast
 *   node authority_agent.js --mode podcast-brief --podcast "Empreenda BH" --topic "lean pmes"
 *   node authority_agent.js --mode live --partner "João Contador" --type accountant --audience "PMEs BH"
 *   node authority_agent.js --mode repurpose --source palestra --title "Lean para PMEs" --summary "..."
 *   node authority_agent.js --mode score
 *   node authority_agent.js --mode report
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const { scanEventOpportunities, generateEventPitch } = require('./src/agents/EventResearchAgent');
const { generateLinkedInContent, generateWeeklyLinkedInPlan } = require('./src/agents/LinkedInThoughtLeadershipAgent');
const { findPodcastOpportunities, generatePodcastBrief }      = require('./src/agents/PodcastOpportunityAgent');
const { repurposeContent, generateLiveCollaborationPlan }     = require('./src/agents/AuthorityContentAgent');
const { generateWeeklyAuthorityReport, calculateAuthorityScore } = require('./src/agents/AuthorityReportAgent');
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

async function main() {
  const mode = getArg('mode', 'events');
  const ts   = Date.now();

  console.log('\n=== AUTHORITY BUILDING INTELLIGENCE AGENT ===');
  console.log(`Diretor de Autoridade, Relações Públicas e Thought Leadership`);
  console.log(`Speaker: ${CONFIG.speaker.name} — ${CONFIG.speaker.title}`);
  console.log(`Modo: ${mode}\n`);

  // ── EVENTS — escanear oportunidades de eventos ────────────────────────────
  if (mode === 'events') {
    const city  = getArg('city',  'Belo Horizonte');
    const focus = getArg('focus', 'PMEs e empresários locais');
    console.log(`  → Escaneando eventos e oportunidades de palestra em ${city}...`);
    const result = await scanEventOpportunities(city, focus);
    saveOutput(`events-${ts}.json`, result);

    console.log(`\n  Top oportunidade: ${result.top_opportunity}`);
    console.log(`  Quick win: ${result.quick_win}`);
    console.log(`  Insight: ${result.weekly_insight}`);
    console.log('\n  Oportunidades identificadas:');
    (result.opportunities || [])
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .forEach((e, i) => {
        console.log(`  ${i + 1}. [${e.score}] ${e.event_name} — ${e.classification?.label}`);
        console.log(`     Público: ${e.audience}`);
        console.log(`     Tema sugerido: ${e.suggested_topic}`);
        console.log(`     Ação: ${e.next_action} (${e.urgency})`);
      });
  }

  // ── PITCH — gerar pitch de speaker para evento específico ─────────────────
  else if (mode === 'pitch') {
    const event    = getArg('event',    'Evento Empresarial BH');
    const audience = getArg('audience', 'donos de PMEs');
    const topic    = getArg('topic',    CONFIG.keynoteTopics[0].title);

    console.log(`  → Gerando pitch de speaker para: ${event}...`);
    const result = await generateEventPitch({ event_name: event, audience, suggested_topic: topic });
    saveOutput(`pitch-${event.replace(/\s/g, '-')}-${ts}.json`, result);

    console.log(`\n  Palestra: ${result.talk_title}`);
    console.log(`\n  --- Email Pitch ---`);
    console.log(`  Assunto: ${result.pitch_email?.subject}`);
    console.log(result.pitch_email?.body);
    console.log(`\n  CTA pós-palestra: ${result.post_talk_cta}`);
    console.log(`  Leads estimados: ${result.expected_leads}`);
  }

  // ── LINKEDIN — gerar conteúdo LinkedIn ───────────────────────────────────
  else if (mode === 'linkedin') {
    const topic       = getArg('topic', 'retrabalho em PMEs');
    const contentType = getArg('type',  'opinion');
    const pillar      = getArg('pillar', 'lean');

    console.log(`  → Gerando conteúdo LinkedIn: [${contentType}] ${topic}...`);
    const result = await generateLinkedInContent(topic, contentType, pillar);
    saveOutput(`linkedin-${contentType}-${ts}.json`, result);

    console.log(`\n  Headline: ${result.headline}`);
    console.log(`  Melhor dia: ${result.best_day_to_post} às ${result.best_time}`);
    console.log(`  Engajamento previsto: ${result.engagement_prediction}`);
    console.log('\n  --- Conteúdo ---');
    console.log(result.full_content);
    console.log(`\n  Hashtags: ${(result.hashtags || []).join(' ')}`);
  }

  // ── LINKEDIN-PLAN — plano semanal de conteúdo LinkedIn ───────────────────
  else if (mode === 'linkedin-plan') {
    const theme = getArg('theme', '');
    console.log('  → Gerando plano semanal LinkedIn...');
    const result = await generateWeeklyLinkedInPlan(theme);
    saveOutput(`linkedin-plan-${ts}.json`, result);

    console.log(`\n  Tema da semana: ${result.week_theme}`);
    console.log(`  Pilar foco: ${result.pillar_focus}`);
    console.log(`  Post de geração de leads: ${result.lead_generation_post}`);
    console.log('\n  Posts da semana:');
    (result.posts || []).forEach(p => {
      console.log(`  ${p.day}: [${p.type}] ${p.topic}`);
      console.log(`    "${p.headline}"`);
    });
  }

  // ── PODCAST — encontrar podcasts para participar ──────────────────────────
  else if (mode === 'podcast') {
    const focus = getArg('focus', 'empreendedorismo e negócios locais');
    console.log('  → Identificando oportunidades de podcast...');
    const result = await findPodcastOpportunities(focus);
    saveOutput(`podcasts-${ts}.json`, result);

    console.log(`\n  Top oportunidade: ${result.top_opportunity}`);
    console.log(`\n  Pitch rápido: "${result.quick_pitch}"`);
    console.log('\n  Podcasts identificados:');
    (result.opportunities || []).slice(0, 5).forEach((p, i) => {
      console.log(`  ${i + 1}. [${p.score}] ${p.podcast_name}`);
      console.log(`     Host: ${p.host} | Público: ${p.audience}`);
      console.log(`     Tema: ${p.suggested_topic}`);
      console.log(`     Ângulo: ${p.pitch_angle}`);
    });
  }

  // ── PODCAST-BRIEF — preparar para episódio específico ────────────────────
  else if (mode === 'podcast-brief') {
    const podcast  = getArg('podcast', 'Podcast BH Empresas');
    const host     = getArg('host',    '');
    const audience = getArg('audience', 'empreendedores locais');
    const topic    = getArg('topic',   'Lean Six Sigma para PMEs');

    console.log(`  → Preparando brief para: ${podcast}...`);
    const result = await generatePodcastBrief({ podcast_name: podcast, host, audience, suggested_topic: topic });
    saveOutput(`podcast-brief-${podcast.replace(/\s/g, '-')}-${ts}.json`, result);

    console.log(`\n  Abertura: ${result.opening_hook}`);
    console.log('\n  Mensagens-chave:');
    (result.key_messages || []).forEach((m, i) => console.log(`  ${i + 1}. ${m}`));
    console.log(`\n  CTA final: ${result.cta_at_end}`);
  }

  // ── LIVE — planejar live com parceiro ─────────────────────────────────────
  else if (mode === 'live') {
    const partner     = getArg('partner',  'Parceiro');
    const partnerType = getArg('type',     'accountant');
    const audience    = getArg('audience', 'PMEs e empresários locais');
    const topic       = getArg('topic',    '');

    console.log(`  → Planejando live com: ${partner}...`);
    const result = await generateLiveCollaborationPlan({
      partner_name: partner, partner_type: partnerType, audience, topic,
    });
    saveOutput(`live-${partner.replace(/\s/g, '-')}-${ts}.json`, result);

    console.log(`\n  Live: ${result.live_title}`);
    console.log(`  Tagline: ${result.tagline}`);
    console.log(`  Formato: ${result.format} | Duração: ${result.duration}`);
    console.log(`  Alcance estimado: ${result.expected_reach}`);
    console.log(`  Valor de autoridade: ${result.authority_value}`);
    console.log('\n  Agenda:');
    (result.agenda || []).forEach(a => console.log(`  ${a.time}: ${a.segment}`));
  }

  // ── REPURPOSE — reaproveitar conteúdo em múltiplos formatos ──────────────
  else if (mode === 'repurpose') {
    const source   = getArg('source',   'palestra');
    const title    = getArg('title',    'Conteúdo SmartOps IA');
    const summary  = getArg('summary',  'Conteúdo sobre Lean Six Sigma e IA para PMEs');
    const audience = getArg('audience', 'Donos de PMEs em BH');
    const insights = (getArg('insights', '') || '').split(',').filter(Boolean);

    console.log(`  → Repurposando: "${title}" (${source})...`);
    const result = await repurposeContent({ source_type: source, title, summary, audience, key_insights: insights });
    saveOutput(`repurpose-${source}-${ts}.json`, result);

    const reel  = result.repurposed_content?.reels_instagram || [];
    const posts = result.repurposed_content?.linkedin_posts  || [];
    console.log(`\n  Peças de conteúdo geradas: ${result.total_pieces}`);
    console.log(`  Reels: ${reel.length} | Posts LinkedIn: ${posts.length}`);
    console.log(`  Amplificação: ${result.authority_amplification}`);
    console.log(`  Programação: ${result.publication_schedule}`);
  }

  // ── SCORE — calcular authority score atual ────────────────────────────────
  else if (mode === 'score') {
    const metrics = {
      palestras:               parseInt(getArg('palestras', '0')),
      artigos:                 parseInt(getArg('artigos',   '0')),
      convites:                parseInt(getArg('convites',  '0')),
      mencoes:                 parseInt(getArg('mencoes',   '0')),
      seguidores_qualificados: parseInt(getArg('seguidores','0')),
      leads_inbound:           parseInt(getArg('leads',     '0')),
      parcerias:               parseInt(getArg('parcerias', '0')),
      eventos_participados:    parseInt(getArg('eventos',   '0')),
    };

    const result = calculateAuthorityScore(metrics);
    console.log(`\n  Authority Score: ${result.score}/100`);
    console.log(`  Avaliação: ${result.assessment}`);
    console.log(`  Meta 90 dias: ${result.target_90d} (faltam ${result.gap_90d} pontos)`);
    console.log(`  Meta 12 meses: ${result.target_12m} (faltam ${result.gap_12m} pontos)`);
  }

  // ── REPORT — relatório semanal de autoridade ──────────────────────────────
  else if (mode === 'report') {
    console.log('  → Gerando relatório semanal de autoridade...');
    const result = await generateWeeklyAuthorityReport({
      events_found:           parseInt(getArg('events',     '0')),
      pitches_sent:           parseInt(getArg('pitches',    '0')),
      speaking_engagements:   parseInt(getArg('speaking',   '0')),
      articles_published:     parseInt(getArg('articles',   '0')),
      linkedin_posts:         parseInt(getArg('posts',      '0')),
      podcast_appearances:    parseInt(getArg('podcasts',   '0')),
      lives_done:             parseInt(getArg('lives',      '0')),
      mentions:               parseInt(getArg('mentions',   '0')),
      leads_from_authority:   parseInt(getArg('leads',      '0')),
      followers_gained:       parseInt(getArg('followers',  '0')),
      revenue_attributed:     parseFloat(getArg('revenue',  '0')),
    });
    saveOutput(`authority-report-${ts}.json`, result);

    console.log(`\n  ${result.report_title}`);
    console.log(`  Authority Score: ${result.authority_score}/100 — ${result.authority_assessment}`);
    console.log(`  ${result.executive_summary}`);
    console.log(`  Insight: ${result.weekly_insight}`);
    console.log('\n  Prioridades semana seguinte:');
    (result.next_week_priorities || []).forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
  }

  else {
    console.log('Modos: events | pitch | linkedin | linkedin-plan | podcast | podcast-brief | live | repurpose | score | report');
  }
}

main().catch(err => {
  console.error('\n✗ Authority Agent error:', err.message);
  process.exit(1);
});
