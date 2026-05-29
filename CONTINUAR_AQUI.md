# CONTINUAR AQUI — SmartOps IA
# Cole este documento no início da próxima conversa com Claude Code

---

## CONTEXTO DO PROJETO

**Empresa:** SmartOps IA — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Dono:** Breno Luiz — Black Belt Lean Six Sigma
**Contato:** (31) 97203-9180 | brenoluiz691@gmail.com
**GitHub:** https://github.com/Breno691/deploy-club-pipeline
**Pipeline Server:** https://n8n-pipeline-server.sumjyb.easypanel.host
**Dashboard:** http://localhost:3100 (rodar: `npm run dashboard`)

---

## O QUE JÁ ESTÁ FUNCIONANDO

### Pipeline de Conteúdo Automático (3x/semana via n8n + EasyPanel)
```
research.js → generate_copy.js → generate_ad.js → build_ad_html.js
→ render_ad.js → upload_media.js → Telegram (aprovação) → [Instagram pendente]
```

### 16 Scripts de Agentes em scripts/
```bash
npm run pipeline:run   # pipeline completo de conteúdo
npm run ceo            # briefing executivo do dia
npm run proposal       # gerar proposta comercial (+ --client "Nome" --notes arquivo.txt)
npm run finance        # relatório financeiro (+ --data data/financial_data.json)
npm run sales          # scoring de leads e scripts de abordagem WhatsApp
npm run competitor     # inteligência competitiva via Tavily
npm run lean           # análise VSM + 8 desperdícios (+ --client "X" --sector saude)
npm run sigma          # DMAIC completo (+ --client "X")
npm run strategy       # plano estratégico 90 dias com OKRs
npm run seo            # keywords, clusters, artigos prioritários
npm run risk           # alertas de risco do negócio
npm run dashboard      # painel de controle em http://localhost:3100
```

### Knowledge Files em knowledge/
- brand_identity.md, product_campaign.md, platform_guidelines.md
- visual_references.md, content_strategy.md, sales_playbook.md, customer_personas.md

### Data Files em data/
- data/leads.json — leads do pipeline (vazio, populate manualmente ou via API)
- data/financial_data.json — criar com dados reais de receita/custos

---

## O QUE FALTA IMPLEMENTAR

### GRUPO A — Só precisam de script (pode criar agora, sem novas APIs)
Esses 16 agentes têm SKILL.md documentado em skills/ e só precisam de um script .js seguindo o mesmo padrão dos scripts existentes (Claude API + knowledge files):

| Agente | Arquivo | O que faz |
|---|---|---|
| Chief of Staff | `chief_of_staff.js` | Decisões do CEO → tarefas concretas + envia resumo no Telegram |
| Knowledge Management | `knowledge_agent.js` | Cria SOPs e playbooks de processos recorrentes |
| Case Study | `case_study_agent.js` | Documenta casos antes/depois com ROI real |
| Productization | `productization_agent.js` | Transforma serviços em produtos escaláveis |
| Personal Brand | `personal_brand_agent.js` | Narrativa de autoridade + posicionamento Breno Luiz |
| Authority Building | `authority_agent.js` | Palestras, artigos LinkedIn, lives, podcasts |
| Partnership | `partnership_agent.js` | Parcerias B2B + pipeline de parceiros |
| AI Lab | `ai_lab_agent.js` | Monitora novidades em LLMs e ferramentas IA |
| Offer Optimization | `offer_optimization.js` | Analisa aprovação de ofertas + testa variações |
| Pricing | `pricing_agent.js` | Precifica projetos com margem > 60% |
| Client Success | `client_success_agent.js` | Satisfação, entregas, upsell, churn risk |
| Executive Dashboard | `exec_dashboard.js` | Consolida KPIs de todos os squads |
| Kaizen | `kaizen_agent.js` | Melhorias Kaizen, Kanban, impacto acumulado |
| CRO | `cro_agent.js` | Taxa de conversão por página, testes A/B |
| Customer Journey | `journey_agent.js` | Mapeia jornada visitante→cliente, pontos de atrito |
| Revenue | `revenue_agent.js` | Receita por canal, atribuição, LTV por projeto |

### GRUPO B — Precisam de API externa primeiro
| Agente | API Necessária | Como obter |
|---|---|---|
| Distribution (publicar Instagram) | Instagram Graph API — token longa duração + Page ID | Meta for Developers → Graph API Explorer |
| Website Analytics | GA4 — Google Analytics Data API | Google Cloud Console → habilitar API → service account |
| Ads Agent | Google Ads API (Developer Token) + Meta Marketing API | Google Ads Manager + Meta Business Manager |

### GRUPO C — Infraestrutura
| Item | O que falta |
|---|---|
| `render_video.js` | Integrar Remotion ao pipeline (remotion/src/AdVideo.tsx já existe) |
| Process Mining | Logs/dados de sistemas de clientes para analisar |

---

## ARQUITETURA DOS SCRIPTS (PADRÃO)

Todos os scripts seguem este padrão — use como referência para criar novos:

```javascript
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

// Args
const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };
const taskName = get('--task') || 'nome_padrao';
const taskDate = get('--date') || new Date().toISOString().split('T')[0];

// Output dirs
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const agentDir  = path.join(outputDir, 'nome_do_agente');

// Log helper
function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'nome_agente.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}

// Helpers
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }

async function runAgent() {
  // Create dirs
  [agentDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('agent started');

  // Load knowledge
  const brandIdentity = readFileSafe('knowledge/brand_identity.md');
  const playbook      = readFileSafe('knowledge/sales_playbook.md');

  // Claude call
  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: `SEU PROMPT AQUI` }],
  });

  // Parse JSON (sempre fazer assim para evitar markdown wrapping)
  let result = {};
  try {
    const raw = resp.content[0].text.trim().replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
    result = JSON.parse(raw);
  } catch { result = {}; }

  // Save
  fs.writeFileSync(path.join(agentDir, 'report.md'), resp.content[0].text.trim());
  fs.writeFileSync(path.join(agentDir, 'data.json'), JSON.stringify(result, null, 2));

  appendLog('agent complete ✓');
}

runAgent().catch(err => { console.error(err.message); process.exit(1); });
```

---

## TECH STACK

| Ferramenta | Status | Uso |
|---|---|---|
| Node.js 22 | ✅ Ativo | Runtime de todos os scripts |
| Anthropic API (Claude Sonnet 4.6) | ✅ Ativo | Todos os agentes de geração |
| Tavily AI | ✅ Ativo | research.js, competitor_agent.js, seo_agent.js |
| Playwright | ✅ Ativo | render_ad.js → PNG 1080x1080 |
| Supabase | ✅ Ativo | upload_media.js → storage |
| BullMQ + Upstash Redis | ✅ Ativo | fila de jobs |
| n8n | ✅ Ativo | trigger Ter/Qui/Sáb + Telegram |
| EasyPanel | ✅ Ativo | hospeda pipeline server |
| Express (dashboard-server.js) | ✅ Ativo | API local porta 3100 |
| Instagram Graph API | 🔴 Pendente | publicar posts |
| GA4 Data API | 🔴 Pendente | analytics do site |
| Google Ads API | 🔴 Pendente | dados de campanhas |
| Remotion | ⚡ Parcial | AdVideo.tsx existe, falta render_video.js |

---

## DESIGN DO AD (SmartOps IA)

- Fundo: #0A0A0F | Card: #0B0F17 | Border: #1F2937
- Accent Lean: #7C3AED (roxo) | Accent Automação: #10B981 (verde)
- Headline: Bebas Neue | Corpo: Inter
- Layout: faixa roxa vertical esquerda, grid sutil, 3 pilares numerados

---

## INSTRUÇÃO PARA CLAUDE CODE

Continue de onde paramos. Próximas opções:

**Opção 1 — Criar os 16 scripts do Grupo A** (sem APIs externas, pode fazer agora)
> "Implemente os agentes do Grupo A — Chief of Staff, Knowledge Management, Case Study..."

**Opção 2 — Conectar Instagram Graph API** (publicação automática de posts)
> "Implemente o distribution_agent.js para publicar no Instagram. Tenho o token X e Page ID Y"

**Opção 3 — Integrar Remotion** (gerar vídeos animados no pipeline)
> "Implemente render_video.js para integrar o AdVideo.tsx do Remotion ao pipeline"

**Opção 4 — Conectar GA4** (analytics real do site)
> "Implemente website_analytics.js para ler dados do GA4. Meu Property ID é: XXXXXXXX"

**Opção 5 — Adicionar leads e testar proposta real**
> "Adiciona um lead em data/leads.json e gera uma proposta real para ele"
