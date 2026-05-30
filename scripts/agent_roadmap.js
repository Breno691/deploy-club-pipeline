require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const taskDate  = new Date().toISOString().split('T')[0];
const outputDir = path.join('outputs', `agent_roadmap_${taskDate}`);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

async function run() {
  console.log('\nAgent Roadmap — SmartOps IA');
  console.log('Gerando classificação e roadmap de 12 meses...\n');

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  const client = new Anthropic();

  // PARTE 1 — Framework completo
  console.log('Parte 1/2 — Agent Value Maximization Framework...');
  const r1 = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [{ role: 'user', content: `# AGENT VALUE MAXIMIZATION FRAMEWORK

Você é um consultor especializado em organizações multiagentes, IA aplicada a negócios, melhoria contínua e crescimento empresarial.

Estou construindo a SmartOps IA — consultoria de Lean Six Sigma + Automação com IA para PMEs em BH/MG.
Fase atual: empresa iniciando, foco em clientes locais, Google Ads, Instagram, consultoria presencial.
Ticket médio: R$ 15.000 | Meta: R$ 30.000/mês | Dono: Breno Luiz — Black Belt Lean Six Sigma.

Para cada grupo de agentes, responda de forma PRÁTICA e FOCADA EM RESULTADO:

1. MISSÃO — propósito principal
2. COMO GERA CLIENTES — ações diretas para aquisição
3. COMO GERA RECEITA — impacto financeiro direto
4. QUICK WINS — o que gera resultado nos próximos 30 dias
5. KPIs — como medir sucesso
6. AUTOMAÇÕES — o que automatizar já
7. ROI ESTIMADO — valor gerado por mês quando bem usado

ANALISE ESTES GRUPOS:

EXECUTIVE: CEO Advisor, Chief of Staff, Executive Dashboard, Strategic Planning, KPI Guardian

MARKETING: Copywriter, Design, Distribution, Marketing Research, SEO, Video Ad, Content Performance, Thought Leadership

GROWTH: CRO, Website Analytics, Customer Journey, Ads, Revenue, Experimentation, Lead Scoring

SALES: Sales Intelligence, Meeting Intelligence, Proposal, Offer Optimization, Pricing

CLIENT SUCCESS: Client Success, Client Expansion, Risk

OPERATIONS: Lean, Six Sigma, Kaizen, Process Mining, Change Management, Project Delivery

AUTOMATION: Automation, AI Automation Discovery

KNOWLEDGE: Knowledge Management, Organizational Learning, Case Study, Framework Creation, Productization

PERSONAL BRAND: Personal Brand, Authority Building, Partnership, Community

INNOVATION: AI Lab, Market Opportunity

Formato: Markdown pronto para Notion. Objetivo: manual operacional da consultoria.` }],
  });

  const framework = r1.content[0].text;
  fs.writeFileSync(path.join(outputDir, 'agent_value_framework.md'), framework);
  console.log('  ✓ Framework salvo');

  // PARTE 2 — Classificação e roadmap
  console.log('Parte 2/2 — Classificação e roadmap 12 meses...');
  const r2 = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 6000,
    messages: [{ role: 'user', content: `# AGENT CLASSIFICATION — SmartOps IA

Contexto: SmartOps IA — consultoria Lean Six Sigma + Automação com IA para PMEs em BH/MG.
Fase atual: empresa INICIANDO. Sem clientes ainda. Foco total em conseguir os primeiros clientes.
Canais: Google Ads, Instagram orgânico, prospecção local, indicações.
Dono: Breno Luiz — Black Belt, consultor solo.

Lista completa de 44 agentes disponíveis:
CEO Advisor, Chief of Staff, Executive Dashboard, Strategic Planning, KPI Guardian,
Copywriter, Design, Distribution, Marketing Research, SEO, Video Ad, Content Performance, Thought Leadership,
CRO, Website Analytics, Customer Journey, Ads, Revenue, Experimentation, Lead Scoring,
Sales Intelligence, Meeting Intelligence, Proposal, Offer Optimization, Pricing,
Client Success, Client Expansion, Risk,
Lean, Six Sigma, Kaizen, Process Mining, Change Management, Project Delivery,
Automation, AI Automation Discovery,
Knowledge Management, Organizational Learning, Case Study, Framework Creation, Productization,
Personal Brand, Authority Building, Partnership, Community,
AI Lab, Market Opportunity, Digital Revenue Intelligence

## TAREFA

Classifique CADA agente em uma das 4 categorias:

🔴 CRÍTICO — usar agora, gera clientes ou receita diretamente
🟡 IMPORTANTE — implementar em 90 dias quando tiver alguma tração
🟢 ÚTIL DEPOIS — mês 4-8, quando tiver clientes e receita
⚪ NÃO NECESSÁRIO AGORA — mês 9+ ou quando escalar

Para cada um: explique em 1 linha POR QUÊ essa classificação.

Depois monte um ROADMAP DE 12 MESES mostrando:
- Mês 1-3: agentes críticos + objetivo + ROI esperado
- Mês 4-6: agentes importantes + objetivo + ROI esperado
- Mês 7-9: agentes úteis + objetivo + ROI esperado
- Mês 10-12: agentes avançados + objetivo + ROI esperado

Termine com: TOP 5 AGENTES PARA FOCAR AGORA e por quê cada um é prioritário para conseguir os primeiros clientes.

Formato: Markdown pronto para Notion.` }],
  });

  const roadmap = r2.content[0].text;
  fs.writeFileSync(path.join(outputDir, 'agent_roadmap_12m.md'), roadmap);
  console.log('  ✓ Roadmap salvo');

  // Junta os dois em um arquivo único
  const full = `# SmartOps IA — Agent Intelligence Guide\n*Gerado em ${taskDate}*\n\n---\n\n${framework}\n\n---\n\n${roadmap}`;
  fs.writeFileSync(path.join(outputDir, 'FULL_AGENT_GUIDE.md'), full);

  console.log(`\n✅ Concluído!`);
  console.log(`📄 Framework: ${path.join(outputDir, 'agent_value_framework.md')}`);
  console.log(`🗺️  Roadmap:   ${path.join(outputDir, 'agent_roadmap_12m.md')}`);
  console.log(`📦 Completo:  ${path.join(outputDir, 'FULL_AGENT_GUIDE.md')}`);
}

run().catch(err => { console.error('Erro:', err.message); process.exit(1); });
