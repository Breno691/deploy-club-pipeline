require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task')   || process.env.TASK_NAME || 'proposta_demo';
const taskDate  = get('--date')   || new Date().toISOString().split('T')[0];
const clientName = get('--client') || 'cliente';
const notesFile  = get('--notes');  // path to meeting notes file
const tier       = get('--tier') || 'auto'; // quick-win | diagnostico | completo | parceria | auto

const outputDir   = path.join('outputs', `${taskName}_${taskDate}`);
const proposalDir = path.join(outputDir, 'proposals');

function appendLog(msg) {
  fs.appendFileSync(
    path.join(outputDir, 'logs', 'proposal_agent.log'),
    `[${new Date().toISOString()}] ${msg}\n`
  );
}

function readFileSafe(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

// ── Tier definitions ─────────────────────────────────────────────────────────
const TIERS = {
  'quick-win':   { label: 'Quick Win',            range: 'R$ 3.000–8.000',    duration: '2–4 semanas' },
  'diagnostico': { label: 'Diagnóstico + Plano',  range: 'R$ 8.000–15.000',   duration: '4–6 semanas' },
  'completo':    { label: 'Projeto Completo',      range: 'R$ 15.000–50.000',  duration: '2–4 meses'   },
  'parceria':    { label: 'Parceria Contínua',     range: 'R$ 3.000–8.000/mês', duration: 'Mensal'     },
};

async function generateProposal() {
  console.log(`\nProposal Agent — SmartOps IA`);
  console.log(`Cliente: ${clientName} | Task: ${taskName} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  // Create directories
  [proposalDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('proposal_agent started');

  // Load context
  const meetingNotes = notesFile ? readFileSafe(notesFile) : '';
  const salesPlaybook = readFileSafe('knowledge/sales_playbook.md');
  const personas      = readFileSafe('knowledge/customer_personas.md');
  const brandIdentity = readFileSafe('knowledge/brand_identity.md');
  const productInfo   = readFileSafe('knowledge/product_campaign.md');

  const client = new Anthropic();

  // ── Step 1: Analyze notes and classify client ─────────────────────────────
  appendLog('Step 1: Analyzing meeting notes...');
  console.log('  → Analisando notas da reunião...');

  const analysisPrompt = `Você é o Sales Intelligence Agent da SmartOps IA, consultoria Lean Six Sigma + Automação com IA para pequenas e médias empresas em BH.

## NOTAS DA REUNIÃO COM "${clientName}"

${meetingNotes || '(sem notas — gere uma proposta modelo genérica para diagnóstico inicial)'}

## PERSONAS DE REFERÊNCIA

${personas}

## TASK

Analise as notas e extraia as seguintes informações em JSON:

{
  "persona_match": "Carlos|Roberto|Ana|Paulo|outro",
  "setor": "setor da empresa",
  "tamanho": "micro|pequena|media",
  "funcionarios_estimado": number,
  "faturamento_estimado_mensal": number,
  "goals": "objetivo principal identificado",
  "plans": "tentativas anteriores",
  "challenges": "desafios principais",
  "timeline": "prazo para resultado",
  "budget": "faixa de orçamento mencionada ou estimada",
  "authority": "tomador de decisão identificado",
  "dor_principal": "descrição da dor em 1 frase",
  "dores_secundarias": ["lista", "de", "dores"],
  "tier_recomendado": "quick-win|diagnostico|completo|parceria",
  "justificativa_tier": "por que esse tier",
  "lead_score": number,
  "urgencia": "alta|media|baixa",
  "angulo_principal": "lean|automacao|ambos",
  "roi_potencial": {
    "economia_mensal_estimada": number,
    "economia_anual_estimada": number,
    "percentual_reducao_custo": number,
    "payback_meses": number,
    "metodologia_calculo": "como chegou nesses números"
  },
  "objecoes_previstas": ["lista de objeções prováveis"],
  "resumo_para_proposta": "2-3 frases descrevendo a situação do cliente para usar na proposta"
}

Retorne APENAS o JSON, sem markdown, sem explicações.`;

  const analysisResp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: analysisPrompt }],
  });

  let analysis = {};
  try {
    const raw = analysisResp.content[0].text.trim();
    const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    analysis = JSON.parse(jsonStr);
  } catch {
    analysis = { tier_recomendado: 'diagnostico', dor_principal: 'processo operacional com desperdício identificado', lead_score: 50 };
  }

  const finalTier = tier !== 'auto' ? tier : (analysis.tier_recomendado || 'diagnostico');
  const tierInfo  = TIERS[finalTier] || TIERS['diagnostico'];

  appendLog(`Analysis complete. Tier: ${finalTier} | Score: ${analysis.lead_score}`);
  console.log(`  → Tier recomendado: ${tierInfo.label} | Score: ${analysis.lead_score}`);

  // ── Step 2: Generate full proposal ──────────────────────────────────────
  appendLog('Step 2: Generating proposal...');
  console.log('  → Gerando proposta personalizada...');

  const proposalPrompt = `Você é o Proposal Agent da SmartOps IA. Breno Luiz é Black Belt Lean Six Sigma, consultor de melhoria de processos e automação com IA para PMEs em BH.

## CONTEXTO DO CLIENTE: "${clientName}"

${JSON.stringify(analysis, null, 2)}

## TIER DA PROPOSTA: ${tierInfo.label} — ${tierInfo.range} — ${tierInfo.duration}

## PLAYBOOK DE VENDAS

${salesPlaybook}

## IDENTIDADE DA MARCA

${brandIdentity}

## TASK

Gere uma proposta comercial completa, personalizada para "${clientName}", no seguinte formato Markdown:

---

# Proposta Comercial — [Nome do Projeto]
**Cliente:** ${clientName}
**Data:** ${taskDate}
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Contato:** (31) 97203-9180 | brenoluiz691@gmail.com

---

## 1. Diagnóstico — O Problema Identificado

[Descreva o problema específico do cliente com dados e evidências das notas. Use a dor principal. Seja específico — não genérico. Mostre que entende a realidade deles.]

## 2. Metodologia — Como Vamos Resolver

[Explique a abordagem: Lean Six Sigma + Automação com IA. Adapte ao setor e ao problema. Mencione as fases (ex: DMAIC, VSM). Seja concreto.]

## 3. Cronograma e Etapas

[Tabela com fases, duração e marcos. Adapte para o tier ${tierInfo.label}.]

## 4. Entregáveis

[Lista exata do que o cliente vai receber: mapas de processo, SOPs, relatórios, automações, etc.]

## 5. ROI Esperado

[Calcule o retorno com base nas estimativas. Use os números do campo roi_potencial. Mostre a conta claramente: "Se o processo atual custa R$ X por mês em retrabalho e eliminamos 30%, são R$ Y de economia/mês."]

## 6. Investimento

| Pacote | Valor |
|---|---|
| ${tierInfo.label} | ${tierInfo.range} |

*Formas de pagamento: à vista (5% desconto) ou parcelado (2x sem juros)*

## 7. Próximos Passos

[3 ações claras: o que o cliente precisa fazer para começar. Ex: assinar proposta, agendar kick-off, enviar acesso ao sistema.]

---

**Fechamento GPCTBA:**
> "Então, para resumir: seu objetivo é [X], você está enfrentando [Y], e tem prazo de [Z]. Com base nisso, a proposta é [solução]. Faz sentido para você?"

---

Escreva em português brasileiro. Tom: direto, técnico mas acessível, sem jargão acadêmico. Foque em resultado e ROI.`;

  const proposalResp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    messages: [{ role: 'user', content: proposalPrompt }],
  });

  const proposalMD = proposalResp.content[0].text.trim();
  appendLog('Proposal markdown generated');

  // ── Step 3: Executive summary (1 page) ────────────────────────────────
  appendLog('Step 3: Generating executive summary...');
  console.log('  → Gerando resumo executivo...');

  const summaryResp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: `Com base nesta proposta, gere um resumo executivo de 1 página em português para "${clientName}".
Inclua: dor principal, solução proposta, ROI esperado, investimento, prazo e próximo passo.
Tom: direto, sem enrolação, para decisor ocupado.

PROPOSTA:
${proposalMD}`,
    }],
  });

  const summaryMD = summaryResp.content[0].text.trim();
  appendLog('Executive summary generated');

  // ── Save outputs ─────────────────────────────────────────────────────
  const safeClient = clientName.toLowerCase().replace(/[^a-z0-9]/g, '_');

  fs.writeFileSync(path.join(proposalDir, `proposal_${safeClient}.md`), proposalMD);
  fs.writeFileSync(path.join(proposalDir, `executive_summary_${safeClient}.md`), summaryMD);
  fs.writeFileSync(
    path.join(proposalDir, `roi_calculation_${safeClient}.json`),
    JSON.stringify({ client: clientName, date: taskDate, tier: finalTier, tierInfo, ...analysis.roi_potencial, analysis }, null, 2)
  );
  fs.writeFileSync(
    path.join(proposalDir, `proposal_${safeClient}.json`),
    JSON.stringify({ client: clientName, date: taskDate, tier: finalTier, tierInfo, analysis, files: { proposal: `proposal_${safeClient}.md`, summary: `executive_summary_${safeClient}.md`, roi: `roi_calculation_${safeClient}.json` } }, null, 2)
  );

  appendLog('All outputs saved ✓');

  console.log(`\n  ✓ Proposta salva: ${path.join(proposalDir, `proposal_${safeClient}.md`)}`);
  console.log(`  ✓ Resumo executivo: executive_summary_${safeClient}.md`);
  console.log(`  ✓ Cálculo de ROI: roi_calculation_${safeClient}.json`);
  console.log(`\n  Tier: ${tierInfo.label} | Valor: ${tierInfo.range} | Prazo: ${tierInfo.duration}`);
  console.log(`  Lead Score: ${analysis.lead_score} | Urgência: ${analysis.urgencia}`);

  if (analysis.objecoes_previstas?.length) {
    console.log(`\n  Objeções previstas:`);
    analysis.objecoes_previstas.forEach(o => console.log(`    • ${o}`));
  }

  appendLog('proposal_agent complete ✓');
  return { status: 'ok', tier: finalTier, client: clientName, lead_score: analysis.lead_score };
}

generateProposal().catch(err => {
  console.error('Proposal Agent error:', err.message);
  process.exit(1);
});
