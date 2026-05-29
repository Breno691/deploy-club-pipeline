require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName = get('--task') || 'cro';
const taskDate = get('--date') || new Date().toISOString().split('T')[0];
const pageUrl  = get('--url')  || 'https://smartopsIA.com.br';
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const croDir    = path.join(outputDir, 'cro');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'cro.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }

async function runCROAgent() {
  console.log(`\nCRO Agent — SmartOps IA`);
  console.log(`URL: ${pageUrl} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [croDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('cro_agent started');

  const brandIdentity   = readFileSafe('knowledge/brand_identity.md');
  const personas        = readFileSafe('knowledge/customer_personas.md');
  const contentStrategy = readFileSafe('knowledge/content_strategy.md');
  const leads           = readJsonSafe('data/leads.json') || [];

  const conversionData = {
    visitors: 0,
    leads_captured: leads.length,
    meetings: 0,
    proposals: 0,
    clients: 0,
    conversion_visitor_to_lead: '0%',
  };

  console.log('  → Analisando taxa de conversão e oportunidades de otimização...');
  appendLog(`CRO analysis for: ${pageUrl}`);

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o CRO Agent da SmartOps IA. Analisa e otimiza taxas de conversão por página e funil de vendas.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**URL analisada:** ${pageUrl}
**Data:** ${taskDate}

## DADOS DE CONVERSÃO (ATUAIS)
- Visitantes/mês: ${conversionData.visitors} (sem GA4 configurado)
- Leads capturados: ${conversionData.leads_captured}
- Reuniões agendadas: ${conversionData.meetings}
- Propostas enviadas: ${conversionData.proposals}
- Clientes fechados: ${conversionData.clients}

## PERSONAS
${personas.slice(0, 500) || '(não disponível)'}

## BRAND IDENTITY
${brandIdentity.slice(0, 400) || ''}

---

## TASK — Análise CRO Completa

# CRO Analysis — SmartOps IA
**Data:** ${taskDate} | **URL:** ${pageUrl}

---

## 1. Funil de Conversão Atual

\`\`\`
Visitante → Lead → Reunião → Proposta → Cliente
    ?    →   ${conversionData.leads_captured}  →    ${conversionData.meetings}    →    ${conversionData.proposals}   →    ${conversionData.clients}
\`\`\`

### Taxas Estimadas (sem GA4)
| Etapa | Conversão Estimada | Benchmark B2B | Gap |
|---|---|---|---|
| Visitante → Lead | [X]% | 2-5% | [gap] |
| Lead → Reunião | [X]% | 20-40% | |
| Reunião → Proposta | [X]% | 50-70% | |
| Proposta → Cliente | [X]% | 20-35% | |

---

## 2. Auditoria da Página Principal

### Hero Section
| Elemento | Situação Atual | Problema | Correção |
|---|---|---|---|
| Headline | [analisar] | [problema] | [melhoria] |
| Subheadline | | | |
| CTA principal | | | |
| Proposta de valor | | | |

### Seções Críticas para PMEs
| Seção | Presente? | Impacto na Conversão | Melhorar? |
|---|---|---|---|
| Prova social (cases/depoimentos) | Não/Sim | Alto | Sim — adicionar 3 cases |
| ROI específico em números | | | |
| Garantia clara | | | |
| CTA urgência (limitado/desconto) | | | |
| WhatsApp direto visível | | | |

---

## 3. Testes A/B Prioritários

| Teste | Variação A (atual) | Variação B (hipótese) | Métrica | Duração |
|---|---|---|---|---|
| CTA principal | "Saiba mais" | "Diagnóstico gratuito em 30min" | CTR | 2 semanas |
| Headline | [atual] | "Reduza custos 30% em 60 dias" | Scroll depth | 2 semanas |
| Formulário | [campos atuais] | Só WhatsApp | Lead rate | 4 semanas |

---

## 4. Otimizações Rápidas (Sem A/B — Implementar Hoje)

| Prioridade | Otimização | Onde | Impacto Esperado | Tempo |
|---|---|---|---|---|
| 🔴 Crítico | Adicionar WhatsApp flutuante | Todas as páginas | +20-40% contatos | 1h |
| 🔴 Crítico | Criar landing page de diagnóstico | Nova URL | +50% conversão | 4h |
| ⚠️ Alto | Depoimento de cliente na home | Hero section | +15-25% confiança | 2h |
| ⚠️ Alto | CTA no final de cada conteúdo | Blog/posts | +10% lead gen | 2h |

---

## 5. Landing Page de Alta Conversão

### Template — "Diagnóstico Gratuito"

**URL sugerida:** [url]/diagnostico

**Estrutura:**
\`\`\`
HEADLINE: "Descubra Quanto Sua Empresa Perde Por Mês em Ineficiências"
SUBHEADLINE: "Diagnóstico gratuito de 30 minutos — sem compromisso"

FORMULÁRIO (3 campos no máximo):
[ Nome ] [ WhatsApp ] [ Setor da empresa ]
[ QUERO MEU DIAGNÓSTICO GRATUITO ]

ABAIXO DO FOLD:
• O que você vai descobrir (3 bullets com ícone)
• Depoimento de cliente (nome + empresa)
• Logo SmartOps IA + "Black Belt Lean Six Sigma"
\`\`\`

---

## 6. Métricas CRO — Próximos 30 Dias

| Métrica | Baseline | Meta | Como Medir |
|---|---|---|---|
| Taxa visitante → lead | 0% (sem dados) | 3%+ | GA4 (quando configurar) |
| Cliques no WhatsApp | — | 10+/semana | WhatsApp Business |
| Diagnósticos agendados | 0 | 4+/semana | Calendly ou WhatsApp |
| Taxa diagnóstico → proposta | — | 60%+ | CRM manual |

---

## 7. Próximas Ações

1. **Hoje:** [ação mais impactante — 1 hora]
2. **Esta semana:** [criar landing page diagnóstico]
3. **Este mês:** [configurar GA4 + mensurar]`,
    }],
  });

  const croMD = resp.content[0].text.trim();
  appendLog('CRO analysis generated');

  fs.writeFileSync(path.join(croDir, 'cro_report.md'), croMD);
  fs.writeFileSync(path.join(croDir, 'metrics.json'), JSON.stringify({
    date: taskDate,
    url: pageUrl,
    current_leads: leads.length,
    file: 'cro_report.md',
  }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Análise CRO: ${path.join(croDir, 'cro_report.md')}`);

  appendLog('cro_agent complete ✓');
}

runCROAgent().catch(err => {
  console.error('CRO Agent error:', err.message);
  process.exit(1);
});
