#!/usr/bin/env node
/**
 * Personal Brand Intelligence Agent — SmartOps IA
 * Diretor de Marca Pessoal e Posicionamento Estratégico
 *
 * Usage:
 *   node personal_brand_agent.js --mode audit
 *   node personal_brand_agent.js --mode audit --bio "texto da bio atual"
 *   node personal_brand_agent.js --mode bio --platform linkedin --version medium
 *   node personal_brand_agent.js --mode bio --platform all
 *   node personal_brand_agent.js --mode narrative --type belief --topic "IA não resolve gestão ruim"
 *   node personal_brand_agent.js --mode narrative --type origin
 *   node personal_brand_agent.js --mode narrative --type backstage --topic "diagnóstico de processo"
 *   node personal_brand_agent.js --mode linkedin
 *   node personal_brand_agent.js --mode post --topic "Os 8 desperdícios Lean" --type autoridade
 *   node personal_brand_agent.js --mode instagram
 *   node personal_brand_agent.js --mode instagram-plan --theme "custos ocultos"
 *   node personal_brand_agent.js --mode storytelling --type transformation --topic "empresa reduz retrabalho"
 *   node personal_brand_agent.js --mode case-story --problem "atrasos na entrega" --result "30% de redução" --sector "logística"
 *   node personal_brand_agent.js --mode trust --objection "é muito caro"
 *   node personal_brand_agent.js --mode trust-sequence
 *   node personal_brand_agent.js --mode social-proof --metric "redução de 40% retrabalho" --sector "indústria"
 *   node personal_brand_agent.js --mode authority-audit --cases 0 --testimonials 0
 *   node personal_brand_agent.js --mode score
 *   node personal_brand_agent.js --mode content-plan
 *   node personal_brand_agent.js --mode report
 *   node personal_brand_agent.js --mode profile-audit
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const { auditPositioning, generatePositioningStatement, calculateBrandScore } = require('./src/agents/BrandPositioningAgent');
const { generateNarrative, generateFounderStory, generateOpinionPost, generateCaseStory } = require('./src/agents/NarrativeAgent');
const { generateBio, generateAllBios }           = require('./src/agents/BioOptimizationAgent');
const { generateLinkedInProfile, generateLinkedInPost } = require('./src/agents/LinkedInProfileAgent');
const { generateInstagramProfile, generateInstagramContentPlan } = require('./src/agents/InstagramProfileAgent');
const { generateAuthorityAudit }                 = require('./src/agents/ProofOfAuthorityAgent');
const { generateTrustContent, generateTrustSequence, generateSocialProofFromResult } = require('./src/agents/TrustBuildingAgent');
const { generateWeeklyBrandReport, generateProfileAuditReport, calculateFullBrandScore } = require('./src/agents/PersonalBrandReportAgent');
const { BRENO, CONTENT_PILLARS }                 = require('./src/config');

function getArg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function saveOutput(filename, content) {
  const dir = path.join(__dirname, 'outputs');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, filename);
  fs.writeFileSync(p, typeof content === 'string' ? content : JSON.stringify(content, null, 2), 'utf-8');
  console.log(`  ✓ Saved: ${p}`);
}

async function main() {
  const mode = getArg('mode', 'audit');
  const ts   = Date.now();

  console.log('\n=== PERSONAL BRAND INTELLIGENCE AGENT ===');
  console.log(`Diretor de Marca Pessoal e Posicionamento Estratégico`);
  console.log(`${BRENO.name} | ${BRENO.title}`);
  console.log(`Modo: ${mode}\n`);

  // ── AUDIT — audit brand positioning ───────────────────────────────────────
  if (mode === 'audit') {
    const bio = getArg('bio', BRENO.positioning);
    console.log('  → Auditando posicionamento atual...');
    const audit = await auditPositioning({ bio });
    saveOutput(`brand-audit-${ts}.json`, audit);

    console.log(`\n  Clarity Score: ${audit.positioning_clarity_score}/100`);
    console.log(`  Clareza: ${audit.brand_message_clarity}`);
    console.log(`  Forças: ${(audit.strengths || []).slice(0, 2).join(' | ')}`);
    console.log(`  Gaps: ${(audit.gaps || []).slice(0, 2).join(' | ')}`);
    if (audit.recommendations) {
      const p1 = audit.recommendations.filter(r => r.priority === 'P1');
      if (p1.length) console.log(`  P1: ${p1[0].action}`);
    }
    if (audit.updated_headline_suggestion) {
      console.log(`\n  Headline sugerida:\n  "${audit.updated_headline_suggestion}"`);
    }
  }

  // ── BIO — generate optimized bio ──────────────────────────────────────────
  else if (mode === 'bio') {
    const platform = getArg('platform', 'instagram');
    const version  = getArg('version', 'medium');

    if (platform === 'all') {
      console.log('  → Gerando todas as bios...');
      const bios = await generateAllBios();
      saveOutput(`all-bios-${ts}.json`, bios);
      bios.forEach(b => {
        console.log(`\n  [${b.platform}] ${b.version}:`);
        console.log(`  Headline: ${b.headline}`);
        console.log(`  Bio: ${(b.bio || '').slice(0, 120)}...`);
        console.log(`  CTA: ${b.cta}`);
      });
    } else {
      console.log(`  → Gerando bio para ${platform} (${version})...`);
      const bio = await generateBio({ platform, version });
      saveOutput(`bio-${platform}-${ts}.json`, bio);
      console.log(`\n  Headline: ${bio.headline}`);
      console.log(`  Bio:\n${bio.bio}`);
      console.log(`\n  CTA: ${bio.cta}`);
      console.log(`  Por que funciona: ${bio.why_it_works}`);
    }
  }

  // ── NARRATIVE — generate a narrative post ─────────────────────────────────
  else if (mode === 'narrative' || mode === 'storytelling') {
    const type     = getArg('type', 'belief');
    const topic    = getArg('topic', 'IA só gera valor quando resolve problema real');
    const platform = getArg('platform', 'instagram');
    const format   = getArg('format', 'post');

    console.log(`  → Gerando narrativa [${type}]: "${topic}"...`);
    const narrative = await generateNarrative({ type, context: topic, platform, format });
    saveOutput(`narrative-${type}-${ts}.json`, narrative);

    console.log(`\n  Tipo: ${narrative.narrative_type}`);
    console.log(`  Título: ${narrative.title}`);
    console.log(`  Hook: ${narrative.hook}`);
    console.log(`  Gatilho: ${narrative.emotional_trigger}`);
    console.log(`\n  --- Instagram ---`);
    console.log(narrative.platform_version?.instagram || narrative.full_narrative?.slice(0, 300));
    console.log(`\n  CTA: ${narrative.cta}`);
  }

  // ── CASE-STORY — transform a case into a story post ───────────────────────
  else if (mode === 'case-story') {
    const problem  = getArg('problem',  'retrabalho excessivo na operação');
    const result   = getArg('result',   'redução de 30% no tempo de ciclo');
    const sector   = getArg('sector',   'serviços');
    const location = getArg('location', 'BH');

    console.log(`  → Transformando case em narrativa: ${sector} — ${result}...`);
    const story = await generateCaseStory({ problem, result, sector, location });
    saveOutput(`case-story-${ts}.json`, story);

    console.log(`\n  Título: ${story.title}`);
    console.log(`  Hook: ${story.hook}`);
    console.log(`\n  Post:\n${story.platform_version?.instagram || story.full_narrative?.slice(0, 400)}`);
    console.log(`\n  CTA: ${story.cta}`);
  }

  // ── LINKEDIN — full profile optimization ──────────────────────────────────
  else if (mode === 'linkedin') {
    console.log('  → Gerando perfil LinkedIn completo otimizado...');
    const profile = await generateLinkedInProfile();
    saveOutput(`linkedin-profile-${ts}.json`, profile);

    console.log(`\n  Headline: ${profile.headline}`);
    console.log(`\n  About (preview):\n${(profile.about || '').slice(0, 300)}...`);
    console.log(`\n  CTA: ${profile.cta}`);
    console.log(`  Score: ${profile.optimization_score}/100`);
    if (profile.missing_elements?.length) {
      console.log(`  Faltando: ${profile.missing_elements.join(', ')}`);
    }
  }

  // ── POST — generate a LinkedIn post ───────────────────────────────────────
  else if (mode === 'post') {
    const topic = getArg('topic', 'Os 8 desperdícios Lean aplicados a PMEs');
    const type  = getArg('type', 'autoridade');
    console.log(`  → Gerando post LinkedIn: "${topic}"...`);
    const post = await generateLinkedInPost({ topic, type });
    saveOutput(`linkedin-post-${ts}.json`, post);

    console.log(`\n  Hook: ${post.hook}`);
    console.log(`\n  Post:\n${post.full_post}`);
    console.log(`\n  Melhor horário: ${post.best_posting_time}`);
  }

  // ── INSTAGRAM — full Instagram profile optimization ────────────────────────
  else if (mode === 'instagram') {
    console.log('  → Gerando perfil Instagram completo otimizado...');
    const profile = await generateInstagramProfile();
    saveOutput(`instagram-profile-${ts}.json`, profile);

    console.log(`\n  Bio completa:\n${profile.bio?.full_bio}`);
    console.log(`\n  Link strategy: ${profile.link_in_bio_strategy}`);
    console.log(`  Score: ${profile.optimization_score}/100`);
    console.log(`\n  Quick wins:`);
    (profile.quick_wins || []).forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
    console.log(`\n  Destaques: ${(profile.highlights || []).map(h => h.name).join(', ')}`);
  }

  // ── INSTAGRAM-PLAN — content plan for Instagram ────────────────────────────
  else if (mode === 'instagram-plan') {
    const theme = getArg('theme', '');
    console.log('  → Gerando plano de conteúdo Instagram...');
    const plan = await generateInstagramContentPlan(theme);
    saveOutput(`instagram-plan-${ts}.json`, plan);

    console.log(`\n  Tema da semana: ${plan.week_theme}`);
    console.log(`  Reel principal: ${plan.reels_of_the_week}`);
    console.log(`  Lead capture: ${plan.lead_capture_moment}`);
    console.log('\n  Posts:');
    (plan.posts || []).forEach(p => {
      console.log(`  ${p.day}: [${p.format}] ${p.topic}`);
      console.log(`    Hook: "${p.hook}"`);
    });
  }

  // ── TRUST — generate trust-building content ───────────────────────────────
  else if (mode === 'trust') {
    const objection = getArg('objection', 'nunca ouvi falar da SmartOps IA');
    const format    = getArg('format', 'post');
    console.log(`  → Gerando conteúdo de confiança para: "${objection}"...`);
    const result = await generateTrustContent(objection, format);
    saveOutput(`trust-content-${ts}.json`, result);

    console.log(`\n  Raiz da objeção: ${result.why_they_feel_this}`);
    console.log(`  Estratégia: ${result.trust_strategy}`);
    console.log(`\n  Hook: ${result.content?.hook}`);
    console.log(`\n  Conteúdo:\n${result.content?.full_post}`);
    console.log(`\n  CTA: ${result.content?.cta}`);
    console.log(`  Próximo conteúdo: ${result.follow_up_content}`);
  }

  // ── TRUST-SEQUENCE — full trust-building sequence ─────────────────────────
  else if (mode === 'trust-sequence') {
    const target = getArg('target', 'novo lead');
    console.log(`  → Gerando sequência de confiança para: ${target}...`);
    const result = await generateTrustSequence(target);
    saveOutput(`trust-sequence-${ts}.json`, result);

    console.log(`\n  Sequência: ${result.sequence_name}`);
    console.log(`  Objetivo: ${result.objective}`);
    console.log(`  Tempo estimado: ${result.estimated_time_to_trust}`);
    console.log('\n  Touchpoints:');
    (result.touchpoints || []).forEach(t => {
      console.log(`  ${t.step}. [${t.format}] ${t.topic}`);
      console.log(`     Objeção: ${t.objection_addressed}`);
    });
    console.log(`\n  CTA final: ${result.conversion_trigger}`);
  }

  // ── SOCIAL-PROOF — generate social proof from result ──────────────────────
  else if (mode === 'social-proof') {
    const metric   = getArg('metric',   'redução de retrabalho operacional');
    const sector   = getArg('sector',   'PME');
    const location = getArg('location', 'BH');
    const service  = getArg('service',  'Lean Six Sigma + Automação');
    const platform = getArg('platform', 'instagram');

    console.log(`  → Gerando prova social: ${metric} | ${sector}...`);
    const result = await generateSocialProofFromResult({ metric, sector, location, service, platform });
    saveOutput(`social-proof-${ts}.json`, result);

    console.log(`\n  Hook: ${result.hook}`);
    console.log(`\n  Post:\n${result.proof_post}`);
    console.log(`\n  CTA: ${result.cta}`);
    console.log(`  Hashtags: ${(result.hashtags || []).join(' ')}`);
  }

  // ── AUTHORITY AUDIT — audit authority proofs ───────────────────────────────
  else if (mode === 'authority-audit') {
    const cases        = parseInt(getArg('cases',        '0'), 10);
    const testimonials = parseInt(getArg('testimonials', '0'), 10);
    const events       = parseInt(getArg('events',       '0'), 10);
    const articles     = parseInt(getArg('articles',     '5'), 10);
    const followers    = parseInt(getArg('followers',    '500'), 10);

    const audit = generateAuthorityAudit({ credentials: 2, cases, testimonials, events, articles, followers });
    saveOutput(`authority-audit-${ts}.json`, audit);

    console.log(`\n  Authority Score: ${audit.authority_score}/100 (${audit.level})`);
    console.log(`  Forças: ${audit.strengths.join(', ')}`);
    console.log('\n  O que está faltando:');
    (audit.missing_proofs || []).forEach(m => console.log(`  [${m.priority}] ${m.item} — ${m.impact}`));
    console.log(`\n  Próxima ação: ${audit.next_action}`);
  }

  // ── SCORE — calculate full brand score ────────────────────────────────────
  else if (mode === 'score') {
    const metrics = {
      positioningClarity:  parseInt(getArg('positioning',  '7'), 10),
      contentConsistency:  parseInt(getArg('content',      '5'), 10),
      perceivedAuthority:  parseInt(getArg('authority',    '6'), 10),
      socialProof:         parseInt(getArg('social',       '4'), 10),
      inboundGenerated:    parseInt(getArg('inbound',      '3'), 10),
      engagementQuality:   parseInt(getArg('engagement',   '5'), 10),
      localReputation:     parseInt(getArg('local',        '6'), 10),
      credentials:         2, cases: parseInt(getArg('cases', '0'), 10),
      testimonials:        parseInt(getArg('testimonials', '0'), 10),
      events:              parseInt(getArg('events', '0'), 10),
      articles:            parseInt(getArg('articles', '5'), 10),
      followers:           parseInt(getArg('followers', '500'), 10),
    };

    const scores = calculateFullBrandScore(metrics);
    console.log(`\n  Brand Score:     ${scores.brand_score}/100 (${scores.brand_level})`);
    console.log(`  Authority Score: ${scores.authority_score}/100`);
    console.log(`  Composite Score: ${scores.composite_score}/100`);
    console.log(`  Meta 90 dias:    40 (gap: ${scores.gap_90d})`);
    console.log(`  Meta 12 meses:   80`);
    console.log(`  Próximo marco:   ${scores.next_milestone}`);
    saveOutput(`brand-score-${ts}.json`, scores);
  }

  // ── CONTENT-PLAN — generate weekly personal content plan ──────────────────
  else if (mode === 'content-plan') {
    const theme = getArg('theme', '');
    console.log('  → Gerando plano de conteúdo pessoal da semana...');
    const plan = await generateInstagramContentPlan(theme);
    saveOutput(`content-plan-${ts}.json`, plan);

    console.log(`\n  Tema: ${plan.week_theme}`);
    console.log(`  Meta de autoridade: ${plan.authority_goal}`);
    console.log('\n  Posts sugeridos:');
    (plan.posts || []).forEach(p => {
      console.log(`  ${p.day}: [${p.pillar}] ${p.topic} (${p.format})`);
      console.log(`    Hook: "${p.hook}"`);
    });
    const phrase = BRENO.signaturePhrases[Math.floor(Math.random() * BRENO.signaturePhrases.length)];
    console.log(`\n  Frase da marca: "${phrase}"`);
  }

  // ── REPORT — weekly brand report ──────────────────────────────────────────
  else if (mode === 'report') {
    console.log('  → Gerando relatório semanal de marca pessoal...');
    const result = await generateWeeklyBrandReport({
      posts_published:    parseInt(getArg('posts',      '0'), 10),
      inbound_leads:      parseInt(getArg('leads',      '0'), 10),
      profile_visits:     parseInt(getArg('visits',     '0'), 10),
      messages_received:  parseInt(getArg('messages',   '0'), 10),
      followers_gained:   parseInt(getArg('followers',  '0'), 10),
      meetings_from_brand:parseInt(getArg('meetings',   '0'), 10),
      revenue_from_brand: parseFloat(getArg('revenue',  '0')),
      scores: { cases: parseInt(getArg('cases', '0'), 10) },
    });
    saveOutput(`brand-report-${ts}.json`, result);

    console.log(`\n  ${result.report_title}`);
    console.log(`  Brand Score: ${result.brand_score}/100 — ${result.brand_level}`);
    console.log(`  ${result.executive_summary}`);
    console.log(`  Consistência: ${result.positioning_consistency}`);
    console.log(`  Insight: ${result.weekly_insight}`);
    console.log('\n  Próxima semana:');
    (result.next_week_actions || []).forEach((a, i) => console.log(`  ${i + 1}. ${a}`));
  }

  // ── PROFILE-AUDIT — full profile audit with recommendations ───────────────
  else if (mode === 'profile-audit') {
    const linkedinBio      = getArg('linkedin-bio', '');
    const instagramBio     = getArg('instagram-bio', '');
    const postsLastMonth   = parseInt(getArg('posts', '0'), 10);

    console.log('  → Auditando perfis LinkedIn e Instagram...');
    const result = await generateProfileAuditReport({
      linkedin_bio: linkedinBio, instagram_bio: instagramBio,
      linkedin_headline: BRENO.headlines.linkedin, posts_last_month: postsLastMonth,
    });
    saveOutput(`profile-audit-${ts}.json`, result);

    console.log(`\n  Score geral: ${result.overall_score}/100`);
    console.log(`  LinkedIn score: ${result.linkedin?.headline_score + result.linkedin?.bio_score}/200`);
    console.log(`  Instagram score: ${result.instagram?.bio_score}/100`);
    console.log('\n  Quick wins:');
    (result.quick_wins || []).forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
    console.log('\n  Melhorias prioritárias:');
    (result.priority_improvements || []).slice(0, 3).forEach((m, i) => {
      console.log(`  ${i + 1}. [${m.impact}] ${m.area}: ${m.action}`);
    });
  }

  else {
    console.log('Modos disponíveis:');
    console.log('  audit | bio | narrative | storytelling | case-story | linkedin | post');
    console.log('  instagram | instagram-plan | trust | trust-sequence | social-proof');
    console.log('  authority-audit | score | content-plan | report | profile-audit');
  }
}

main().catch(err => {
  console.error('\n✗ Personal Brand Agent error:', err.message);
  process.exit(1);
});
