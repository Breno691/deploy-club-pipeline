// WebsiteDesignAgent.js — Design Intelligence Agent (SmartOps IA)
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { COLORS, BRAND, TYPOGRAPHY, getAccent } = require('../brand/brandTokens');

const client = new Anthropic();

// ── Analyze a website page and suggest visual improvements ────────────────────
async function analyzePageDesign({ page, conversion_rate, ctr, bounce_rate, issue, heatmap_insight }) {
  const prompt = `Você é o Website Design Agent da SmartOps IA — especialista em CRO visual.

SmartOps IA: ${BRAND.tagline} | ${BRAND.website}

DADOS DA PÁGINA:
- Página: ${page}
- Taxa de conversão: ${conversion_rate}%
- CTR do CTA: ${ctr}%
- Bounce rate: ${bounce_rate}%
- Problema identificado: ${issue}
- Insight de heatmap: ${heatmap_insight || 'não disponível'}

Analise e gere recomendações visuais em JSON:

{
  "page": "${page}",
  "performance_score": 0-100,
  "visual_diagnosis": "...",
  "priority_fixes": [
    {
      "element": "hero headline",
      "issue": "texto longo demais",
      "fix": "reduzir para 6 palavras impactantes",
      "expected_impact": "+15% de conversão",
      "effort": "baixo"
    }
  ],
  "new_layout_suggestion": {
    "headline": "...",
    "subheadline": "...",
    "cta_text": "...",
    "cta_position": "above_fold",
    "visual_style": "dark-premium-tech",
    "sections_order": ["hero", "pain", "method", "proof", "cta"]
  },
  "cta_recommendations": {
    "text": "...",
    "color": "${COLORS.primary}",
    "position": "above_fold + bottom",
    "size": "large"
  },
  "expected_impact": "...",
  "next_action": "..."
}

PRINCÍPIOS:
- Fundo escuro ${COLORS.background}
- CTA acima da dobra
- Headline máximo 8 palavras
- Hierarquia clara: dor → solução → prova → CTA
- Mobile first
- Contraste alto (mínimo 4.5:1)`;

  const response = await client.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 2000,
    messages:   [{ role: 'user', content: prompt }],
  });

  const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('WebsiteDesignAgent: no JSON from Claude');
  return JSON.parse(jsonMatch[0]);
}

// ── Generate a hero section HTML ──────────────────────────────────────────────
async function generateHeroSection({ headline, subheadline, cta, service_mode = 'lean' }) {
  const accent = getAccent(service_mode);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SmartOps IA</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${COLORS.background}; color: ${COLORS.text}; font-family: 'Inter', sans-serif; min-height: 100vh; }

  .hero {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 80px 40px; text-align: center; position: relative; overflow: hidden;
    background: radial-gradient(ellipse at 50% 0%, ${accent.soft} 0%, transparent 60%);
  }
  .hero::before {
    content: ''; position: absolute; inset: 0; z-index: 0;
    background-image:
      linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px);
    background-size: 54px 54px;
  }
  .hero-content { position: relative; z-index: 1; max-width: 880px; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: ${COLORS.surface}; border: 1px solid ${accent.border};
    border-radius: 99px; padding: 8px 20px; margin-bottom: 32px;
    font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;
    color: ${accent.color};
  }
  .hero-badge .dot { width: 8px; height: 8px; border-radius: 50%; background: ${accent.color}; }
  .hero-headline {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(56px, 8vw, 96px);
    line-height: 0.95; letter-spacing: 2px; text-transform: uppercase;
    color: ${COLORS.text}; margin-bottom: 24px;
  }
  .hero-headline .highlight { color: ${accent.color}; }
  .hero-sub {
    font-size: clamp(18px, 2vw, 24px); line-height: 1.5;
    color: ${COLORS.textSecondary}; max-width: 640px; margin: 0 auto 48px;
  }
  .hero-cta {
    display: inline-block; padding: 20px 56px;
    background: ${accent.color}; color: #fff;
    font-weight: 700; font-size: 18px; border-radius: 14px;
    text-decoration: none; box-shadow: 0 0 48px ${accent.glow};
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .hero-cta:hover { transform: translateY(-2px); box-shadow: 0 0 64px ${accent.glow}; }
  .hero-sub-cta {
    display: block; margin-top: 16px;
    font-size: 13px; color: ${COLORS.textMuted}; letter-spacing: 1px;
  }
</style>
</head>
<body>
<section class="hero">
  <div class="hero-content">
    <div class="hero-badge"><span class="dot"></span>${BRAND.specialist}</div>
    <h1 class="hero-headline">${headline || 'REDUZA DESPERDÍCIOS E <span class="highlight">AUTOMATIZE</span> SEU PROCESSO'}</h1>
    <p class="hero-sub">${subheadline || 'Consultoria presencial Lean Six Sigma + IA para PMEs em BH e região.'}</p>
    <a href="#diagnostico" class="hero-cta">${cta || BRAND.ctaMain}</a>
    <span class="hero-sub-cta">${BRAND.location} · Presencial · Sem compromisso</span>
  </div>
</section>
</body>
</html>`;
}

// ── Generate CTA section HTML ──────────────────────────────────────────────────
function generateCTASection({ headline, subtext, cta, service_mode = 'lean' }) {
  const accent = getAccent(service_mode);
  return `<section style="background:${COLORS.surface};border-top:1px solid ${COLORS.border};padding:80px 40px;text-align:center;">
  <h2 style="font-family:'Bebas Neue',sans-serif;font-size:72px;color:${COLORS.text};letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">${headline || 'PRONTO PARA ELIMINAR DESPERDÍCIOS?'}</h2>
  <p style="font-size:20px;color:${COLORS.textSecondary};max-width:600px;margin:0 auto 40px;line-height:1.5;">${subtext || 'Agende um diagnóstico gratuito de 30 minutos e descubra onde sua empresa perde dinheiro.'}</p>
  <a href="#diagnostico" style="display:inline-block;padding:20px 56px;background:${accent.color};color:#fff;font-weight:700;font-size:18px;border-radius:14px;text-decoration:none;box-shadow:0 0 48px ${accent.glow};">${cta || BRAND.ctaMain}</a>
  <p style="margin-top:16px;font-size:13px;color:${COLORS.textMuted};">${BRAND.location} · Presencial · Sem custo · ${BRAND.website}</p>
</section>`;
}

module.exports = { analyzePageDesign, generateHeroSection, generateCTASection };
