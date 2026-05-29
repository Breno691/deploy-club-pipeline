# MASTER PROMPT — Sistema Operacional SmartOps IA
# Cole este documento no ChatGPT para obter ajuda em qualquer parte do sistema

---

## QUEM SOU

**Nome:** Breno Luiz
**Empresa:** SmartOps IA
**Especialidade:** Consultoria Lean Six Sigma + Automação com IA para PMEs
**Localização:** Belo Horizonte, MG, Brasil
**Contato:** (31) 97203-9180 | brenoluiz691@gmail.com
**Certificação:** Black Belt Lean Six Sigma
**GitHub:** https://github.com/Breno691/deploy-club-pipeline
**Pipeline Server:** https://n8n-pipeline-server.sumjyb.easypanel.host

---

## O QUE É O SISTEMA

Estou construindo um **Sistema Operacional Inteligente para minha consultoria** — uma plataforma multiagente de IA que opera minha empresa de forma semi-automática.

O sistema tem **10 squads** com **35 agentes** que cobrem:
- Geração e publicação de conteúdo (Instagram, Threads, YouTube)
- Captação e qualificação de leads
- Geração de propostas com ROI calculado
- Análise de campanhas (Google Ads + Meta Ads)
- Monitoramento do site (GA4, eventos, conversões)
- Dashboard executivo com KPIs de todas as áreas
- Inteligência financeira (receita, margem, CAC, LTV)
- Melhoria de processos Lean para clientes
- Automação de workflows via n8n

---

## ARQUITETURA — 8 CAMADAS

```
Camada 1 — Data Collection Layer
  Fontes: GA4, Google Ads, Meta Ads, Instagram Graph API, n8n, formulários, CRM, contratos
  O que coleta: visitantes, leads, conversões, gastos de ads, engajamento, receita

Camada 2 — Memory & Knowledge Layer
  Ferramentas: PostgreSQL, pgvector, Supabase, Redis, Qdrant
  O que armazena: memória de clientes, knowledge base, histórico de decisões, vetores semânticos

Camada 3 — Agent Orchestration Layer
  Ferramentas: BullMQ + Upstash Redis, n8n, LangGraph/CrewAI
  O que faz: coordena execução dos agentes, gerencia fila de tarefas, retry e fallback

Camada 4 — Specialist Agents Layer
  35 agentes em 10 squads (detalhados abaixo)

Camada 5 — Automation Layer
  Ferramenta: n8n
  O que faz: executa workflows aprovados, publica posts, envia alertas Telegram/WhatsApp

Camada 6 — Analytics & Dashboard Layer
  9 dashboards por área com KPIs em tempo real

Camada 7 — Executive Decision Layer
  CEO Advisor Agent + Chief of Staff Agent + plano de ação diário

Camada 8 — Governance & Security Layer
  Auditoria de decisões, aprovação humana via Telegram antes de publicar
```

---

## TECH STACK REAL

| Ferramenta | Propósito | Status |
|---|---|---|
| Node.js 22 | Runtime de todos os scripts | ✅ Ativo |
| Anthropic API (Claude Sonnet 4.6) | Geração de conteúdo, propostas, análise | ✅ Ativo |
| Tavily AI SDK | Pesquisa de mercado em tempo real | ✅ Ativo |
| Playwright (Chromium) | Renderizar HTML → PNG de ads (1080x1080) | ✅ Ativo |
| Supabase | Storage de imagens, banco de dados | ✅ Ativo |
| BullMQ + Upstash Redis | Fila de jobs do pipeline | ✅ Ativo |
| n8n | Automação, triggers e workflows | ✅ Ativo |
| EasyPanel | Deploy do pipeline server | ✅ Ativo |
| Express.js | Pipeline server (porta 3099) | ✅ Ativo |
| Remotion | Renderização de vídeos animados | 🚧 Parcial |
| Instagram Graph API | Publicação no Instagram | 🔴 Pendente |
| YouTube Data API | Publicação no YouTube | 🔴 Pendente |
| Google Ads API | Dados de campanhas pagas | 🔴 Pendente |
| Meta Ads API | Dados de campanhas Meta | 🔴 Pendente |
| GA4 | Analytics do site | 🔴 Pendente |
| PostgreSQL + pgvector | Memória vetorial e banco principal | 🔴 Pendente |

---

## PIPELINE DE CONTEÚDO (JÁ FUNCIONANDO)

**Execução:** 3x/semana — Terça, Quinta e Sábado às 8h
**Trigger:** n8n → POST https://n8n-pipeline-server.sumjyb.easypanel.host/run-pipeline
**Aprovação:** Telegram Bot (Chat ID: 1349738505) com botões ✅ Aprovar / ❌ Rejeitar

```
Passo 1: research.js
  → Pesquisa tendências com Tavily AI
  → Salva: research_results.json, research_brief.md, interactive_report.html

Passo 2: generate_copy.js
  → Gera copy para Instagram, Threads e YouTube via Claude
  → Salva: copy/instagram_caption.txt, copy/threads_post.txt, copy/youtube_metadata.json

Passo 3: generate_ad.js
  → Gera layout do ad (JSON) via Claude
  → Salva: ads/layout.json

Passo 4: build_ad_html.js
  → Converte layout.json em ad.html (dark theme, Bebas Neue, #0A0A0F fundo, #7C3AED roxo)
  → Salva: ads/ad.html

Passo 5: render_ad.js
  → Renderiza ad.html em PNG 1080x1080 via Playwright
  → Salva: ads/instagram_ad.png

Passo 6: upload_media.js
  → Faz upload da imagem para Supabase Storage
  → Salva: media_urls.json, auto_result.json
  → Retorna URL pública para o n8n

Passo 7: n8n → Telegram
  → Envia preview (imagem + legenda + hashtags) para o Telegram
  → Aguarda aprovação com botões
  → Se aprovado → publica no Instagram (pendente de implementação)
```

**Output por execução:**
```
outputs/<task_name>_<date>/
├── research_results.json / research_brief.md / interactive_report.html
├── media_urls.json / auto_result.json
├── ads/ layout.json + ad.html + instagram_ad.png
├── copy/ instagram_caption.txt + threads_post.txt + youtube_metadata.json
└── logs/ *.log
```

---

## OS 10 SQUADS E 35 AGENTES — DETALHAMENTO COMPLETO

---

### SQUAD 1 — MARKETING (7 agentes)

#### 1. Copywriter Agent
**Arquivo:** `scripts/generate_copy.js` (implementado)
**O que faz:**
- Gera caption para Instagram (legenda + hashtags + CTA)
- Gera post para Threads (versão mais curta e direta)
- Gera metadata para YouTube (título, descrição, tags)
- Usa framework: Dor → Agitar → Intrigar → Futuro → CTA

**Inputs:**
- research_results.json (tendências do dia)
- knowledge/brand_identity.md (tom de voz aprovado)
- knowledge/content_strategy.md (pilares de conteúdo)
- knowledge/customer_personas.md (4 personas mapeadas)

**Outputs:**
- `copy/instagram_caption.txt` — legenda pronta para publicar
- `copy/threads_post.txt` — post otimizado para Threads
- `copy/youtube_metadata.json` — título, descrição, tags

**Como usar via CLI:**
```bash
node scripts/generate_copy.js --task nome_campanha --date YYYY-MM-DD
```

---

#### 2. Design Agent
**Arquivo:** `scripts/generate_ad.js` + `scripts/build_ad_html.js` (implementado)
**O que faz:**
- Gera layout do ad em JSON (headline, subtext, CTA, cores)
- Constrói HTML dark theme com Bebas Neue + Inter
- Exporta PNG 1080x1080 via Playwright

**Design padrão SmartOps IA:**
- Fundo: #0A0A0F
- Acento Lean: #7C3AED (roxo)
- Acento Automação: #10B981 (verde)
- Headline: Bebas Neue (impacto máximo)
- Corpo: Inter
- Layout: faixa roxa vertical esquerda + grid sutil + 3 pilares numerados

**Outputs:**
- `ads/layout.json` — estrutura do ad
- `ads/ad.html` — HTML renderizável
- `ads/instagram_ad.png` — imagem final 1080x1080

---

#### 3. Distribution Agent
**Arquivo:** não implementado (pendente)
**O que fará:**
- Publica no Instagram via Graph API
- Publica no Threads via API
- Publica no YouTube via Data API v3
- Gerencia calendário de publicações
- Controla janelas de horário (Instagram: Ter-Qui-Sáb 11h-13h BRT)

**Inputs necessários:**
- `media_urls.json` (URL da imagem no Supabase)
- `copy/instagram_caption.txt` (legenda pronta)
- Aprovação do Telegram (webhook do n8n)

**APIs necessárias:**
- Instagram Graph API: token de longa duração + Page ID
- YouTube Data API v3: OAuth 2.0
- Threads: API em beta (usar via automação n8n por enquanto)

---

#### 4. Marketing Research Agent
**Arquivo:** `scripts/research.js` (implementado)
**O que faz:**
- Pesquisa tendências de mercado em tempo real
- Identifica dores do público-alvo (donos de PMEs em BH)
- Analisa hooks virais do Instagram
- Mapeia gaps de concorrentes
- Sugere horários de publicação

**Ferramenta:** Tavily AI (pesquisa semântica em tempo real)

**Queries automáticas:**
1. Problemas operacionais pequenas empresas Brasil 2026
2. Dono pequena empresa Brasil dificuldades equipe processo
3. Posts virais Instagram empresários brasileiros 2026
4. Automação WhatsApp IA pequenas empresas resultado
5. Conteúdo viral empreendedorismo Instagram Threads Brasil

**Outputs:**
- `research_results.json` — dados estruturados
- `research_brief.md` — briefing para downstream agents
- `interactive_report.html` — relatório visual com gráficos

---

#### 5. SEO Agent
**Arquivo:** `skills/seo-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Pesquisa keywords de cauda longa (consultoria Lean BH, melhoria de processos PME)
- Otimiza meta tags e descrições do site
- Cria clusters de conteúdo semântico
- Monitora posicionamento no Google Search Console
- Gera sugestões de blog posts e artigos de autoridade

**Keywords prioritárias:**
- "consultoria lean six sigma bh"
- "melhoria de processos pequenas empresas"
- "automação whatsapp pequena empresa"
- "lean six sigma para restaurante"
- "black belt lean six sigma belo horizonte"

---

#### 6. Video Ad Agent
**Arquivo:** `skills/video-ad-specialist/SKILL.md` (documentado, script pendente)
**O que fará:**
- Cria roteiros de vídeo ad (VSL — Video Sales Letter)
- Gera scripts para Reels (60-90 segundos)
- Estrutura UGC (User Generated Content) com testemunhal
- Define hook visual dos primeiros 3 segundos
- Cria chamadas para o Remotion renderizar

---

#### 7. Remotion Video Agent
**Arquivo:** `remotion/src/` (parcialmente implementado)
**O que faz:**
- Renderiza vídeos animados com React + Remotion
- Componente `AdVideo.tsx` já existe
- Precisa de integração com o pipeline via `render_video.js`

**Fluxo planejado:**
```
generate_copy.js → (dados do vídeo) → AdVideo.tsx (Remotion) → render_video.js → video.mp4
```

---

### SQUAD 2 — GROWTH (5 agentes)

#### 8. CRO Agent
**Arquivo:** `skills/cro-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Analisa taxa de conversão de cada página do site
- Identifica onde os visitantes abandonam o funil
- Sugere mudanças de copy, layout e CTA
- Cria testes A/B para landing pages
- Mede impacto de cada mudança

**Métricas monitoradas:**
- Taxa de conversão do formulário de diagnóstico
- Bounce rate por página
- Tempo médio na página
- CTR dos CTAs

---

#### 9. Customer Journey Agent
**Arquivo:** `skills/customer-journey-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Mapeia a jornada completa do visitante (do primeiro clique ao contrato assinado)
- Identifica pontos de atrito no funil
- Rastreia origem de cada lead (Instagram, Google, indicação, WhatsApp)
- Sugere ações para cada etapa da jornada

**Jornada mapeada:**
```
Consciência → Interesse → Consideração → Diagnóstico Gratuito → Proposta → Decisão → Cliente
```

---

#### 10. Revenue Agent
**Arquivo:** `skills/revenue-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Monitora receita por canal de aquisição
- Calcula CAC (Custo de Aquisição de Cliente) por canal
- Calcula LTV (Lifetime Value) por tipo de projeto
- Atribui receita à campanha que gerou o lead
- Projeta receita dos próximos 30/60/90 dias

---

#### 11. Ads Agent
**Arquivo:** `skills/ads-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Monitora desempenho de Google Ads (CPC, CTR, CPA, Quality Score)
- Monitora desempenho de Meta Ads (CPM, CTR, ROAS, frequência)
- Identifica criativos com melhor performance
- Sugere ajustes de bid, orçamento e segmentação
- Cria relatório semanal de campanhas pagas

**APIs necessárias:**
- Google Ads API: Developer Token + OAuth
- Meta Marketing API: Access Token de longa duração

---

#### 12. Website Analytics Agent
**Arquivo:** `skills/website-analytics-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Monitora visitantes, sessões e bounce rate via GA4
- Rastreia eventos (clique no botão WhatsApp, scroll, tempo na página)
- Identifica páginas que mais convertem e as que mais perdem visitantes
- Reporta origem de tráfego (orgânico, pago, social, direto)
- Alerta quando há queda anormal de tráfego

**API necessária:** Google Analytics Data API v1 (GA4)

---

### SQUAD 3 — OPERATIONS (5 agentes)

#### 13. Lean Agent
**Arquivo:** `skills/lean-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Analisa processos de clientes usando os 8 desperdícios do Lean
- Gera Value Stream Map (VSM) em formato digital
- Identifica gargalos e etapas sem valor agregado
- Calcula tempo de ciclo vs lead time
- Prioriza quick wins por impacto e esforço

**Os 8 desperdícios do Lean:**
1. Superprodução | 2. Espera | 3. Transporte | 4. Superprocessamento
5. Estoque | 6. Movimentação | 7. Defeitos | 8. Talento não usado

---

#### 14. Six Sigma Agent
**Arquivo:** `skills/six-sigma-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Conduz análise DMAIC (Define-Measure-Analyze-Improve-Control)
- Calcula Cpk, sigma level e DPMO (defeitos por milhão de oportunidades)
- Constrói diagramas de Ishikawa e Pareto
- Cria plano de controle para sustentação das melhorias
- Documenta causa raiz identificada com evidência estatística

---

#### 15. Kaizen Agent
**Arquivo:** `skills/kaizen-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Gerencia eventos Kaizen (melhoria rápida em 3-5 dias)
- Rastreia pequenas melhorias diárias
- Cria quadro Kanban de melhorias em andamento
- Mensura impacto acumulado das melhorias
- Alerta sobre melhorias que não estão sendo sustentadas

---

#### 16. Process Mining Agent
**Arquivo:** `skills/process-mining-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Analisa logs e dados de sistemas para descobrir processos reais
- Compara processo ideal vs processo real executado
- Identifica desvios e variações entre operadores
- Detecta automáticamente onde há desperdício nos dados

---

#### 17. Automation Agent
**Arquivo:** `skills/automation-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Identifica processos candidatos à automação
- Cria workflows no n8n
- Conecta APIs e webhooks
- Implementa bots WhatsApp com IA
- Documenta cada automação criada com diagrama de fluxo

---

### SQUAD 4 — SALES (4 agentes)

#### 18. Sales Intelligence Agent
**Arquivo:** `skills/sales-intelligence-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Qualifica leads com o sistema de scoring (0-100 pontos)
- Analisa padrão de objeções por segmento
- Sugere abordagem personalizada para cada lead
- Monitora pipeline de vendas e taxa de conversão
- Alerta sobre leads quentes que precisam de follow-up

**Lead Scoring (máximo 100 pontos):**
- Dono/CEO (decide sozinho): +15 pts
- 10-50 funcionários: +10 pts
- Já tentou resolver e falhou: +8 pts
- Urgência clara (perda visível de dinheiro): +12 pts
- Veio por indicação: +15 pts
- Setor prioritário (saúde, serviços, indústria): +8 pts
- LinkedIn/Instagram ativo: +5 pts
- Respondeu perguntas com detalhes: +10 pts
- Score > 50: prioridade máxima de follow-up

---

#### 19. Proposal Agent
**Arquivo:** `scripts/proposal_agent.js` (implementado)
**O que faz:**
- Analisa notas da reunião de diagnóstico
- Classifica o cliente em uma das 4 personas
- Seleciona o tier de proposta adequado
- Gera proposta completa com ROI calculado
- Gera resumo executivo de 1 página

**Tiers de proposta:**
- Quick Win: R$ 3-8k | 2-4 semanas
- Diagnóstico + Plano: R$ 8-15k | 4-6 semanas
- Projeto Completo: R$ 15-50k | 2-4 meses
- Parceria Contínua: R$ 3-8k/mês | Mensal

**Como usar:**
```bash
node scripts/proposal_agent.js --task proposta_carlos --client "Carlos" --notes reuniao.txt --tier diagnostico
```

**Outputs:**
- `proposals/proposal_<cliente>.md` — proposta completa
- `proposals/executive_summary_<cliente>.md` — resumo 1 página
- `proposals/roi_calculation_<cliente>.json` — cálculo de ROI

---

#### 20. Offer Optimization Agent
**Arquivo:** `skills/offer-optimization-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Analisa quais ofertas têm maior taxa de aprovação
- Testa variações de preço, escopo e prazo
- Identifica qual combinação de serviços tem maior LTV
- Sugere upsell e cross-sell baseado no histórico de clientes

---

#### 21. Pricing Agent
**Arquivo:** `skills/pricing-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Calcula preço por tipo de projeto com margem mínima de 60%
- Analisa sensibilidade a preço por segmento
- Compara pricing com concorrentes
- Sugere tabela de preços e pacotes

---

### SQUAD 5 — EXECUTIVE (5 agentes)

#### 22. Executive Dashboard Agent
**Arquivo:** `skills/executive-dashboard-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Consolida KPIs de todos os squads
- Gera relatório diário, semanal e mensal
- Alerta sobre métricas fora do target
- Mantém histórico de progresso vs metas

---

#### 23. Competitor Intelligence Agent
**Arquivo:** `skills/competitor-intelligence-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Monitora concorrentes no Instagram e Google
- Rastreia novos serviços, preços e campanhas da concorrência
- Identifica gaps que a SmartOps IA pode explorar
- Alerta quando um concorrente lança algo relevante

---

#### 24. Strategic Planning Agent
**Arquivo:** `skills/strategic-planning-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Cria planos 30/90/180 dias com OKRs
- Acompanha progresso das metas semanalmente
- Sugere pivôs de estratégia com base em dados
- Define prioridades trimestrais por ROI esperado

---

#### 25. CEO Advisor Agent
**Arquivo:** `scripts/ceo_advisor.js` (implementado)
**O que faz:**
- Lê outputs de todos os agentes disponíveis
- Gera briefing executivo diário/semanal
- Prioriza ações com framework FAZER HOJE / PLANEJAR / DELEGAR
- Identifica onde o negócio está perdendo dinheiro ou leads
- Gera lista de decisões com score de impacto

**Como usar:**
```bash
node scripts/ceo_advisor.js --task ceo_daily --mode daily
node scripts/ceo_advisor.js --task ceo_weekly --mode weekly
```

**Outputs:**
- `ceo/executive_action_plan.md` — plano de ação executivo
- `ceo/decisions.json` — decisões priorizadas com score

---

#### 26. Chief of Staff Agent
**Arquivo:** `skills/chief-of-staff-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Transforma decisões do CEO Advisor em tarefas concretas
- Gerencia agenda e prioridades do dia
- Monitora execução das tarefas em andamento
- Envia resumo diário via Telegram/WhatsApp

---

### SQUAD 6 — KNOWLEDGE (3 agentes)

#### 27. Knowledge Management Agent
**Arquivo:** `skills/knowledge-management-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Organiza e mantém atualizada a base de conhecimento
- Cria SOPs (Standard Operating Procedures) para processos recorrentes
- Captura aprendizados de cada projeto e cliente
- Indexa documentos no PostgreSQL + pgvector para busca semântica

**Knowledge files atuais:**
- `knowledge/brand_identity.md` — tom, voz, CTAs aprovados
- `knowledge/product_campaign.md` — serviços, selling points, 50 dores mapeadas
- `knowledge/platform_guidelines.md` — regras Instagram, Threads, YouTube
- `knowledge/visual_references.md` — paleta, tipografia, tokens de design
- `knowledge/content_strategy.md` — 5 pilares, frequência, estrutura de reel
- `knowledge/sales_playbook.md` — GPCTBA 14 passos, scripts WhatsApp
- `knowledge/customer_personas.md` — 4 personas com lead scoring

---

#### 28. Case Study Agent
**Arquivo:** `skills/case-study-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Documenta casos de sucesso de clientes em formato antes/depois
- Calcula ROI real de cada projeto concluído
- Gera material de prova social para marketing
- Cria templates de case study por segmento

---

#### 29. Productization Agent
**Arquivo:** `skills/productization-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Identifica serviços que podem virar produtos digitais
- Cria pacotes padronizados e replicáveis
- Define precificação de produtos vs serviços customizados
- Documenta metodologia para escalar sem depender do consultor

---

### SQUAD 7 — CLIENT SUCCESS (2 agentes)

#### 30. Client Success Agent
**Arquivo:** `skills/client-success-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Monitora satisfação de clientes em andamento
- Rastreia entregáveis e prazos de cada projeto
- Identifica oportunidade de expansão (upsell) em clientes ativos
- Alerta sobre risco de churn com antecedência

---

#### 31. Risk Agent
**Arquivo:** `skills/risk-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Monitora indicadores de risco em tempo real
- Alerta sobre pagamentos em atraso, prazo estourado, cliente insatisfeito
- Sugere ação preventiva antes que o problema escale
- Gera relatório semanal de riscos por categoria

---

### SQUAD 8 — FINANCE (1 agente)

#### 32. Financial Intelligence Agent
**Arquivo:** `scripts/financial_agent.js` (implementado)
**O que faz:**
- Calcula receita, margem bruta e margem líquida
- Calcula CAC (Custo de Aquisição de Cliente) e LTV (Lifetime Value)
- Projeta fluxo de caixa 30/60/90 dias
- Analisa margem por tipo de serviço
- Alerta sobre desvios financeiros

**Metas financeiras:**
- Margem bruta: > 60%
- Margem líquida: > 35%
- LTV:CAC ratio: > 3x
- Cobertura de caixa: ≥ 3 meses

**Como usar:**
```bash
node scripts/financial_agent.js --task finance_semanal --data data/financial_data.json
```

**Outputs:**
- `finance/financial_report_weekly.md` — relatório semanal
- `finance/margin_by_service.json` — margem por serviço
- `finance/cash_flow_forecast.json` — previsão 30/60/90 dias
- `finance/roi_by_channel.json` — ROI por canal

**Formato do arquivo de dados (data/financial_data.json):**
```json
{
  "receita": {
    "projetos_ativos": 0,
    "novos_fechamentos": 0,
    "parceria_mensal": 0
  },
  "custos": {
    "ferramentas_ia": 0,
    "plataformas": 0,
    "marketing_ads": 0,
    "outros_fixos": 0
  },
  "pipeline": {
    "leads_ativos": 0,
    "valor_total_pipeline": 0,
    "probabilidade_media": 0.3,
    "reunioes_agendadas": 0
  },
  "clientes": {
    "total_ativos": 0,
    "novos_mes": 0,
    "ticket_medio": 12000,
    "duracao_media_meses": 3
  }
}
```

---

### SQUAD 9 — PERSONAL BRAND (3 agentes)

#### 33. Personal Brand Agent
**Arquivo:** `skills/personal-brand-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Cria narrativa de autoridade para Breno Luiz
- Desenvolve posicionamento como Black Belt referência em BH
- Gerencia consistência de tom em todos os canais
- Sugere temas de conteúdo para construir autoridade

---

#### 34. Authority Building Agent
**Arquivo:** `skills/authority-building-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Identifica oportunidades de palestras e eventos em BH
- Sugere artigos técnicos para LinkedIn
- Cria roteiros para lives e podcasts
- Monitora menções à SmartOps IA na internet

---

#### 35. Partnership Agent
**Arquivo:** `skills/partnership-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Identifica parceiros estratégicos B2B (contadores, consultores de RH, ERPs)
- Cria proposta de parceria com comissionamento
- Gerencia pipeline de parcerias ativas
- Mede receita gerada por canal de parceiros

---

### SQUAD 10 — AI LAB (1 agente)

#### 36. AI Lab Agent
**Arquivo:** `skills/ai-lab-agent/SKILL.md` (documentado, script pendente)
**O que fará:**
- Monitora novidades em LLMs, ferramentas e automação
- Testa novas ferramentas e avalia aplicação para a consultoria
- Propõe implementações de novas tecnologias
- Mantém o stack atualizado com as melhores ferramentas disponíveis

---

## AS 4 PERSONAS DE CLIENTES

### Persona 1 — "Carlos, o Dono da Clínica Odontológica"
- Idade: 38-48 anos | BH | 5-15 funcionários | R$ 80-300k/mês
- Dores: recepção desorganizada, retrabalho no faturamento, equipe sobrecarregada
- Quer: processo que funciona sem ele, crescer sem contratar mais
- Decisão: 2-3 semanas | Score mínimo para priorizar: 50 pts

### Persona 2 — "Roberto, o Dono do Restaurante"
- Idade: 35-50 anos | BH | 10-40 funcionários | R$ 50-200k/mês
- Dores: superprodução, estoque desaparecendo, equipe sem padrão
- Quer: reduzir desperdício de alimentos, controle de estoque sem planilha
- Decisão: 1-2 semanas (decide rápido se ver número concreto)

### Persona 3 — "Ana, a Dona da Empresa de Serviços"
- Idade: 32-45 anos | BH | 5-25 pessoas | B2B
- Dores: propostas manuais, onboarding lento, dependência pessoal
- Quer: processos documentados, automação de comunicação, escalar
- Decisão: 3-4 semanas (pesquisa muito antes de decidir)

### Persona 4 — "Paulo, o Gerente de Operações de Indústria"
- Idade: 35-55 anos | MG | Médio porte | Engenheiro/Administrador
- Dores: lead time alto, retrabalho acima do aceitável, dados sem ação
- Quer: análise DMAIC, quick wins visíveis para a diretoria
- Decisão: 4-8 semanas (formal, envolve mais pessoas)

---

## OS 9 DASHBOARDS (ESPECIFICAÇÃO)

### Dashboard 1 — Executive (Consolidado)
- KPIs: receita MRR, clientes ativos, leads no pipeline, taxa de conversão, NPS
- Alertas: ação urgente do dia, risco identificado, oportunidade imediata
- Gráficos: receita 12 meses, pipeline por estágio, metas vs realizado

### Dashboard 2 — Marketing
- KPIs: alcance total, engajamento médio, novos seguidores, CTR
- Conteúdo: calendário de publicações, próximo post programado, performance de cada post
- Gráficos: crescimento de seguidores, engajamento por tipo de post

### Dashboard 3 — Website (Analytics)
- KPIs: visitantes únicos, sessões, bounce rate, tempo médio, conversões
- Páginas: mais visitadas, mais convertidas, maior taxa de abandono
- Funil: visita → clique WhatsApp → agendamento → reunião

### Dashboard 4 — Ads (Campanhas Pagas)
- KPIs: CPC, CTR, CPA, ROAS, Quality Score (Google) | CPM, frequência (Meta)
- Campanhas ativas: status, orçamento, resultado vs meta
- Criativos: top performers e bottom performers

### Dashboard 5 — Revenue
- KPIs: receita total, CAC, LTV, LTV:CAC ratio, pipeline value
- Funil: leads → reuniões → propostas → clientes
- Atribuição: qual canal gera mais receita

### Dashboard 6 — Sales (Pipeline)
- KPIs: leads ativos, reuniões agendadas, propostas abertas, taxa de fechamento
- Quadro Kanban: Novo Lead → Qualificado → Reunião → Proposta → Negociação → Fechado
- Objeções: mapa das objeções mais comuns e taxa de reversão

### Dashboard 7 — Operations
- KPIs: projetos ativos, lead time médio, taxa de retrabalho, automações ativas
- Projetos: status de cada cliente em andamento
- Kaizen: melhorias implementadas no mês

### Dashboard 8 — Client Success
- KPIs: clientes ativos, NPS médio, churn rate, upsell rate
- Alertas: clientes em risco, pagamentos em atraso, prazo estourado
- Timeline: próximas entregas e marcos por cliente

### Dashboard 9 — Finance
- KPIs: receita mensal, margem bruta, margem líquida, fluxo de caixa
- Forecast: previsão 30/60/90 dias
- Margem por serviço: qual tipo de projeto é mais lucrativo

---

## FRAMEWORK DE OUTPUT DE CADA AGENTE

Todo agente da SmartOps IA responde 8 perguntas e entrega 10 elementos:

**8 Perguntas:**
1. O que aconteceu?
2. Por que aconteceu?
3. Qual impacto?
4. O que fazer agora?
5. Qual prioridade?
6. Qual ROI esperado?
7. Qual risco de não agir?
8. Como medir sucesso?

**10 Elementos obrigatórios no output:**
```
TÍTULO:
CONTEXTO:
DADOS ANALISADOS:
PROBLEMA IDENTIFICADO:
EVIDÊNCIA:
IMPACTO:
RECOMENDAÇÃO:
AÇÃO SUGERIDA:
PRIORIDADE: [Alta / Média / Baixa]
ESFORÇO: [Baixo / Médio / Alto]
ROI ESPERADO:
RISCO DE NÃO AGIR:
PRAZO:
MÉTRICA DE SUCESSO:
PRÓXIMO PASSO:
```

---

## FLUXO ORQUESTRADO COMPLETO

```
Evento ou solicitação
        ↓
Orchestrator Agent (pipeline/orchestrator.js)
        ↓
Seleciona squad e agente
        ↓
[SQUAD MARKETING]: Research → Copywriter → Design → Video → Distribution
[SQUAD GROWTH]: CRO → Journey → Revenue → Ads → Analytics
[SQUAD SALES]: Intelligence → Proposal → Offer → Pricing
[SQUAD OPS]: Lean → Six Sigma → Kaizen → Mining → Automation
[SQUAD EXECUTIVE]: Dashboard → Competitor → Strategic → CEO → CoS
        ↓
CEO Advisor consolida e prioriza
        ↓
Chief of Staff cria plano de execução
        ↓
n8n executa automações aprovadas
        ↓
Telegram notifica Breno para aprovação
        ↓
Dashboard atualiza resultado
```

---

## FLUXO DIÁRIO DE OPERAÇÃO

```
06:00 — CEO Advisor gera briefing do dia (ceo_advisor.js --mode daily)
08:00 — Pipeline de conteúdo roda (Ter/Qui/Sáb)
        research.js → generate_copy.js → generate_ad.js → build_ad_html.js → render_ad.js → upload_media.js
08:30 — Telegram: preview do post com botões ✅ Aprovar / ❌ Rejeitar
09:00 — Breno aprova ou rejeita
09:05 — Se aprovado: Distribution Agent publica no Instagram
12:00 — Sales Intelligence Agent atualiza pipeline de leads
17:00 — Financial Agent atualiza métricas financeiras
18:00 — CEO Advisor gera resumo do dia e próximas ações
```

---

## O QUE PRECISA SER IMPLEMENTADO (ROADMAP)

### Fase 1 — Core Business (Prioridade Imediata)
- [ ] `scripts/distribution_agent.js` — publicar no Instagram via Graph API
- [ ] `data/financial_data.json` — estrutura para dados financeiros reais
- [ ] Integração GA4 — rastrear visitantes e conversões do site
- [ ] CRM básico no Supabase — leads, reuniões, propostas, clientes

### Fase 2 — Growth Intelligence
- [ ] `scripts/website_analytics.js` — ler dados do GA4
- [ ] `scripts/ads_agent.js` — ler Google Ads + Meta Ads API
- [ ] `scripts/sales_intelligence.js` — scoring automático de leads
- [ ] Dashboard web completo (React ou HTML puro)

### Fase 3 — Operations & Scale
- [ ] `scripts/render_video.js` — integrar Remotion ao pipeline
- [ ] `scripts/risk_agent.js` — alertas automáticos de risco
- [ ] PostgreSQL + pgvector — memória vetorial dos agentes
- [ ] Multi-client support — rodar agentes para clientes da consultoria

---

## COMO USAR CADA SCRIPT HOJE

```bash
# Pipeline completo de conteúdo
npm run pipeline:run

# Pesquisa de mercado
node scripts/research.js --task campanha_lean --date 2026-05-29

# Geração de copy
node scripts/generate_copy.js --task campanha_lean --date 2026-05-29

# Geração de ad (layout JSON)
node scripts/generate_ad.js --task campanha_lean --date 2026-05-29

# Build do HTML do ad
node scripts/build_ad_html.js --task campanha_lean --date 2026-05-29

# Renderizar PNG 1080x1080
node scripts/render_ad.js --task campanha_lean --date 2026-05-29

# Upload para Supabase
node scripts/upload_media.js --task campanha_lean --date 2026-05-29

# Gerar proposta comercial
node scripts/proposal_agent.js --task proposta_carlos --client "Carlos Silva" --notes notas_reuniao.txt

# Briefing executivo do dia
node scripts/ceo_advisor.js --task ceo_daily --mode daily

# Relatório financeiro
node scripts/financial_agent.js --task finance_semanal --data data/financial_data.json
```

---

## INSTRUÇÃO PARA O CHATGPT

Agora que você tem o contexto completo do Sistema Operacional SmartOps IA, você pode me ajudar com qualquer uma destas tarefas:

1. **Explicar como qualquer agente funciona** — me diga qual agente e eu detalho
2. **Implementar um script faltante** — diga qual e eu crio o código Node.js
3. **Criar o dashboard web** — especifique qual seção ou todos os 9 dashboards
4. **Criar o banco de dados** — gero o schema PostgreSQL + Supabase
5. **Criar workflows n8n** — especifique qual automação
6. **Gerar propostas** — forneça as notas da reunião e o perfil do cliente
7. **Analisar um processo** — descreva o processo e aplico Lean Six Sigma
8. **Criar conteúdo** — diga o tema e gero copy completo para Instagram/Threads/YouTube
9. **Calcular ROI** — forneça os dados do processo e calculo o retorno esperado
10. **Criar scripts de vendas** — diga o segmento e gero o script GPCTBA completo

**Qual parte você quer que eu ajude agora?**
