# SISTEMA OS — SmartOps IA
## Parte 2: Workflows n8n · Autonomia · Colaboração entre Agentes
*35 Agentes · 12 Workflows · Matriz Completa*
*Versão: 2026-05-30*

---

## Infraestrutura de Referência

| Recurso | Endpoint / ID |
|---|---|
| n8n | `https://n8n-n8nn.sumjyb.easypanel.host` |
| Pipeline Server | `https://n8n-pipeline-server.sumjyb.easypanel.host` |
| Telegram Bot | `@IAAgentesmartopsbot` |
| Telegram Chat ID | `1349738505` (Breno) |
| Fuso horário | America/Sao_Paulo (BRT, UTC-3) |
| Repo Pipeline | `https://github.com/Breno691/deploy-club-pipeline` |
| Meta de negócio | R$ 50.000 MRR |

**Convenções de prioridade:** `P1` = ação imediata / Breno notificado · `P2` = mesmo dia · `P3` = backlog/relatório.

---

# PARTE 1 — WORKFLOWS N8N

> 12 fluxos principais. Cada um roda no n8n self-hosted e chama os agentes via Pipeline Server (`POST /run-agent` ou `POST /run-pipeline`). Resultados persistem em `outputs/<task>_<date>/` + Supabase/PostgreSQL.

---

### 1. PIPELINE DE CONTEÚDO

**Trigger:** Schedule — Ter/Qui/Sáb às **06:00 BRT** (`cron: 0 9 * * 2,4,6` em UTC)
**Objetivo:** Produzir e publicar 1 peça de conteúdo multicanal completa com aprovação humana antes do post.
**Agentes envolvidos:** Marketing Research → Copywriter + Design + Video Ad + Remotion → Distribution

**Fluxo de nós:**
```
[Schedule 06:00 Ter/Qui/Sáb]
  ↓
[HTTP POST /run-pipeline {taskName, taskDate, skipPost:true}]
  ↓
[Marketing Research → Tavily] → output: research_results.json (tendências, ângulos, concorrentes)
  ↓
[Copywriter] → output: copy/ (instagram_caption.txt, threads_post.txt, youtube_metadata.json)
  ↓
[Design → build_ad_html → Playwright] → output: ads/layout.json + ad.html + instagram_ad.png (1080×1080)
  ↓
[Video Ad + Remotion render] → output: video/ad.mp4
  ↓
[Upload Media → Supabase] → output: media_urls.json
  ↓
[Telegram sendMessage + preview PNG] → botões ✅ Aprovar / ❌ Rejeitar ($execution.resumeUrl)
  ↓
[Wait for Webhook — resumeUrl]
  ↓
[Condição: aprovado?]
   ├─ SIM → [Distribution → Instagram Graph API + YouTube Data API] → posts publicados
   └─ NÃO → [Log rejeição + notifica Copywriter para revisão] → encerra
  ↓
[Storage: outputs/<task>_<date>/ + posts table]
```

**Integrações:** Tavily AI, Claude API, Playwright (chromium), Remotion, Supabase Storage, Instagram Graph API, YouTube Data API, Telegram Bot API.
**Armazenamento:** `outputs/<task_name>_<date>/`, Supabase bucket de mídia, tabelas `posts`, `reels`, `content_calendar`.
**SLA:** ≤ 25 min até preview no Telegram; publicação imediata após aprovação.
**Fallback:** Se Tavily/Claude falhar → retry 2x (backoff 30s). Render falha → publica só copy + imagem estática. Sem aprovação em 12h → expira e arquiva como rascunho.

---

### 2. LEAD CAPTURE & SCORING

**Trigger:** Webhook — em tempo real (`POST /webhook/lead-capture`) disparado por formulário do site / n8n form / Meta Lead Ads.
**Objetivo:** Capturar, qualificar e rotear leads instantaneamente; alertar Breno se for A+.
**Agentes envolvidos:** Sales Intelligence (scoring), Chief of Staff (roteamento)

**Fluxo de nós:**
```
[Webhook lead-capture] → payload: {nome, empresa, faturamento, segmento, dor, origem, telefone}
  ↓
[Normalização + dedup CRM] → output: lead_id
  ↓
[Sales Intelligence — Lead Scoring] → output: {score 0-100, tier: A+/A/B/C, motivos}
   regras: faturamento ≥ R$500k/mês (+30), dor operacional clara (+25),
           decisor (+20), segmento PME industrial/serviços (+15), urgência (+10)
  ↓
[Persist CRM] → tabela leads (status: novo)
  ↓
[Condição: tier]
   ├─ A+  → [Telegram P1 → Breno: "🔥 Lead A+ {empresa} score {n}"] + [aciona Workflow 3 Diagnóstico]
   ├─ A   → [Telegram P2 + agenda follow-up Chief of Staff]
   ├─ B   → [Sequência nurturing automática (email/n8n)]
   └─ C   → [Lista fria + tag reavaliação 30d]
  ↓
[Storage: leads + alerts]
```

**Integrações:** Webhook form, Meta Lead Ads API, CRM (PostgreSQL `leads`), Telegram, Claude API (scoring).
**Armazenamento:** `leads`, `alerts`.
**SLA:** ≤ 30s do submit ao scoring; ≤ 60s para alerta A+.
**Fallback:** Falha de scoring → lead entra como tier B (conservador) + flag `needs_review`. Webhook duplicado → ignora por `lead_id` hash.

---

### 3. DIAGNÓSTICO RÁPIDO

**Trigger:** Event — reunião agendada (Google Calendar event criado com tag `[diagnostico]`) OU acionado pelo Workflow 2 (lead A+).
**Objetivo:** Gerar dossiê pré-reunião do prospect e entregar a Breno antes da call.
**Agentes envolvidos:** Sales Intelligence, Marketing Research, Competitor Intelligence

**Fluxo de nós:**
```
[Calendar event criado / trigger lead A+]
  ↓
[Extrai empresa + site + segmento]
  ↓
[Marketing Research → Tavily] → output: contexto de mercado + sinais públicos da empresa
  ↓
[Competitor Intelligence] → output: concorrentes diretos + posicionamento
  ↓
[Sales Intelligence — monta dossiê] → output: dossie.md
   blocos: perfil empresa · dores prováveis · ângulo Lean/Six Sigma · ROI estimado ·
           objeções esperadas · perguntas-chave · oferta sugerida
  ↓
[Render PDF/MD]
  ↓
[Telegram → Breno: dossiê + horário da reunião] (≥ 2h antes)
  ↓
[Storage: outputs/diagnostico_<empresa>_<date>/]
```

**Integrações:** Google Calendar API, Tavily, Claude API, Telegram.
**Armazenamento:** `outputs/diagnostico_*`, tabela `meetings` (campo `dossie_url`).
**SLA:** Dossiê pronto ≥ 2h antes da reunião.
**Fallback:** Sem dados públicos suficientes → dossiê "lean" com framework de perguntas + alerta a Breno de baixa info.

---

### 4. PROPOSTA AUTOMÁTICA

**Trigger:** Event — reunião marcada como "concluída" no CRM/Calendar (`status=done` + tag `[proposta]`).
**Objetivo:** Entregar proposta comercial personalizada em PDF em menos de 2h após a reunião.
**Agentes envolvidos:** Proposal Agent, Pricing Agent, Offer Optimization Agent, Case Study Agent

**Fluxo de nós:**
```
[Reunião concluída] → input: notas da call + dores confirmadas + porte
  ↓
[Pricing Agent] → output: faixa de preço + margem-alvo (≥ 60%) + modelo (projeto/retainer)
  ↓
[Offer Optimization] → output: pacote recomendado (escopo, fases, entregáveis)
  ↓
[Case Study Agent] → output: 1-2 cases relevantes ao segmento (antes/depois + ROI)
  ↓
[Proposal Agent — gera proposta] → output: proposta.md (problema, solução, escopo, cronograma, investimento, prova social, próximos passos)
  ↓
[Render PDF]
  ↓
[Condição: valor > R$15k?]
   ├─ SIM → [Telegram → Breno aprova antes do envio]
   └─ NÃO → [Envia direto]
  ↓
[Envio (email/WhatsApp) + registra em proposals]
  ↓
[Agenda follow-up D+2 / D+5 (Chief of Staff)]
```

**Integrações:** Claude API, gerador de PDF, email/WhatsApp API, CRM, Telegram.
**Armazenamento:** `proposals`, `outputs/proposta_<empresa>_<date>/`.
**SLA:** ≤ 2h da reunião ao envio (ou à aprovação de Breno).
**Fallback:** Pricing sem dados → usa tabela padrão por porte. Falha de PDF → envia versão MD/link.

---

### 5. MORNING BRIEFING

**Trigger:** Schedule — diário **05:00 BRT** (`cron: 0 8 * * *` UTC).
**Objetivo:** Coletar todos os dados das fontes e rodar agentes Wave 1 antes do expediente.
**Agentes envolvidos:** Wave 1 — Website Analytics, Ads, Revenue, Marketing Research, Financial Intelligence, Risk, Client Success, Kaizen.

**Fluxo de nós:**
```
[Schedule 05:00]
  ↓
[Coleta paralela: GA4 · Google Ads · Meta Ads · CRM · Supabase · n8n logs]
  ↓
[Atualiza PostgreSQL/Supabase (snapshots do dia)]
  ↓
[Dispara Wave 1 em paralelo (HTTP /run-agent por agente)]
   ├─ Website Analytics → website_events snapshot
   ├─ Ads → metrics (CPC/CTR/CPA/ROAS)
   ├─ Revenue → forecast MRR
   ├─ Financial → caixa/margem
   ├─ Risk → varredura de alertas
   └─ Client Success → status carteira
  ↓
[Consolida em daily_snapshot.json]
  ↓
[Storage — sem notificação (alimenta Workflows 6, 8, 9, 10, 11)]
```

**Integrações:** GA4, Google Ads API, Meta Ads API, Supabase, PostgreSQL, Pipeline Server.
**Armazenamento:** `kpis`, `daily_snapshot.json`, logs por agente.
**SLA:** Concluído até 05:45 BRT (antes do CEO Daily Report).
**Fallback:** Fonte indisponível → usa último snapshot + flag `stale`. Agente trava → timeout 5 min e segue com os demais.

---

### 6. CEO DAILY REPORT

**Trigger:** Schedule — diário **09:30 BRT** (`cron: 30 12 * * *` UTC). Depende do Workflow 5.
**Objetivo:** Consolidar a operação do dia e entregar a Breno top prioridades + ações.
**Agentes envolvidos:** Revenue, Ads, Sales Intelligence, Marketing, Client Success → CEO Advisor → Chief of Staff.

**Fluxo de nós:**
```
[Schedule 09:30 — lê daily_snapshot.json]
  ↓
[Coleta outputs de todos os agentes do dia]
  ↓
[CEO Advisor — consolida e prioriza por ROI] → output: top 3 ações + alertas + score do dia
  ↓
[Chief of Staff — converte em plano do dia] → output: tarefas com responsável + prazo
  ↓
[Formata briefing executivo (8 perguntas / 10 elementos)]
  ↓
[Telegram → Breno: "☀️ CEO Daily {data}"]
  ↓
[Storage: agent_reports + executive_actions]
```

**Integrações:** Pipeline Server, Telegram, PostgreSQL.
**Armazenamento:** `agent_reports`, `executive_actions`.
**SLA:** Entregue até 09:35 BRT.
**Fallback:** Snapshot stale → reporta com ressalva. Falha do CEO Advisor → envia digest cru dos agentes.

---

### 7. ALERTA DE CPA

**Trigger:** Event/Polling — Ads Agent monitora a cada 30 min; dispara quando `CPA > R$120`.
**Objetivo:** Conter desperdício de mídia pausando campanhas fora da meta e avisando Breno.
**Agentes envolvidos:** Ads Agent, Revenue Agent.

**Fluxo de nós:**
```
[Polling Ads a cada 30 min — Google Ads + Meta Ads]
  ↓
[Condição: CPA > R$120 em campanha ativa?]
   └─ Não → encerra
   └─ Sim ↓
[Ads Agent valida amostra (≥ 50 cliques ou ≥ R$200 gasto p/ evitar ruído)]
  ↓
[Condição: gasto da campanha hoje > R$300?]
   ├─ SIM (alto risco) → [Ads Agent PAUSA campanha via API] + [Telegram P1 → Breno]
   └─ NÃO → [Telegram P2 → Breno recomenda pausa (sem executar)]
  ↓
[Revenue Agent recalcula ROAS/forecast]
  ↓
[Storage: alerts + campaigns (status)]
```

**Integrações:** Google Ads API, Meta Ads API, Telegram, CRM.
**Armazenamento:** `alerts`, `campaigns`.
**SLA:** Detecção ≤ 30 min; pausa ≤ 1 min após confirmação.
**Fallback:** API de pausa falha → alerta P1 imediato a Breno para ação manual.

---

### 8. KAIZEN DIÁRIO

**Trigger:** Schedule — diário **08:30 BRT** (`cron: 30 11 * * *` UTC).
**Objetivo:** Identificar 1 melhoria contínua acionável (interna ou de cliente) por dia.
**Agentes envolvidos:** Kaizen Agent, Process Mining, Lean Agent, Automation Agent.

**Fluxo de nós:**
```
[Schedule 08:30 — lê snapshots + logs operacionais]
  ↓
[Process Mining detecta gargalo/retrabalho] → output: processo + desperdício
  ↓
[Lean Agent classifica (8 desperdícios) + estima impacto]
  ↓
[Kaizen Agent propõe melhoria PDCA] → output: 1 ação de baixo esforço/alto impacto
  ↓
[Condição: melhoria é automatizável via n8n?]
   ├─ SIM → [Automation Agent gera draft de workflow] → Telegram com sugestão
   └─ NÃO → [Telegram sugere implementação manual]
  ↓
[Storage: automation_workflows (draft) + agent_recommendations]
```

**Integrações:** n8n logs, Process Mining, Claude API, Telegram.
**Armazenamento:** `agent_recommendations`, `automation_workflows`.
**SLA:** Entregue até 08:35 BRT.
**Fallback:** Sem gargalo relevante → envia 1 micro-otimização do backlog ou "tudo estável".

---

### 9. CONTENT PERFORMANCE

**Trigger:** Schedule — diário **07:30 BRT** (`cron: 30 10 * * *` UTC).
**Objetivo:** Medir desempenho de posts, replicar o campeão e abrir brief para o próximo conteúdo.
**Agentes envolvidos:** Website Analytics, Distribution, Marketing Research, Copywriter.

**Fluxo de nós:**
```
[Schedule 07:30 — coleta métricas Instagram/YouTube/Threads (últimas 72h)]
  ↓
[Análise: alcance, engajamento, salvamentos, CTR, retenção]
  ↓
[Identifica post campeão (top por engajamento/alcance)]
  ↓
[Condição: campeão > 1.5x média?]
   ├─ SIM → [Marketing Research extrai padrão vencedor] → [Brief para Copywriter replicar formato]
   └─ NÃO → [Registra aprendizado + ajuste fino]
  ↓
[Telegram P3 → resumo de performance + decisão]
  ↓
[Storage: posts (métricas) + content_ideas (brief)]
```

**Integrações:** Instagram Graph API, YouTube Data API, GA4, Claude API, Telegram.
**Armazenamento:** `posts`, `content_ideas`.
**SLA:** Entregue até 07:40 BRT.
**Fallback:** API social indisponível → usa dados parciais + flag.

---

### 10. RISK MONITOR

**Trigger:** Schedule — diário **06:30 BRT** (`cron: 30 9 * * *` UTC) + re-check de hora em hora para P1.
**Objetivo:** Varrer todos os sinais de risco e escalar imediatamente os P1.
**Agentes envolvidos:** Risk Agent, Client Success, Revenue, Financial Intelligence.

**Fluxo de nós:**
```
[Schedule 06:30 — agrega sinais de todos os squads]
  ↓
[Risk Agent classifica riscos]
   fontes: churn signal · queda de caixa · CPA fora · meta MRR em risco · entrega atrasada · NPS baixo
  ↓
[Priorização P1/P2/P3 + probabilidade × impacto]
  ↓
[Condição: existe P1?]
   ├─ SIM → [Telegram P1 imediato → Breno: risco + ação preventiva sugerida]
   └─ NÃO → [Agrega P2/P3 no CEO Daily]
  ↓
[Storage: risks + alerts]
```

**Integrações:** PostgreSQL, Pipeline Server, Telegram.
**Armazenamento:** `risks`, `alerts`.
**SLA:** P1 escalado ≤ 5 min após detecção.
**Fallback:** Dados incompletos → assume risco conservador (eleva 1 nível).

---

### 11. CLIENT SUCCESS CHECK

**Trigger:** Schedule — diário **08:00 BRT** (`cron: 0 11 * * *` UTC).
**Objetivo:** Monitorar saúde da carteira, prever risco de NPS/churn e disparar plano de ação.
**Agentes envolvidos:** Client Success, Risk, Knowledge Management.

**Fluxo de nós:**
```
[Schedule 08:00 — lê status de todos os clientes ativos]
  ↓
[Calcula health score por cliente]
   sinais: dias sem interação · entregas no prazo · resultados vs prometido · sentimento · uso
  ↓
[Condição: health score < 60 OU NPS risk?]
   ├─ SIM → [Risk Agent confirma] → [Client Success monta plano de ação (touchpoint/QBR/quick win)] → Telegram P2
   └─ NÃO → [Atualiza dashboard, sem alerta]
  ↓
[Detecta também resultado excepcional → aciona Workflow Situação 8 (Case Study)]
  ↓
[Storage: clients + client_success_notes + risks]
```

**Integrações:** CRM, PostgreSQL, Telegram.
**Armazenamento:** `clients`, `client_success_notes`, `risks`.
**SLA:** Entregue até 08:10 BRT; plano de ação no mesmo dia.
**Fallback:** Sem dados de interação → usa último contato registrado + flag.

---

### 12. WEEKLY EXECUTIVE

**Trigger:** Schedule — segunda-feira **09:00 BRT** (`cron: 0 12 * * 1` UTC).
**Objetivo:** Relatório semanal consolidado de todos os squads + plano da semana + progresso de OKRs.
**Agentes envolvidos:** Todos os 35 → CEO Advisor + Chief of Staff + Strategic Planning + Executive Dashboard.

**Fluxo de nós:**
```
[Schedule segunda 09:00 — agrega a semana de todos os agentes]
  ↓
[Relatórios por área: Marketing · Sales · Website · Ads · Finance · Clientes/Risco · Ops]
  ↓
[Revenue + Financial → progresso MRR vs R$50k + CAC/LTV]
  ↓
[Strategic Planning → OKRs progresso vs meta]
  ↓
[CEO Advisor consolida + prioriza por ROI] → top 5 ações da semana
  ↓
[Chief of Staff → plano de execução semanal (responsável + prazo)]
  ↓
[Executive Dashboard Agent atualiza dashboard executivo]
  ↓
[Telegram → Breno: relatório semanal + link dashboard]
  ↓
[Storage: agent_reports + executive_actions + kpis]
```

**Integrações:** Todas as fontes, Pipeline Server, Dashboard (EasyPanel), Telegram.
**Armazenamento:** `agent_reports`, `executive_actions`, `kpis`.
**SLA:** Entregue até 09:30 BRT de segunda.
**Fallback:** Algum squad sem dados → seção marcada como "sem atualização" + segue.

---

# PARTE 2 — NÍVEIS DE AUTONOMIA

## Tabela de Autonomia — 35 Agentes

| Agente | Nível | Pode fazer sem aprovação | Precisa de aprovação | Limite financeiro |
|---|---|---|---|---|
| **SQUAD 1 — MARKETING** | | | | |
| Copywriter Agent | 3 | Gerar copy, hooks, variações, briefs | Publicar copy externamente | — |
| Design Agent | 3 | Gerar layouts, PNGs, carrosséis | Publicar peça final | — |
| Distribution Agent | 3 | Agendar posts, montar calendário | Publicar (após aprovação Telegram) | — |
| Marketing Research Agent | 2 | Pesquisar tendências, concorrentes | — | até R$50 Tavily/dia |
| SEO Agent | 3 | Sugerir/otimizar conteúdo on-page, clusters | Alterar estrutura do site | — |
| Video Ad Agent | 3 | Roteirizar e gerar VSL/UGC drafts | Publicar vídeo | — |
| Remotion Video Agent | 3 | Renderizar animações/vídeos | Publicar vídeo | — |
| **SQUAD 2 — GROWTH** | | | | |
| CRO Agent | 3 | Propor testes A/B, ajustes de copy de LP | Mudar LP em produção | — |
| Customer Journey Agent | 2 | Mapear jornada, identificar atrito | — | — |
| Revenue Agent | 2 | Forecast, ROI, CAC/LTV, atribuição | — | — |
| Ads Agent | 3 | Pausar campanha CPA>R$120, ajustar lances ±20% | Aumentar budget, nova campanha | budget ≤ R$300/dia/campanha |
| Website Analytics Agent | 1 | Ler eventos, sessões, páginas, reportar | — | — |
| **SQUAD 3 — OPERATIONS** | | | | |
| Lean Agent | 2 | Diagnosticar desperdícios, VSM | — | — |
| Six Sigma Agent | 2 | Análise DMAIC, variabilidade | — | — |
| Kaizen Agent | 3 | Propor e logar melhorias diárias | Mudar processo de cliente | — |
| Process Mining Agent | 1 | Descobrir/reportar processos por dados | — | — |
| Automation Agent | 3 | Criar drafts de workflow n8n, testar em sandbox | Ativar workflow em produção | — |
| **SQUAD 4 — SALES** | | | | |
| Sales Intelligence Agent | 3 | Lead scoring, dossiês, follow-ups CRM | Contato direto em nome de Breno | — |
| Proposal Agent | 3 | Gerar proposta ≤ R$15k e enviar | Proposta > R$15k | valor proposta ≤ R$15k auto |
| Offer Optimization Agent | 2 | Recomendar pacotes/escopo | Lançar nova oferta | — |
| Pricing Agent | 2 | Calcular preço/margem | Alterar tabela oficial | margem mínima 60% |
| **SQUAD 5 — EXECUTIVE** | | | | |
| Executive Dashboard Agent | 1 | Consolidar e exibir KPIs | — | — |
| Competitor Intelligence Agent | 1 | Monitorar/reportar concorrentes | — | — |
| Strategic Planning Agent | 4 | Propor planos 30/90/180, OKRs | Mudar meta anual/MRR | — |
| CEO Advisor Agent | 4 | Priorizar, consolidar, recomendar top ações | Aprovar gastos, alterar roadmap macro | recomenda até R$5k |
| Chief of Staff Agent | 4 | Criar planos, agendar, atribuir tarefas | Executar gasto, contratar | — |
| **SQUAD 6 — KNOWLEDGE** | | | | |
| Knowledge Management Agent | 3 | Criar/atualizar SOPs, playbooks | Publicar externamente | — |
| Case Study Agent | 3 | Gerar case (rascunho) | Publicar com nome de cliente | — |
| Productization Agent | 2 | Propor produtos/pacotes | Lançar produto | — |
| **SQUAD 7 — CLIENT SUCCESS** | | | | |
| Client Success Agent | 3 | Health score, plano de ação, touchpoints internos | Oferecer desconto/crédito | crédito ≤ R$0 (sem auto) |
| Risk Agent | 3 | Classificar riscos, escalar P1 | Executar ação corretiva externa | — |
| **SQUAD 8 — FINANCE** | | | | |
| Financial Intelligence Agent | 2 | Analisar receita, margem, fluxo, ROI | Mover/autorizar dinheiro | — |
| **SQUAD 9 — PERSONAL BRAND** | | | | |
| Personal Brand Agent | 3 | Gerar narrativa/posicionamento (rascunho) | Publicar em nome de Breno | — |
| Authority Building Agent | 2 | Sugerir palestras/artigos/lives | Aceitar convite/compromisso | — |
| Partnership Agent | 2 | Mapear/qualificar parceiros B2B | Fechar parceria | — |
| **SQUAD 10 — AI LAB** | | | | |
| AI Lab Agent | 2 | Avaliar novas ferramentas/LLMs (rascunho) | Adotar/contratar ferramenta | teste ≤ R$100/mês recomenda |

## Definição dos Níveis

- **Nível 1 — Observador:** Apenas lê dados e reporta. Não recomenda ação executável nem altera nada. Ex.: Website Analytics, Process Mining, Executive Dashboard, Competitor Intelligence.
- **Nível 2 — Analista:** Analisa dados e gera recomendações; não executa. Toda ação depende de outro agente ou de Breno. Ex.: Lean, Six Sigma, Revenue, Pricing, Financial.
- **Nível 3 — Executor Limitado:** Executa ações **reversíveis** dentro de limites pré-definidos (gerar conteúdo, pausar campanha, criar draft, enviar proposta pequena). Ações irreversíveis ou de alto valor exigem aprovação. Ex.: Copywriter, Ads, Proposal, Sales Intelligence, Automation.
- **Nível 4 — Executor Pleno:** Executa qualquer ação dentro do seu domínio de planejamento/coordenação, mas não gasta dinheiro nem muda metas macro. Ex.: CEO Advisor, Chief of Staff, Strategic Planning.
- **Nível 5 — Estratégico:** Pode alterar metas, roadmap e alocar recursos. **Reservado a Breno (humano).** Nenhum agente opera em Nível 5 — o teto autônomo do sistema é Nível 4 com aprovação humana acima disso.

> **Regra de ouro:** qualquer ação que (a) gaste dinheiro acima do limite, (b) seja irreversível, (c) use o nome/voz de Breno publicamente, ou (d) altere meta/roadmap → **exige aprovação humana via Telegram**.

---

# PARTE 3 — MATRIZ DE COLABORAÇÃO COMPLETA

## 3.1 Matriz de Dependências

| Agente | Recebe de | Entrega para | Frequência |
|---|---|---|---|
| Marketing Research | (fontes externas/Tavily) | Copywriter, Design, Video Ad, SEO, Sales Intelligence | 3x/sem + sob demanda |
| Copywriter | Marketing Research, Content Performance | Design, Video Ad, Distribution | 3x/sem |
| Design | Copywriter, Marketing Research | Distribution, Video Ad | 3x/sem |
| Video Ad | Copywriter, Design | Remotion, Distribution | 3x/sem |
| Remotion Video | Video Ad | Distribution | sob demanda |
| Distribution | Copywriter, Design, Video Ad | Website Analytics, Content Performance | 3x/sem |
| SEO | Marketing Research, Website Analytics | Copywriter, Strategic Planning | semanal |
| CRO | Website Analytics, Customer Journey | Copywriter, Design, Revenue | semanal |
| Customer Journey | Website Analytics, CRO | CRO, Client Success | semanal |
| Revenue | Ads, Sales Intelligence, Financial | CEO Advisor, Risk, Strategic Planning | diário |
| Ads | (Google/Meta Ads APIs) | Revenue, Copywriter, CEO Advisor | tempo real |
| Website Analytics | (GA4) | CRO, Customer Journey, Content Performance | diário |
| Lean | Process Mining, Six Sigma | Kaizen, Sales Intelligence (dossiê) | sob demanda |
| Six Sigma | Process Mining | Lean, Kaizen | sob demanda |
| Kaizen | Lean, Process Mining | Automation, Knowledge Mgmt | diário |
| Process Mining | (logs n8n/ops) | Lean, Six Sigma, Kaizen | diário |
| Automation | Kaizen, Chief of Staff | (n8n produção) | sob demanda |
| Sales Intelligence | Lead Scoring, Marketing Research, Competitor Intel | Proposal, Chief of Staff, CEO Advisor | tempo real |
| Proposal | Pricing, Offer Optimization, Case Study, Sales Intel | (cliente), Chief of Staff | por reunião |
| Offer Optimization | Pricing, Revenue | Proposal, Productization | sob demanda |
| Pricing | Revenue, Financial | Proposal, Offer Optimization | sob demanda |
| Executive Dashboard | Todos | Breno | diário/semanal |
| Competitor Intelligence | Marketing Research | Sales Intelligence, Strategic Planning | semanal |
| Strategic Planning | Revenue, Financial, CEO Advisor | CEO Advisor, Chief of Staff | semanal |
| CEO Advisor | Todos os agentes | Chief of Staff, Breno | diário |
| Chief of Staff | CEO Advisor, Strategic Planning | Todos (tarefas), Breno | diário |
| Knowledge Management | Kaizen, Case Study, todos | Todos (SOPs) | contínuo |
| Case Study | Client Success | Proposal, Personal Brand, Marketing | por resultado |
| Productization | Offer Optimization, Knowledge Mgmt | Strategic Planning, Pricing | mensal |
| Client Success | (CRM), Risk | Risk, Case Study, CEO Advisor | diário |
| Risk | Todos os squads | CEO Advisor, Client Success, Breno | diário + tempo real |
| Financial Intelligence | Revenue, (contas) | Pricing, Revenue, CEO Advisor | diário |
| Personal Brand | Case Study, Authority Building | Copywriter, Authority Building | semanal |
| Authority Building | Personal Brand | Partnership, Distribution | semanal |
| Partnership | Competitor Intel, Authority Building | CEO Advisor, Chief of Staff | sob demanda |
| AI Lab | (mercado) | Automation, Strategic Planning, CEO Advisor | mensal |

## 3.2 Fluxos de Colaboração por Situação

### SITUAÇÃO 1 — Lead Quente entra
```
Lead entra no formulário
  → Sales Intelligence (Lead Scoring → classifica A+)
  → Sales Intelligence (gera dossiê: dor, ângulo Lean, ROI, objeções)
  → Competitor Intelligence (concorrentes do prospect)
  → Marketing Research (sinais públicos da empresa)
  → Chief of Staff (agenda reunião no Calendar + reserva 2h prep)
  → Telegram P1 → Breno notificado ("🔥 Lead A+ {empresa}, score {n}, reunião {data}")
  → [na véspera] Workflow 3 entrega dossiê ≥ 2h antes
  → Pós-reunião → dispara Situação/Workflow 4 (Proposta)
```

### SITUAÇÃO 2 — Criativo de anúncio esgotado (CTR caindo)
```
Ads Agent detecta CTR -15% vs baseline (janela 3 dias, ≥ 1000 impressões)
  → Notifica Copywriter (envia: criativo atual, público, métricas)
  → Marketing Research (busca ângulo novo / tendência)
  → Copywriter gera 3 variações de hook/copy
  → Design gera 3 variações visuais (mantém tokens de marca)
  → Ads Agent monta teste A/B/C (split budget ≤ R$300/dia)
  → [após 48h] Ads Agent mede vencedor → pausa perdedores
  → Vencedor → Content Performance registra padrão → Knowledge Management documenta
  → Telegram P2 → Breno (resumo do teste e decisão)
```

### SITUAÇÃO 3 — Cliente com risco de churn
```
Risk Agent detecta sinal de churn (health score < 60 / silêncio > 14d / NPS baixo)
  → Client Success alerta + monta diagnóstico (o que mudou, por quê)
  → Revenue Agent calcula valor em risco (MRR do cliente)
  → Client Success monta plano: touchpoint imediato + quick win + QBR
  → Case Study/Knowledge Mgmt fornece prova de valor já entregue
  → Condição: MRR em risco > R$3k?
       SIM → Telegram P1 → Breno entra pessoalmente
       NÃO → Client Success executa plano (touchpoint interno)
  → CEO Advisor registra no daily; acompanha health score D+7
```

### SITUAÇÃO 4 — Pipeline de conteúdo semanal
```
Schedule trigger Ter/Qui/Sáb 06:00
  → Marketing Research pesquisa (Tavily: tendência + ângulo + concorrente)
  → Copywriter gera copy (IG + Threads + YouTube)
  → Design gera layout + PNG 1080×1080
  → Video Ad + Remotion renderizam ad.mp4
  → Upload Media (Supabase) → media_urls.json
  → Telegram preview → Breno (✅/❌)
  → Aprovado → Distribution publica (IG Graph + YouTube)
  → Website Analytics começa a medir → [D+1] Content Performance avalia
```

### SITUAÇÃO 5 — CPA acima da meta por 3 dias
```
Ads Agent detecta CPA > R$120 sustentado 3 dias
  → Ads Agent valida amostra (≥ R$200 gasto/campanha)
  → Revenue Agent confirma impacto no CAC/forecast
  → Ads Agent PAUSA campanha (gasto>R$300/dia) ou recomenda pausa
  → Marketing Research + Copywriter (Situação 2: novos criativos)
  → CRO Agent revisa landing page (atrito de conversão?)
  → Telegram P1 → Breno (campanha pausada + plano de recuperação)
  → CEO Advisor reprioriza budget no daily
```

### SITUAÇÃO 6 — Meta mensal em risco (dia 15)
```
Revenue Agent detecta forecast MRR < 90% da meta (R$50k)
  → Revenue quantifica gap (R$ faltante + leads necessários)
  → Sales Intelligence levanta pipeline aproveitável (leads B/A reativáveis)
  → Ads Agent avalia escalar campanha vencedora (dentro do CAC)
  → Offer Optimization propõe oferta de aceleração (ex.: bônus/urgência)
  → CEO Advisor consolida plano de recuperação por ROI
  → Chief of Staff cria plano de 15 dias (tarefas + responsáveis)
  → Telegram P1 → Breno aprova plano + gastos extras
  → Acompanhamento diário até fim do mês
```

### SITUAÇÃO 7 — Proposta rejeitada
```
Proposal Agent recebe "não" (status=lost no CRM)
  → Sales Intelligence registra motivo da objeção (preço/timing/escopo/confiança)
  → Pricing Agent reavalia (havia espaço de margem? modelo errado?)
  → Offer Optimization propõe contraproposta/escopo reduzido (se aplicável)
  → Knowledge Management arquiva objeção em playbook (sales_objections)
  → Condição: objeção = preço E margem permite?
       SIM → Proposal gera v2 (escopo faseado) → Chief of Staff agenda re-pitch
       NÃO → Chief of Staff agenda nurturing D+30 + tag reavaliação
  → CEO Advisor atualiza taxa de fechamento + padrões de perda
```

### SITUAÇÃO 8 — Novo case de sucesso de cliente
```
Client Success detecta resultado excepcional (ex.: -30% retrabalho, +ROI claro)
  → Risk/Revenue validam o dado (número confiável?)
  → Case Study Agent monta case (antes/depois + ROI + depoimento)
  → Condição: aprovação do cliente para uso público?
       (Telegram → Breno pede ok ao cliente)
  → Aprovado ↓
  → Personal Brand transforma em narrativa de autoridade
  → Copywriter cria posts/reel a partir do case
  → Distribution agenda no calendário de conteúdo
  → Proposal Agent adiciona case ao acervo de prova social
  → Authority Building usa para pitch de palestra/artigo
```

## 3.3 Protocolo de Comunicação entre Agentes

**Formato padrão de mensagem inter-agente:**
```json
{
  "from": "agent_id",
  "to": "agent_id | broadcast",
  "type": "request | alert | report | data",
  "priority": "P1 | P2 | P3",
  "payload": {},
  "requires_response": true,
  "deadline": "2026-05-30T12:00:00Z",
  "trace_id": "uuid",
  "context_ref": "outputs/<task>_<date>/ | table:row_id"
}
```

**Regras do protocolo:**
- Toda mensagem `P1` com `requires_response=true` que não for respondida até `deadline` → escala automaticamente (ver 3.4).
- `broadcast` é restrito a CEO Advisor, Chief of Staff e Risk Agent.
- `type=alert` sempre persiste em `alerts`; `type=report` em `agent_reports`.
- `context_ref` é obrigatório para rastreabilidade (`trace_id` único por cadeia de colaboração).
- Mensagens entre agentes trafegam pelo Pipeline Server (fila BullMQ/Upstash); humanos recebem só o que é P1/P2 relevante via Telegram.

## 3.4 Hierarquia de Escalação

```
Agente específico (não resolve / sem confiança / fora do limite de autonomia)
  → Squad Lead (resolve no domínio do squad)
       Marketing → Copywriter (lead criativo)
       Growth → CRO
       Operations → Lean
       Sales → Sales Intelligence
       Knowledge → Knowledge Management
       Client Success → Client Success
       Personal Brand → Personal Brand
  → Chief of Staff (coordena entre squads, cria plano)
  → CEO Advisor (decisão estratégica / prioridade / trade-off)
  → Breno (humano) — aprovação financeira > limite, ação irreversível, mudança de meta/roadmap
```
**Tempo de escalação:** P1 → 5 min sem resposta sobe de nível · P2 → 2h · P3 → entra no relatório seguinte.

---

# PARTE 4 — AÇÕES AUTÔNOMAS POR AGENTE

> Ações que cada agente executa **sem nenhuma intervenção humana** (dentro dos limites da Parte 2).

## Copywriter Agent
- [ ] Gerar copy IG/Threads/YouTube [trigger: pipeline 3x/sem] [conteúdo pronto p/ aprovação]
- [ ] Gerar 3 variações de hook [trigger: CTR -15%] [recupera performance de ad]
- [ ] Criar brief a partir do post campeão [trigger: campeão > 1.5x média] [replica vencedor]

## Design Agent
- [ ] Renderizar PNG 1080×1080 com tokens de marca [trigger: copy pronta] [peça visual pronta]
- [ ] Gerar 3 variações visuais [trigger: teste A/B de ad] [otimiza criativo]

## Distribution Agent
- [ ] Publicar IG + YouTube [trigger: aprovação ✅ no Telegram] [conteúdo no ar]
- [ ] Manter calendário de conteúdo atualizado [trigger: cada peça aprovada] [planejamento vivo]

## Marketing Research Agent
- [ ] Pesquisar tendência/ângulo via Tavily [trigger: pipeline / dossiê] [insumo de conteúdo e vendas]
- [ ] Extrair padrão de post vencedor [trigger: Content Performance] [aprendizado replicável]

## SEO Agent
- [ ] Sugerir otimizações on-page e clusters [trigger: análise semanal] [ganho orgânico]

## Video Ad / Remotion Agent
- [ ] Roteirizar e renderizar ad.mp4 [trigger: pipeline] [vídeo pronto p/ aprovação]

## CRO Agent
- [ ] Propor testes A/B de LP [trigger: queda de conversão] [recomendação de otimização]

## Customer Journey Agent
- [ ] Mapear atrito na jornada [trigger: análise semanal] [pontos de fricção identificados]

## Revenue Agent
- [ ] Recalcular forecast MRR / CAC / LTV [trigger: diário 05:00] [visibilidade da meta]
- [ ] Quantificar gap da meta [trigger: forecast < 90% dia 15] [aciona plano de recuperação]

## Ads Agent
- [ ] PAUSAR campanha [trigger: CPA > R$120 e gasto > R$300/dia] [contém desperdício]
- [ ] Ajustar lances ±20% [trigger: desvio de CPA dentro do limite] [otimização contínua]
- [ ] Montar teste A/B/C [trigger: CTR -15%] [renova criativo]

## Website Analytics Agent
- [ ] Coletar e reportar eventos/sessões [trigger: diário 05:00] [dado base para growth]

## Lean / Six Sigma Agent
- [ ] Diagnosticar desperdício / variabilidade [trigger: gargalo detectado] [insumo Kaizen]

## Kaizen Agent
- [ ] Propor 1 melhoria PDCA/dia [trigger: diário 08:30] [melhoria contínua registrada]

## Process Mining Agent
- [ ] Detectar gargalo/retrabalho em logs [trigger: diário] [processo mapeado]

## Automation Agent
- [ ] Gerar draft de workflow n8n [trigger: melhoria automatizável] [automação pronta p/ ativar]

## Sales Intelligence Agent
- [ ] Pontuar e classificar lead (A+/A/B/C) [trigger: lead entra] [roteamento instantâneo]
- [ ] Gerar dossiê pré-reunião [trigger: reunião agendada] [Breno preparado]
- [ ] Disparar follow-ups CRM [trigger: D+2/D+5 pós-proposta] [pipeline aquecido]

## Proposal Agent
- [ ] Gerar e enviar proposta ≤ R$15k [trigger: reunião concluída] [proposta em < 2h]
- [ ] Gerar v2 com escopo faseado [trigger: rejeição por preço + margem ok] [recupera deal]

## Offer Optimization / Pricing Agent
- [ ] Calcular preço com margem ≥ 60% [trigger: nova proposta] [precificação correta]
- [ ] Recomendar pacote/escopo [trigger: solicitação Proposal] [oferta otimizada]

## Executive Dashboard Agent
- [ ] Atualizar dashboards [trigger: diário/semanal] [visibilidade executiva]

## Competitor Intelligence Agent
- [ ] Monitorar e reportar concorrentes [trigger: semanal / dossiê] [inteligência de mercado]

## Strategic Planning Agent
- [ ] Atualizar progresso de OKRs [trigger: weekly executive] [meta sob controle]
- [ ] Propor planos 30/90/180 [trigger: revisão estratégica] [roadmap atualizado]

## CEO Advisor Agent
- [ ] Consolidar e priorizar top ações por ROI [trigger: diário 09:30 / weekly] [decisão guiada]
- [ ] Reprioriza budget/foco [trigger: alerta P1] [resposta rápida a risco/oportunidade]

## Chief of Staff Agent
- [ ] Converter recomendações em plano de tarefas [trigger: CEO Daily] [execução clara]
- [ ] Agendar reuniões e follow-ups [trigger: lead A+ / proposta] [calendário organizado]

## Knowledge Management Agent
- [ ] Documentar SOP/playbook/objeção [trigger: aprendizado novo] [conhecimento retido]

## Case Study Agent
- [ ] Montar rascunho de case [trigger: resultado excepcional validado] [prova social pronta]

## Productization Agent
- [ ] Propor produto/pacote a partir de padrões [trigger: revisão mensal] [escala de receita]

## Client Success Agent
- [ ] Calcular health score da carteira [trigger: diário 08:00] [risco visível]
- [ ] Montar plano de ação de retenção [trigger: health < 60] [previne churn]

## Risk Agent
- [ ] Varrer e classificar riscos [trigger: diário 06:30 + hourly P1] [riscos priorizados]
- [ ] Escalar P1 [trigger: risco crítico detectado] [Breno alertado em ≤ 5 min]

## Financial Intelligence Agent
- [ ] Atualizar receita/margem/fluxo de caixa [trigger: diário] [saúde financeira clara]

## Personal Brand / Authority Building Agent
- [ ] Gerar rascunho de narrativa/posicionamento [trigger: novo case] [autoridade alimentada]

## Partnership Agent
- [ ] Mapear e qualificar parceiros B2B [trigger: sob demanda] [pipeline de parcerias]

## AI Lab Agent
- [ ] Avaliar nova ferramenta/LLM [trigger: revisão mensal] [stack sempre competitivo]

---

*Fim — Parte 2 do SISTEMA OS · SmartOps IA · 2026-05-30*
*Próximo: 03 — Dashboards & KPIs · Banco de Dados · Governança*
