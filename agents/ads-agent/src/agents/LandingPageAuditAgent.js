// LandingPageAuditAgent.js — Diagnostica problemas pós-clique quando CTR ok mas CPA alto
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// Diagnóstico do cenário CTR bom + CPA alto
function detectPostClickProblem(metrics = {}) {
  const { ctr = 0, cpa = 0, conv_rate = 0, bounce_rate = 0, time_on_page_s = 0, platform = 'google_search' } = metrics;
  const bench = CONFIG.benchmarks[platform] || CONFIG.benchmarks.google_search;

  const has_good_ctr  = ctr >= bench.ctr_atencao;
  const has_high_cpa  = cpa > bench.cpa_max_brl;
  const has_low_conv  = conv_rate < 2;
  const has_high_bounce = bounce_rate > 70;
  const low_engagement = time_on_page_s < 30;

  const is_post_click_problem = has_good_ctr && (has_high_cpa || has_low_conv);
  const suspected_causes = [];

  if (has_high_bounce)   suspected_causes.push({ cause: 'Promessa do ad ≠ landing page',        priority: 1 });
  if (low_engagement)    suspected_causes.push({ cause: 'Página não prende — conteúdo fraco',   priority: 2 });
  if (has_low_conv)      suspected_causes.push({ cause: 'CTA ou formulário com atrito alto',    priority: 1 });
  if (!suspected_causes.length && is_post_click_problem) {
    suspected_causes.push({ cause: 'Oferta desalinhada com intenção de busca',                  priority: 1 });
  }

  return {
    is_post_click_problem,
    severity:        has_good_ctr && has_high_cpa ? 'alto' : 'medio',
    ctr_diagnosis:   `CTR ${ctr}% — ${has_good_ctr ? 'anúncio ok' : 'anúncio fraco'}`,
    cpa_diagnosis:   `CPA R$ ${cpa} — ${has_high_cpa ? 'acima do limite' : 'dentro do limite'}`,
    suspected_causes,
    recommended_action: is_post_click_problem ? 'Auditar landing page — problema pós-clique' : 'Problema no anúncio',
  };
}

async function auditLandingPageForAdsWithClaude(adsMetrics, pageDescription = '') {
  const diagnosis = detectPostClickProblem(adsMetrics);

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Landing Page Audit Agent (contexto de Ads) da SmartOps IA.

Missão: Diagnosticar problemas pós-clique quando o anúncio atrai cliques mas a landing page não converte.

Empresa: SmartOps IA — consultoria Lean + Automação IA, BH
Landing Page: "${pageDescription || 'página de destino dos anúncios'}"

Dados de Ads:
CTR: ${adsMetrics.ctr}% | CPA: R$ ${adsMetrics.cpa} | Taxa de Conversão: ${adsMetrics.conv_rate}%
Bounce Rate: ${adsMetrics.bounce_rate || '?'}% | Tempo médio: ${adsMetrics.time_on_page_s || '?'}s
Plataforma: ${adsMetrics.platform || 'google_ads'}

Diagnóstico local:
Problema pós-clique: ${diagnosis.is_post_click_problem ? 'SIM — ' + diagnosis.severity : 'NÃO'}
Causas prováveis: ${diagnosis.suspected_causes.map(c => c.cause).join(', ')}

CENÁRIO CLÁSSICO — CTR alto + CPA alto = 5 causas possíveis:
1. Promessa do anúncio ≠ conteúdo da página
2. Headline da página não continua a conversa do anúncio
3. CTA não é a próxima pergunta lógica
4. Formulário com campos demais
5. Velocidade de carregamento > 3s no mobile

Responda:

# LANDING PAGE AUDIT — DIAGNÓSTICO PÓS-CLIQUE

## VEREDITO
[Onde está o problema: no anúncio, na página ou em ambos]

## DIAGNÓSTICO DETALHADO
[Análise de cada indicador com evidência]

## AUDITORIA DA MENSAGEM (Ad Scent)
Promessa do anúncio: [o que o usuário espera ao clicar]
O que a página entrega: [o que de fato encontra]
Alinhamento: [forte/médio/fraco — e por quê]

## PROBLEMAS IDENTIFICADOS (por prioridade)
P1: [o que corrigir hoje]
P2: [o que corrigir esta semana]
P3: [otimização complementar]

## CORREÇÕES ESPECÍFICAS
Para cada problema:
ELEMENTO: [headline/CTA/formulário/velocidade/prova social]
VERSÃO ATUAL: [o que tem hoje — hipotético]
CORREÇÃO: [o que mudar — texto exato quando possível]

## TESTE A/B URGENTE
[O teste mais importante para resolver o CPA alto]

## ESTIMATIVA DE MELHORIA
Se corrigir P1 e P2: CPA de R$ ${adsMetrics.cpa} → R$ [estimativa]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { auditLandingPageForAdsWithClaude, detectPostClickProblem };
