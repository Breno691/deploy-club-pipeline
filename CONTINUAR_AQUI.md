# CONTINUAR AQUI — SmartOps IA
# Última atualização: 2026-05-29 (Sessão 3)

---

## INFRAESTRUTURA ATUAL — TUDO RODANDO

| Serviço | URL | Status |
|---|---|---|
| Dashboard 24/7 | https://n8n-smartops-dashboard.sumjyb.easypanel.host | ✅ EasyPanel |
| Mobile / Dados | https://dados.sumjyb.easypanel.host | ✅ EasyPanel |
| Rotina Conteúdo | https://dados.sumjyb.easypanel.host/rotina.html | ✅ EasyPanel |
| Pipeline conteúdo | https://n8n-pipeline-server.sumjyb.easypanel.host | ✅ EasyPanel |
| n8n | https://n8n-n8nn.sumjyb.easypanel.host | ✅ EasyPanel |
| Site SmartOps | https://smartops-ia.com.br | ✅ Netlify |
| Dashboard local | http://localhost:3100 | `npm run dashboard` |

---

## O QUE FOI FEITO NESTA SESSÃO (2026-05-29)

### 1. AUTONOMOUS OPERATIONS FRAMEWORK
- `knowledge/autonomous_governance.md` — modelo de governança com 3 níveis de autonomia
- Cada agente tem: autoridade definida, formato de reporte padronizado, regra de quando agir sem pedir aprovação

### 2. DIGITAL REVENUE INTELLIGENCE AGENT (50º agente)
- `scripts/digital_revenue_agent.js` (`npm run revenue-intel`)
- CMO + CRO + Analytics Director consolidado
- Analisa funil completo, gera calendário de conteúdo, keywords de ads, 10 decisões do dia

### 3. MONITORING — TELEGRAM + DASHBOARD
- `lib/agent_notify.js` — notificação Telegram + log em `data/executions.json` + Supabase
- `lib/run.js` — wrapper universal para todos os agentes
- **41 scripts** atualizados para usar o wrapper automaticamente
- Aba **⚡ Execuções** no dashboard com histórico + auto-refresh
- **TELEGRAM_BOT_TOKEN configurado:** `8768619004:AAE7orIiwvi2CD4wF5okhSx2ClkUaHLVaXY`
- **Chat ID:** `1349738505`

### 4. SCHEDULER AUTOMÁTICO
Agentes rodam automaticamente enquanto o dashboard estiver online (EasyPanel = 24/7):

| Agente | Horário | Dias |
|---|---|---|
| Morning Briefing | 07:00 | Seg–Sex |
| Weekly Review | 08:00 | Segunda |
| KPI Guardian | 12:00 | Todo dia |
| Risk Agent | 18:00 | Todo dia |
| Revenue Intel | 17:00 | Sexta |

### 5. NOVOS AGENTES CRIADOS
| Agente | Comando | Funciona sem API? |
|---|---|---|
| Website Analytics | `npm run website-analytics` | ✅ |
| Ads Agent | `npm run ads` | ✅ |
| Process Mining | `npm run process-mining` | ✅ (com dados: `--process arquivo.csv`) |
| Digital Revenue Intel | `npm run revenue-intel` | ✅ |

### 6. ORQUESTRADORES
| Comando | Agentes | Duração estimada |
|---|---|---|
| `npm run morning` | KPI Guardian → Risk → Lead Score → CoS → CEO | ~10 min |
| `npm run weekly` | Finance → Revenue → Sales → Risk → KPI → Exec Dash → Competitor → Strategy → CEO → CoS | ~25 min |
| `npm run agent-roadmap` | Gera framework + roadmap 12 meses de todos os agentes | ~5 min |

### 7. EASYPANEL — DASHBOARD DEPLOYADO
- `Dockerfile.dashboard` — imagem Node.js leve, porta 3100
- URL: `https://n8n-smartops-dashboard.sumjyb.easypanel.host`
- Volumes: `smartops-data:/app/data`, `smartops-outputs:/app/outputs`

### 8. PÁGINA MOBILE — ROTINA DE CONTEÚDO
- `mobile-server/public/rotina.html`
- URL: `https://dados.sumjyb.easypanel.host/rotina.html`
- 4 abas: Hoje (checklist com progresso) / Semana / Ações Rápidas / Resumo

### 9. AGENT ROADMAP + CLASSIFICAÇÃO
- `scripts/agent_roadmap.js` (`npm run agent-roadmap`)
- Gera análise completa de 44 agentes + roadmap 12 meses + classificação por fase
- Output: `outputs/agent_roadmap_YYYY-MM-DD/FULL_AGENT_GUIDE.md`

---

## TOTAL DE AGENTES: 50

| Status | Quantidade |
|---|---|
| ✅ Funcionam agora (só ANTHROPIC_API_KEY) | 44 |
| 📊 Leem Supabase em tempo real | 5 |
| 🔴 Precisam API externa (Instagram, GA4, Ads) | 3 |

---

## COMANDOS DO DIA A DIA

```bash
# Rotina diária (automática via scheduler 24/7)
# Ou manual:
npm run morning        # 5 agentes em sequência
npm run weekly         # 10 agentes — toda segunda

# Agentes individuais mais usados
npm run cos            # Plano do dia
npm run kpi-guardian   # O que piorou
npm run lead-score     # Priorizar leads
npm run risk           # Alertas
npm run revenue-intel  # Visão do funil completo
npm run ceo            # Decisões estratégicas

# Análise completa
npm run agent-roadmap  # Framework + roadmap 12 meses

# Infraestrutura
npm run dashboard      # Dashboard local http://localhost:3100
npm run sync           # Sincronizar Supabase → JSON local
```

---

## O QUE AINDA FALTA

### 🔴 Requer dados do Breno
| Item | O que falta |
|---|---|
| Meta Pixel | `PUBLIC_META_PIXEL_ID` no .env do site + Netlify |
| Meta CAPI | Token no Events Manager → configurar no n8n |
| Instagram Graph API | Token para publicação automática |
| GA4 Data API | Service account JSON para Website Analytics Agent |

### 🟡 Próximas sessões sugeridas
1. **Ativar Meta Pixel** — 10 min, impacto alto em ads
2. **Adicionar leads reais** via https://dados.sumjyb.easypanel.host
3. **Formulário na /diagnostico-gratuito** do site
4. **Reimplantar smartops-dados** no EasyPanel (pega a página /rotina.html)
5. **Reimplantar smartops-dashboard** no EasyPanel (pega novos scripts e scheduler)

### 🟢 Quando tiver primeiro cliente
- Case Study Agent (`npm run case-study`)
- Process Mining com dados reais (`npm run process-mining --process dados.csv`)
- Client Success (`npm run cs`)

---

## SUPABASE

**URL:** https://fehnahtgmcppatcwgpiz.supabase.co
**Tabelas:** `leads`, `clients`, `financial`, `agent_executions` (nova)
**Service Key:** no `.env` local como `SUPABASE_SERVICE_KEY`

Agentes que leem Supabase em tempo real:
`kpi_guardian`, `lead_scoring`, `revenue_agent`, `risk_agent`, `chief_of_staff`

---

## GITHUB
**Repo:** https://github.com/Breno691/deploy-club-pipeline
**Branch:** main
**Último commit:** feat: add agent roadmap generator + classification framework

---

## CLASSIFICAÇÃO DOS AGENTES POR PRIORIDADE (resultado do agent-roadmap)

### 🔴 CRÍTICOS AGORA (fechar primeiros clientes)
Offer Optimization, Personal Brand, Sales Intelligence, Copywriter, Ads Agent,
Proposal, Lead Scoring, Pricing, Customer Journey

### 🟡 IMPORTANTES EM 90 DIAS
SEO, Content Performance, CRO, Website Analytics, Meeting Intelligence,
Revenue, Client Success, Authority Building, AI Automation Discovery,
Strategic Planning, Chief of Staff, Marketing Research

### 🟢 ÚTEIS NO MÊS 4-8
Lean, Six Sigma, Kaizen, Process Mining, Case Study, Framework Creation,
Productization, Client Expansion, Automation, Project Delivery,
Change Management, Risk, Experimentation, Thought Leadership

### ⚪ MÊS 9+ (quando escalar)
CEO Advisor, Executive Dashboard, KPI Guardian, Design avançado,
Distribution (Instagram API), Video Ad, Community, Partnership,
AI Lab, Market Opportunity, Org Learning, Knowledge Management

---

## TOP 5 PARA FOCAR AGORA
1. **Offer Optimization** — definir a oferta antes de tudo
2. **Personal Brand** — Breno é o produto
3. **Sales Intelligence** — lista de 50 alvos em BH
4. **Copywriter** — copy que converte em cada canal
5. **Ads (Google Ads)** — único canal que gera leads ativos agora
