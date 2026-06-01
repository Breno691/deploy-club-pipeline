# GUIA DO SISTEMA SmartOps IA
**Versão:** 2.0.0 | **Data:** 2026-06-01 | **Dono:** Breno Luiz

> Consulte este arquivo sempre que precisar lembrar como o sistema funciona, quais agentes existem, como rodar e como consultar relatórios.

---

## COMO RODAR O SISTEMA DIARIAMENTE

```bash
# Rotina diária completa (27 agentes + Telegram automático)
npm run daily

# Simular sem chamar API (testar estrutura)
npm run daily:dry

# Rodar sem enviar Telegram
npm run daily:no-telegram

# Rotina semanal (toda segunda-feira — 17 agentes)
npm run daily:weekly

# Validar se todos os agentes estão OK (sem API)
npm run validate

# Instalar dependências faltando
npm run install:agents
```

---

## ESTRUTURA DE PASTAS — ONDE FICAM OS RELATÓRIOS

```
outputs/
  daily_YYYY-MM-DD/           ← criado automaticamente toda vez que rodar
    RESUMO_DIARIO.md          ← resumo consolidado de todos os agentes
    DAILY_LOG.json            ← log técnico completo
    squad_marketing/
      copywriter/
        report.md             ← relatório do agente
        daily_tasks.md        ← tarefas detalhadas do dia
      seo/
        report.md
      ...
    squad_growth/
      ads/
        report.md
      ...
    squad_operations/
      lean/
        report.md
      ...
    squad_sales/
      sales-intelligence/
        report.md
      ...
    squad_executive/
      ceo-advisor/
        ceo_brief.md          ← consolidado executivo
      ...
    squad_finance/
      financial-intelligence/
        financial_report.md
    squad_client/
      risk/
        risk_report.md

  system_logs/
    validation_YYYY-MM-DD.json ← log do validador

agents/[nome-do-agente]/outputs/   ← outputs internos de cada agente
```

---

## OS 51 AGENTES DO SISTEMA

### AGENTES DIÁRIOS (27) — rodam todo dia

| Squad | Agente | Modo | O que faz diariamente |
|-------|--------|------|-----------------------|
| Marketing | marketing-research | report | Tendências, concorrentes, ideias de conteúdo |
| Marketing | copywriter | report | Hooks, CTAs, legenda pronta |
| Marketing | seo | report | Keywords, posicionamento, oportunidades orgânicas |
| Marketing | content-performance | report | Engajamento, CTR, melhor formato |
| Marketing | personal-brand | report | Consistência de marca, crescimento, autoridade |
| Marketing | distribution | report | Status publicações, calendário, gaps |
| Growth | ads | report | ROAS, CPA, CTR, orçamento, otimização |
| Growth | cro | report | Conversão, funil, maior gargalo |
| Growth | website-analytics | report | Sessões, eventos GA4, tráfego |
| Growth | lead-scoring | report | Score BANT, leads quentes, follow-up |
| Growth | revenue | report | MRR, CAC, LTV, pipeline, projeção |
| Operations | lean | report | 8 desperdícios, lead time, Quick Win |
| Operations | process-mining | report | Logs de processo, bottlenecks, SLA |
| Operations | kaizen | report | PDCA, ROI de melhorias, lição do dia |
| Operations | automation | report | Status automações, falhas, horas economizadas |
| Operations | six-sigma | brief | DPMO, sigma level, projetos DMAIC |
| Sales | sales-intelligence | report | Pipeline, conversão, objeções, top 3 ações |
| Sales | offer-optimization | report | Score ofertas, menor conversão, ajuste |
| Sales | proposal | roi | Propostas abertas, ROI, follow-up vencido |
| Executive | competitor-intelligence | report | Concorrentes, share of voice, diferenciação |
| Executive | strategic-planning | brief | OKRs, drift, iniciativas, próxima milestone |
| Executive | executive-dashboard | daily | Score geral, KPIs, alertas P1, comparativo |
| Executive | chief-of-staff | standup | Plano do dia, status semana, OKRs, agenda |
| Finance | financial-intelligence | dashboard | Receita, margem, fluxo de caixa, projeção |
| Client | client-success | report | Health score, risco de churn, entregas |
| Client | risk | scan | Alertas P1, riscos, plano de contingência |
| Executive | ceo-advisor | brief | **CONSOLIDA TUDO** — decisão executiva do dia |

### AGENTES SEMANAIS (17) — rodam toda segunda-feira

| Squad | Agente | O que faz |
|-------|--------|-----------|
| Growth | growth-intelligence | AARRR, canal de escala, North Star |
| Growth | revenue-intelligence | Forecasting, padrões, churn prediction |
| Growth | experimentation | A/B tests, hipóteses, backlog |
| Growth | customer-journey | Jornada, pontos de fricção, saúde |
| Operations | ai-automation | Automações com IA, ROI, sugestões |
| Operations | lean-consulting | Projetos Lean, métricas de clientes |
| Operations | consulting-company-builder | Score consultoria, escala, metodologia |
| Sales | pricing | Margem, concorrência, ajuste de preço |
| Executive | market-opportunity | Oportunidades BH/MG, nichos, prospects |
| Brand | partnership | Parceiros, comissão, follow-up |
| Brand | authority-building | Score autoridade, palestras, podcasts |
| Knowledge | case-study | Novos cases, ROI documentado, repurposing |
| Knowledge | knowledge-management | Gaps SOPs, lições, score base conhecimento |
| Knowledge | productization | Score produtos, progresso, nova oportunidade |
| Knowledge | organizational-learning | Retrospectiva, lições, padrões de erro |
| AI Lab | ai-lab | Ferramentas IA, POC, sugestão de experimento |
| Orchestration | ai-operations-manager | Status sistema, score IA, melhorias |

### AGENTES SOB DEMANDA (7) — rodam quando necessário

| Agente | Quando usar |
|--------|-------------|
| orchestrator-agent | `npm run pipeline:run` — campanha completa |
| design-agent | Criar visual HTML/CSS para post ou anúncio |
| video-ad-specialist-agent | Roteiro VSL, UGC, reels |
| remotion-video-agent | Vídeo animado React/Remotion |
| video-ad-agent | Vídeo para anúncio |
| relationship-coach-agent | Mensagem empática, conflito, abordagem |
| ad-creative-designer-agent | Criativo de anúncio (HTML → PNG) |

---

## TELEGRAM — O QUE CHEGA TODO DIA

O @IAAgentesmartopsbot envia automaticamente:

1. **Mensagem de início** — quando a rotina começa
2. **Relatório por squad** — 1 mensagem por squad (Marketing, Growth, Operations, Sales, Executive, Finance, Client)
3. **CEO Advisor** — relatório consolidado com decisão executiva
4. **Mensagem de encerramento** — status final com estatísticas

**Total:** ~10 mensagens por rodada diária

### Para consultar relatórios completos:
```
outputs/daily_YYYY-MM-DD/RESUMO_DIARIO.md
outputs/daily_YYYY-MM-DD/squad_[nome]/[agente]/report.md
```

---

## COMO RODAR UM AGENTE INDIVIDUAL

```bash
# Exemplo: Ads Agent
cd agents/ads-agent
node ads_agent.js --mode report

# Exemplo: CEO Advisor
cd agents/ceo-advisor-agent
node ceo_advisor_agent.js --mode brief

# Exemplo: Lean
cd agents/lean-agent
node lean_agent.js --mode waste

# Via runner (salva na pasta + envia Telegram)
node scripts/daily_master_runner.js --agent ads
node scripts/daily_master_runner.js --squad sales
```

---

## SCRIPTS PRINCIPAIS

| Comando | O que faz |
|---------|-----------|
| `npm run daily` | Rotina diária completa |
| `npm run daily:dry` | Simula sem chamar API |
| `npm run daily:weekly` | Agentes semanais |
| `npm run validate` | Valida todos os agentes |
| `npm run validate:fix` | Valida + instala dependências |
| `npm run install:agents` | npm install em todos os agentes |
| `npm run ops` | Status do sistema de IA |
| `npm run ops:agents` | Lista todos os agentes |
| `npm run server` | Inicia pipeline server (porta 3099) |
| `npm run pipeline:run` | Roda pipeline de conteúdo |

---

## ARQUIVOS IMPORTANTES

| Arquivo | Descrição |
|---------|-----------|
| `knowledge/UNIVERSAL_ARCHITECTURE.md` | Arquitetura base de todos os agentes |
| `agents/ai-operations-manager/PROMPT.md` | Definição completa do Maestro Central |
| `scripts/daily_tasks_config.js` | Config master: todos os agentes + tarefas |
| `scripts/daily_master_runner.js` | Runner diário |
| `scripts/validate_all_agents.js` | Validador |
| `scripts/send_telegram_direct.js` | Utilitário Telegram |
| `scripts/install_all_agents.js` | Instalador batch |
| `CLAUDE.md` | Documentação principal do projeto |

---

## VARIÁVEIS DE AMBIENTE NECESSÁRIAS (.env)

```
ANTHROPIC_API_KEY=          # Claude API — obrigatório para todos os agentes
TELEGRAM_AGENT_BOT_TOKEN=   # @IAAgentesmartopsbot — relatórios de agentes
TELEGRAM_BOT_TOKEN=         # Bot pipeline — notificações gerais
TELEGRAM_AGENT_CHAT_ID=     # 1349738505
TAVILY_API_KEY=              # Pesquisa em tempo real (marketing-research)
SUPABASE_URL=               # Banco de dados
SUPABASE_KEY=               # Banco de dados
```

---

## ROTINAS AUTOMÁTICAS (claude.ai/code/routines)

29 rotinas ativas, escalonadas de 5h a 9h30 BRT.
O CEO Advisor roda às 9h30 e consolida tudo.

Para verificar: acesse `https://claude.ai/code` → Routines

---

## SCORES E MÉTRICAS DO SISTEMA

| Métrica | Como calcular |
|---------|---------------|
| Score geral (0-100) | executive-dashboard-agent `--mode daily` |
| Score Lean (0-100) | lean-agent `--mode report` |
| Score vendas | sales-intelligence-agent `--mode report` |
| Score financeiro | financial-intelligence-agent `--mode dashboard` |
| Score de risco | risk-agent `--mode scan` |
| Score de IA (0-100) | ai-operations-manager `--mode status` |

---

*Criado em: 2026-06-01*
*SmartOps IA · Breno Luiz · BH/MG*
