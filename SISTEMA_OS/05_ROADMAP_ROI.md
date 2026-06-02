# SISTEMA OS — SmartOps IA
## Roadmap de Implementação por Prioridade de ROI
*Versão: 2026-05-30 | Meta: R$50k MRR em 90 dias*

---

> **Princípio:** Implementar primeiro o que gera caixa. Cada fase deve pagar a próxima.

---

## FASE 0 — FUNDAÇÃO (Semana 1) · Custo: R$0 · ROI: Habilita tudo

**O que já está pronto:**
- ✅ 35 agentes definidos (DIRETORES.md + DIRETORES_PARTE2.md)
- ✅ 26 rotinas diárias ativas (claude.ai/code/routines)
- ✅ Bot Telegram @IAAgentesmartopsbot configurado
- ✅ n8n + pipeline server no EasyPanel
- ✅ Schema do banco (SISTEMA_OS/03_SCHEMA_BANCO.sql)

**O que fazer esta semana:**
- [ ] Aplicar o schema SQL no PostgreSQL (Supabase)
- [ ] Configurar variáveis de ambiente em produção
- [ ] Testar todas as 26 rotinas com run manual
- [ ] Verificar recebimento das mensagens no @IAAgentesmartopsbot

---

## FASE 1 — GERAÇÃO DE LEADS (Dias 1-14) · ROI esperado: 10-15 leads/mês

**Objetivo:** Ter leads qualificados entrando todo dia.

### Sprint 1.1 — Ads + Landing Page (Dias 1-7)

| Ação | Agente responsável | Tempo | Impacto |
|---|---|---|---|
| Configurar Google Ads com as 3 campanhas do campaign_copy.md | Ads Agent | 4h | 10 leads/mês |
| Configurar Meta Ads com os 3 criativos | Ads Agent | 2h | 8 leads/mês |
| Subir landing page /diagnostico-gratuito | CRO Agent | 3h | +50% conversão |
| Instalar Meta Pixel + GA4 na landing | Website Analytics | 1h | Tracking completo |

**KPIs para monitorar:**
- CPA alvo: ≤ R$60
- CTR Google: ≥ 3.5%
- Taxa de conversão landing: ≥ 5%

**ROI calculado:**
- Budget: R$65/dia = R$1.950/mês
- Meta: 23-34 leads qualificados/mês
- CPL alvo: R$60-85

---

### Sprint 1.2 — Lead Scoring + CRM (Dias 3-10)

| Ação | Agente responsável | Tempo | Impacto |
|---|---|---|---|
| Configurar formulário no site com webhook | Automation Agent | 2h | Captura automática |
| Workflow n8n: formulário → Lead Scoring → Telegram | Automation Agent | 3h | A+ notificado em < 15min |
| Planilha CRM (Google Sheets ou Notion) | Sales Intelligence | 1h | Pipeline visível |
| Regras de scoring A+/A/B/C/D | Lead Scoring Agent | 1h | Priorização automática |

**ROI calculado:**
- Sem lead scoring: resposta média em 2h → taxa fechamento ~15%
- Com lead scoring + resposta em < 5min → taxa fechamento ~35%
- Impacto: +R$10k/mês com o mesmo volume de leads

---

## FASE 2 — CONVERSÃO (Dias 15-30) · ROI esperado: 2-3 clientes fechados

**Objetivo:** Converter leads em diagnósticos e diagnósticos em clientes.

### Sprint 2.1 — Sales Intelligence + Proposta Automática

| Ação | Agente responsável | Tempo | Impacto |
|---|---|---|---|
| Template de dossiê comercial (Sales Intelligence) | Sales Intelligence | 2h | +30% na taxa de reunião→proposta |
| Template de proposta PDF (Proposal Agent) | Proposal Agent | 4h | Proposta em < 2h |
| ROI calculator integrado à proposta | Pricing Agent | 2h | Ticket médio +20% |
| Follow-up automático via n8n (D+1, D+3, D+7) | Automation Agent | 3h | +15% taxa de fechamento |

**Sequência de fechamento otimizada:**
```
Lead entra (D+0)
  → Contato em < 5min (Automation)
  → Dossiê gerado < 2h antes da reunião (Sales Intelligence)
  → Diagnóstico 30min
  → Proposta enviada < 2h depois (Proposal Agent)
  → Follow-up D+1: "Dúvidas sobre a proposta?"
  → Follow-up D+3: case de sucesso similar
  → Follow-up D+7: "Última chance — vagas limitadas"
```

**ROI calculado:**
- 25 leads/mês × 30% reunião → 7-8 reuniões
- 7 reuniões × 50% proposta → 3-4 propostas
- 4 propostas × 60% fechamento → 2-3 clientes
- 2 clientes × R$10k = **R$20k novo MRR**

---

### Sprint 2.2 — Conteúdo Orgânico (Paralelo)

| Ação | Agente responsável | Tempo | Impacto |
|---|---|---|---|
| Pipeline de conteúdo 3x/semana ativo | Orchestrator | 1h config | Autoridade + leads orgânicos |
| 10 posts com hook "comenta DIAGNÓSTICO" | Copywriter Agent | 1 semana | 5-10 DMs/semana |
| Reels anti-design fundo branco | Personal Brand Agent | 2h/semana | Alcance 3x maior |
| Stories com enquete (6 slides) | Distribution Agent | 1h | Engajamento direto |

---

## FASE 3 — OPERAÇÕES INTERNAS (Dias 20-45) · ROI: economia de R$5k/mês

**Objetivo:** Eliminar trabalho manual que o Breno faz hoje.

### Sprint 3.1 — Automações de Alto Impacto

| Automação | Agente | Horas economizadas/mês | ROI mensal |
|---|---|---|---|
| Resposta automática WhatsApp leads novos | Automation Agent | 8h | R$800 |
| Geração de proposta sem intervenção humana | Proposal Agent | 6h | R$600 |
| Relatório semanal automático para clientes | Client Success Agent | 4h | R$400 |
| Agendamento automático (Calendly + n8n) | Automation Agent | 3h | R$300 |
| Captura e scoring de leads 24/7 | Lead Scoring Agent | 5h | R$500 |
| **Total** | | **26h/mês** | **R$2.600/mês** |

Considerando hora de Breno = R$100/h (conservador para Black Belt):
**26h × R$100 = R$2.600/mês economizados**

---

## FASE 4 — ESCALA (Dias 45-90) · ROI: R$30k-R$50k MRR

**Objetivo:** Escalar de 2-3 clientes para 5+ clientes sem aumentar esforço.

### Sprint 4.1 — SEO + Orgânico

| Ação | Agente | Prazo | Impacto |
|---|---|---|---|
| 10 artigos SEO otimizados (pillar + clusters) | SEO Agent | 30 dias | 500+ visitas/mês |
| Google Business Profile otimizado | SEO Agent | 1 semana | Busca local BH |
| Link building (3 fontes/mês) | SEO Agent | Ongoing | DA crescente |

**ROI:** Leads orgânicos = CPA R$0. Meta: 10 leads orgânicos/mês até mês 3.

---

### Sprint 4.2 — Produtização

| Produto | Agente | Tempo | Receita potencial |
|---|---|---|---|
| Diagnóstico Express (R$497 — 4h de trabalho) | Productization | 2 semanas | R$2k-R$5k/mês extra |
| Masterclass Lean + IA para PME (R$197) | Productization | 1 mês | R$1k-R$3k/mês |
| SOP Pack completo (R$297) | Knowledge Management | 2 semanas | R$500-R$1k/mês |

---

### Sprint 4.3 — Parcerias B2B

| Parceria | Agente | Prazo | Leads esperados |
|---|---|---|---|
| Contador / escritório contábil BH | Partnership Agent | 30 dias | 2-3 leads/mês |
| Associação industrial BH (FIEMG) | Partnership Agent | 45 dias | 5-8 leads/mês |
| Consultores RH que não fazem processos | Partnership Agent | 30 dias | 2-4 leads/mês |

---

## TRACKER DE METAS

| Mês | MRR Meta | Clientes | Leads/Mês | CPA Máx | Margem |
|---|---|---|---|---|---|
| Junho 2026 | R$10k | 1 | 25 | R$100 | 60% |
| Julho 2026 | R$20k | 2 | 30 | R$80 | 62% |
| Agosto 2026 | R$30k | 3 | 35 | R$70 | 64% |
| Setembro 2026 | R$40k | 4 | 40 | R$65 | 65% |
| Outubro 2026 | R$50k | 5 | 45 | R$60 | 67% |

---

## PRIORIZAÇÃO POR ROI

| # | Ação | Esforço | ROI Mensal | Prazo |
|---|---|---|---|---|
| 1 | Configurar Google Ads + Meta Ads | 6h | R$10-20k | Semana 1 |
| 2 | Workflow Lead Scoring + Telegram | 4h | R$10k | Semana 1 |
| 3 | Landing /diagnostico-gratuito | 3h | +50% conversão | Semana 1 |
| 4 | Template proposta automática | 4h | +R$5k/mês | Semana 2 |
| 5 | Pipeline conteúdo 3x/semana | 2h config | 5-10 DMs/sem | Semana 2 |
| 6 | Follow-up automático n8n | 3h | +15% fechamento | Semana 2 |
| 7 | WhatsApp automático leads | 2h | 8h economizadas | Semana 3 |
| 8 | SEO 10 artigos | 10h/mês | R$0 CPA orgânico | Mês 2 |
| 9 | Diagnóstico Express R$497 | 2 semanas | R$2-5k extra | Mês 2 |
| 10 | Parcerias B2B BH | 1 mês | 5-10 leads/mês | Mês 2-3 |

---

## DEPENDÊNCIAS TÉCNICAS

| Dependência | Status | Responsável | Prazo |
|---|---|---|---|
| Instagram API token real | ❌ Pendente | Breno | Semana 1 |
| Google Ads conta ativa | ❌ Pendente | Breno | Semana 1 |
| Meta Ads conta ativa | ❌ Pendente | Breno | Semana 1 |
| PostgreSQL schema aplicado no Supabase | ❌ Pendente | Breno | Semana 1 |
| Domínio smartops-ia.com.br + SSL | ❌ Pendente | Breno | Semana 1 |
| Formulário landing page funcionando | ❌ Pendente | Breno + Claude | Semana 1 |
| n8n workflows de lead capture | ❌ Pendente | Claude | Semana 2 |
| Bot @IAAgentesmartopsbot | ✅ Ativo | — | — |
| 26 rotinas diárias | ✅ Ativas | — | — |
| Pipeline de conteúdo | ✅ Ativo | — | — |

---

## CHECKPOINT SEMANAL

Todo domingo, responder:
1. Quantos leads entraram esta semana?
2. Quantas reuniões foram realizadas?
3. Quantas propostas foram enviadas?
4. Quantos contratos foram fechados?
5. Qual o MRR atual?
6. Qual o gargalo do funil esta semana?
7. Qual a decisão #1 para a próxima semana?

---

*Roadmap gerado pelo Strategic Planning Agent · SmartOps IA · 2026-05-30*
*Revisão automática toda segunda-feira pelo CEO Advisor Agent*
