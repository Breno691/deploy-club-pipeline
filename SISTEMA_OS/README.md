# SISTEMA OS — SmartOps IA
## Sistema Operacional de Consultoria Autônoma
*Versão: 2026-05-30 | 35 Agentes | 10 Squads | 26 Rotinas Diárias*

---

> **De uma lista de prompts para uma empresa operando por IA.**

---

## Arquivos do Sistema

| # | Arquivo | Conteúdo | Status |
|---|---|---|---|
| 01 | [01_PROMPTS_AGENTES.md](01_PROMPTS_AGENTES.md) | Prompts completos + Ferramentas + Memórias + Gatilhos (35 agentes) | ✅ |
| 02 | [02_WORKFLOWS_COLABORACAO.md](02_WORKFLOWS_COLABORACAO.md) | 12 Workflows n8n + Autonomia + Matriz de Colaboração | ✅ |
| 03 | [03_SCHEMA_BANCO.sql](03_SCHEMA_BANCO.sql) | Schema PostgreSQL completo (15 camadas, 35+ tabelas) | ✅ |
| 04 | [04_ARQUITETURA_LANGGRAPH.py](04_ARQUITETURA_LANGGRAPH.py) | Orquestração LangGraph — grafo de agentes + estado compartilhado | ✅ |
| 05 | [05_ROADMAP_ROI.md](05_ROADMAP_ROI.md) | Roadmap por ROI — R$0 → R$50k MRR em 90 dias | ✅ |

---

## O que este sistema entrega

```
ENTRADA: Trigger (schedule / webhook / evento de outro agente)
   ↓
ORQUESTRAÇÃO: LangGraph seleciona agente + carrega memória
   ↓
EXECUÇÃO: Agente analisa, decide e age com suas ferramentas
   ↓
COLABORAÇÃO: Agente notifica outros agentes via tickets/mensagens
   ↓
CONSOLIDAÇÃO: CEO Advisor prioriza e entrega briefing ao Breno
   ↓
SAÍDA: Telegram @IAAgentesmartopsbot + Dashboard + Banco de dados
```

---

## Referências externas

| Documento | Localização |
|---|---|
| Definições dos 10 agentes críticos | [../DIRETORES.md](../DIRETORES.md) |
| Definições dos 25 agentes complementares | [../DIRETORES_PARTE2.md](../DIRETORES_PARTE2.md) |
| Perfis individuais dos agentes | [../agents/](../agents/) |
| Histórico de execução | [../agents/*/history/](../agents/) |
| Skill files dos agentes | [../skills/](../skills/) |
| Rotinas remotas ativas | https://claude.ai/code/routines |

---

## Deploy em produção

### 1. Banco de dados
```bash
psql $DATABASE_URL -f SISTEMA_OS/03_SCHEMA_BANCO.sql
```

### 2. Dependências Python
```bash
pip install langgraph langchain-anthropic psycopg2-binary tavily-python
```

### 3. Variáveis de ambiente necessárias
```env
ANTHROPIC_API_KEY=...
DATABASE_URL=postgresql://...
TAVILY_API_KEY=...
TELEGRAM_AGENT_BOT_TOKEN=...
TELEGRAM_AGENT_CHAT_ID=1349738505
```

### 4. Executar agente específico
```bash
python SISTEMA_OS/04_ARQUITETURA_LANGGRAPH.py ads-agent
```

### 5. Executar onda completa
```bash
python SISTEMA_OS/04_ARQUITETURA_LANGGRAPH.py wave_1_5h
```

---

## Próximos passos (Fase 0 — esta semana)

- [ ] Aplicar `03_SCHEMA_BANCO.sql` no Supabase
- [ ] Configurar `DATABASE_URL` no .env
- [ ] Instalar dependências Python
- [ ] Testar 1 agente manualmente: `python 04_ARQUITETURA_LANGGRAPH.py ads-agent`
- [ ] Configurar Google Ads + Meta Ads (ver `05_ROADMAP_ROI.md`)
- [ ] Obter token real do Instagram API

---

*SmartOps IA · Breno Luiz · Black Belt Lean Six Sigma · BH, MG*
