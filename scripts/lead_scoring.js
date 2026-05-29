require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task') || 'lead_score';
const taskDate  = get('--date') || new Date().toISOString().split('T')[0];
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const lsDir     = path.join(outputDir, 'lead_scoring');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'lead_scoring.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }
const getData = require('../lib/data');
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }

async function runLeadScoring() {
  console.log(`\nLead Scoring Agent — SmartOps IA`);
  console.log(`Task: ${taskName} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [lsDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('lead_scoring started');

  const leads       = await getData.getLeads();
  const salesPlaybook = readFileSafe('knowledge/sales_playbook.md');
  const personas      = readFileSafe('knowledge/customer_personas.md');

  console.log(`  → Calculando score de ${leads.length} leads e priorizando pipeline...\n`);
  appendLog(`Scoring ${leads.length} leads...`);

  const leadsContext = leads.length > 0
    ? leads.map((l, i) => `Lead ${i + 1}: ${JSON.stringify(l)}`).join('\n')
    : 'Nenhum lead no pipeline ainda. Gerar modelo de scoring para uso futuro.';

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Lead Scoring Agent da SmartOps IA. Analisa e pontua todos os leads do pipeline, prioriza quem deve ser contactado hoje, e identifica quais leads têm maior probabilidade de fechar.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Data:** ${taskDate}

## SISTEMA DE SCORING (máximo 100 pontos)

| Critério | Pontos |
|---|---|
| Decisor (dono/CEO que decide sozinho) | +15 |
| Empresa 10-50 funcionários | +10 |
| Já tentou resolver e falhou | +8 |
| Urgência clara (perda de dinheiro visível) | +12 |
| Veio por indicação | +15 |
| Setor prioritário (saúde, serviços, indústria) | +8 |
| LinkedIn/Instagram ativo | +5 |
| Respondeu perguntas com detalhes | +10 |
| Tem orçamento disponível | +10 |
| BH/MG (facilita atendimento) | +7 |

**Categorias:**
- 80-100: 🔥 Hot — Fechar esta semana
- 60-79: ⭐ Warm — Follow-up em 48h
- 40-59: 🟡 Morno — Nutrir com conteúdo
- < 40: 🔵 Frio — Descartar ou nurturing longo

## LEADS NO PIPELINE
${leadsContext}

${personas ? `## PERSONAS IDEAIS:\n${personas.slice(0, 600)}` : ''}

---

# Lead Scoring Report — SmartOps IA
**${taskDate}**

---

## 1. Ranking de Leads (ordem de prioridade)

${leads.length > 0 ? `
| # | Nome/Empresa | Score | Categoria | Última interação | Ação Recomendada |
|---|---|---|---|---|---|
${leads.map((l, i) => `| ${i+1} | ${l.nome || 'Lead ' + (i+1)} / ${l.empresa || '-'} | [calcular] | [categoria] | ${l.ultimo_contato || '-'} | [ação] |`).join('\n')}
` : `
*(Nenhum lead cadastrado ainda. Template de scoring criado para uso quando leads forem adicionados a data/leads.json)*
`}

---

## 2. Análise do Pipeline

### Distribuição por Temperatura
| Temperatura | Qtd | % do Pipeline | Receita Potencial |
|---|---|---|---|
| 🔥 Hot (80-100) | [X] | [X]% | R$ [X] |
| ⭐ Warm (60-79) | [X] | [X]% | R$ [X] |
| 🟡 Morno (40-59) | [X] | [X]% | R$ [X] |
| 🔵 Frio (<40) | [X] | [X]% | R$ [X] |
| **Total** | ${leads.length} | 100% | **R$ [X]** |

---

## 3. Plano de Ação por Lead

### 🔥 HOT — Ação hoje

${leads.length > 0 ? leads.filter(l => l.score >= 80 || l.status === 'lead_quente').map(l => `
**${l.nome || 'Lead'}** (${l.empresa || '-'})
- Score: ${l.score || '[calcular]'}
- Problema: ${l.problema || 'não informado'}
- Última interação: ${l.ultimo_contato || '-'}
- **Ação:** ${l.status === 'lead_quente' ? 'Ligar hoje e propor reunião de diagnóstico' : 'Agendar diagnóstico'}
- **Script:** "Olá [nome], vi que você estava interessado em reduzir seus custos operacionais. Tenho 30 minutos esta semana para um diagnóstico gratuito — seria útil para você?"
`).join('') || '_(nenhum lead quente no momento)_' : '_(adicionar leads em data/leads.json)_'}

### ⭐ WARM — Follow-up em 48h

| Lead | Score | Ação | Mensagem |
|---|---|---|---|
${leads.length > 0 ? leads.filter(l => (l.score || 0) >= 60 && (l.score || 0) < 80).map(l => `| ${l.nome || '-'} | ${l.score || '-'} | WhatsApp | Enviar case relevante |`).join('\n') || '| _(nenhum)_ | - | - | - |' : '| _(adicionar leads)_ | - | - | - |'}

---

## 4. Leads a Descartar

| Lead | Score | Motivo | Ação |
|---|---|---|---|
${leads.length > 0 ? leads.filter(l => (l.score || 50) < 30).map(l => `| ${l.nome || '-'} | ${l.score || '<30'} | Baixo fit | Mover para nurturing |`).join('\n') || '| _(nenhum para descartar agora)_ | - | - | - |' : '| _(nenhum lead ainda)_ | - | - | - |'}

---

## 5. Modelo de Lead Ideal (ICP — Ideal Customer Profile)

Baseado nas personas da SmartOps IA, o lead ideal é:

**Demográfico:**
- Dono ou CEO de PME em BH/MG
- 10-50 funcionários
- Receita mensal R$ 50k-500k
- Setor: manufatura, serviços, saúde, alimentação

**Comportamental:**
- Já tentou melhorar processos antes (e falhou)
- Ativo em LinkedIn ou Instagram
- Responde mensagens com detalhes
- Toma decisões sem depender de sócio

**Situacional:**
- Crescimento travado por processo ineficiente
- Perda de dinheiro visível (retrabalho, estoque, espera)
- Urgência real: prazo ou pressão financeira

---

TÍTULO: Lead Scoring — ${taskDate}
CONTEXTO: Priorização do pipeline de leads SmartOps IA
DADOS ANALISADOS: ${leads.length} leads no pipeline
PROBLEMA IDENTIFICADO: ${leads.length === 0 ? 'Pipeline vazio — sem leads cadastrados' : 'Leads sem priorização clara'}
EVIDÊNCIA: ${leads.length} leads | Score médio: [calcular]
IMPACTO: Focar nos leads certos pode triplicar taxa de fechamento
RECOMENDAÇÃO: ${leads.length > 0 ? 'Priorizar os 3 leads com maior score esta semana' : 'Cadastrar leads reais em data/leads.json'}
AÇÃO SUGERIDA: ${leads.length > 0 ? 'Ligar para lead #1 hoje' : 'Popular data/leads.json com leads reais'}
PRIORIDADE: Alta
ESFORÇO: Baixo
ROI ESPERADO: +25% taxa de fechamento com scoring sistemático
RISCO DE NÃO AGIR: Desperdiçar tempo com leads frios e perder oportunidades quentes
PRAZO: Imediato
MÉTRICA DE SUCESSO: 100% dos leads quentes contatados em 24h
PRÓXIMO PASSO: ${leads.length > 0 ? 'Contactar lead de maior score' : 'Adicionar primeiros leads ao pipeline'}`,
    }],
  });

  const reportMD = resp.content[0].text.trim();
  appendLog('Lead scoring report generated');

  const scored = leads.map(l => ({ ...l, score_calculated: l.score || 50 }));

  fs.writeFileSync(path.join(lsDir, 'lead_scoring_report.md'), reportMD);
  fs.writeFileSync(path.join(lsDir, 'scored_leads.json'), JSON.stringify(scored, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Lead Scoring Report: ${path.join(lsDir, 'lead_scoring_report.md')}`);
  console.log(`  ✓ ${leads.length} leads analisados`);
  appendLog('lead_scoring complete ✓');
}

runLeadScoring().catch(err => {
  console.error('Lead Scoring error:', err.message);
  process.exit(1);
});
