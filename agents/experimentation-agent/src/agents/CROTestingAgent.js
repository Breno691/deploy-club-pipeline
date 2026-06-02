// CROTestingAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// Checklist de CRO por elemento
const CRO_CHECKLIST = {
  headline: [
    'Clareza da proposta de valor em < 5 segundos',
    'Menciona o problema do cliente (não a empresa)',
    'Contém benefício específico e mensurável',
    'Está alinhado com o anúncio que trouxe o visitante',
  ],
  cta: [
    'Verbo de ação claro (Agendar / Ver / Solicitar)',
    'Visível acima da dobra',
    'Cor contrasta com o fundo',
    'Texto do CTA remove atrito (gratuito / sem compromisso)',
    'Aparece pelo menos 3x na página (início, meio, fim)',
  ],
  social_proof: [
    'Depoimento com nome, empresa e resultado específico',
    'Número concreto de clientes ou projetos',
    'Logo de empresas atendidas',
    'Caso de sucesso com antes/depois',
  ],
  form: [
    'Menos de 5 campos (ideal: nome + telefone)',
    'CTA do botão não é "Enviar"',
    'Não pede e-mail se não for necessário',
    'Mensagem de privacidade visível',
    'Funciona em mobile',
  ],
  page_speed: [
    'Carrega em < 3 segundos em mobile',
    'LCP < 2.5s',
    'INP < 200ms',
    'CLS < 0.1',
  ],
};

function auditPageLocally(pageData = {}) {
  const { headline, cta_text, has_social_proof, form_fields, lcp_s } = pageData;
  const issues = [];
  const opportunities = [];

  if (headline && headline.length > 100) issues.push({ element: 'headline', issue: 'Headline muito longa (> 100 chars)', severity: 'alto' });
  if (!has_social_proof) issues.push({ element: 'social_proof', issue: 'Sem prova social detectada', severity: 'alto' });
  if (form_fields > 5) issues.push({ element: 'form', issue: `${form_fields} campos no formulário (ideal: ≤ 5)`, severity: 'medio' });
  if (lcp_s > 3) issues.push({ element: 'speed', issue: `LCP de ${lcp_s}s (meta: < 2.5s)`, severity: 'alto' });
  if (cta_text?.toLowerCase().includes('enviar')) issues.push({ element: 'cta', issue: 'CTA "Enviar" não é persuasivo', severity: 'medio' });

  if (!has_social_proof) opportunities.push('Adicionar 1 depoimento com resultado concreto (+15-25% conversão)');
  if (form_fields > 3) opportunities.push('Reduzir para 2-3 campos (+20-30% taxa de preenchimento)');

  const cro_score = Math.max(0, 100 - (issues.filter(i => i.severity === 'alto').length * 20) - (issues.filter(i => i.severity === 'medio').length * 10));

  return {
    cro_score,
    issues,
    opportunities,
    checklist: CRO_CHECKLIST,
    audited_at: new Date().toISOString(),
  };
}

async function runCROAnalysisWithClaude(pageDescription, metrics = {}) {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o CRO Testing Agent da SmartOps IA.

Missão: Identificar elementos da página que reduzem conversão e criar testes A/B específicos para aumentar.

Página analisada: "${pageDescription}"
Métricas atuais: ${JSON.stringify(metrics, null, 2)}
Meta de conversão: ${CONFIG.growth_targets.conversao_delta_pct}% de crescimento/trimestre

Checklist CRO aplicável:
${Object.entries(CRO_CHECKLIST).map(([k, items]) => `${k}: ${items.slice(0, 2).join('; ')}`).join('\n')}

---

Gere o CRO Analysis Report:

# CRO ANALYSIS REPORT

## AUDIT DA PÁGINA
Score CRO: [0-100]
[Avaliar cada elemento: headline, CTA, prova social, formulário, velocidade, mobile]

## PROBLEMAS CRÍTICOS (P1)
[Elementos que estão destruindo conversão agora]

## TESTES A/B RECOMENDADOS
Para cada teste:
ELEMENTO: [o que testar]
HIPÓTESE: [afirmação testável]
CONTROLE: [versão atual]
VARIANTE: [versão nova]
MÉTRICA PRINCIPAL: [como medir]
UPLIFT ESPERADO: [%]
ESFORÇO: [Baixo/Médio/Alto]
PRIORIDADE: [1-5]

## QUICK WINS (< 2h de trabalho)
[Mudanças que podem ser feitas hoje sem risco]

## COPYWRITING MELHORADO
Headline atual → [avaliar]
Headline sugerida → [nova versão]
CTA atual → [avaliar]
CTA sugerido → [nova versão]

## PRÓXIMO TESTE A IMPLEMENTAR
[Teste #1 a executar esta semana + instruções]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { runCROAnalysisWithClaude, auditPageLocally, CRO_CHECKLIST };
