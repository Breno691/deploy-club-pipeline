# SmartOps IA — Diretório de Agentes
*Sistema de memória e histórico persistente para os 35+ agentes*

---

## Estrutura de cada agente

```
agents/<agent-id>/
├── profile.md          ← quem é, KPIs, limites, metas, alertas
├── current_state.json  ← último estado (atualizado a cada execução)
└── history/
    ├── 2026-05-30.json ← todas as sessões do dia (array)
    ├── 2026-05-31.json
    └── ...
```

---

## Como ver o histórico de um agente

```bash
# Histórico dos últimos 7 dias
node scripts/agent_logger.js --history ads-agent

# Últimos 30 dias
node scripts/agent_logger.js --history revenue-agent --days 30

# Estado atual de todos os agentes
node scripts/agent_logger.js --all
```

---

## Como integrar o logger em qualquer script de agente

```javascript
const AgentLogger = require('./scripts/agent_logger');

const log = new AgentLogger('ads-agent');
log.start();

// O que observou
log.observe(['CPA atual: R$72', 'CTR: 2.1%', 'Frequência público #3: 3.8']);

// O que pensou
log.think(['CPA acima da meta de R$60 — hipótese: criativo fatigado no conjunto #2']);

// O que decidiu
log.decide(['Pausar anúncio #4 (CTR 0.9%, frequência 3.8)', 'Briefing enviado ao Copywriter']);

// O que executou
log.execute(['Pausa executada via API Google Ads 09:14', 'Email de briefing enviado ao Copywriter']);

// Alertas
log.alert('CTR criativo #4 caiu 18% — fadiga criativa', 'warning');
log.alert('Budget esgotou às 16h — over-pacing', 'critical');

// KPIs da sessão
log.setKPIs({ cpa: 72, ctr: 2.1, leads_gerados: 3, roas: 3.2 });

// Finaliza
log.finish(
  'Pausa do anúncio #4 executada. Aguardando novo criativo do Copywriter.',
  'Receber variação de criativo e reativar conjunto às 18h'
);
```

---

## Agentes registrados

| Agente | Cargo | Autonomia | KPI Mestre |
|---|---|---|---|
| [ads-agent](ads-agent/) | Diretor de Mídia Paga | Alta | CPA ≤ R$60 |
| [website-analytics-agent](website-analytics-agent/) | Diretor de Analytics | Média | Conversão ≥ 5% |
| [cro-agent](cro-agent/) | Diretor de Conversão | Alta | CTR ≥ 3.5% |
| [sales-intelligence-agent](sales-intelligence-agent/) | Diretor Comercial | Média | Reunião→Proposta ≥ 40% |
| [proposal-agent](proposal-agent/) | Diretor de Propostas | Média | Proposta→Contrato ≥ 60% |
| [lead-scoring-agent](lead-scoring-agent/) | Diretor de Qualificação | Alta | A+ identificado < 15min |
| [copywriter-agent](copywriter-agent/) | Diretor de Comunicação | Alta | CTR ads ≥ 2.5% |
| [personal-brand-agent](personal-brand-agent/) | Diretor de Marca Pessoal | Média | +500 seguidores/mês |
| [offer-optimization-agent](offer-optimization-agent/) | Diretor de Ofertas | Baixa | Ticket médio +10%/mês |
| [revenue-agent](revenue-agent/) | Chief Revenue Intelligence | Média | MRR crescente |
| [ceo-advisor-agent](ceo-advisor-agent/) | CEO Virtual | Alta | Receita mensal crescente |
| [financial-intelligence-agent](financial-intelligence-agent/) | Diretor Financeiro | Média | Margem ≥ 60% |
| [client-success-agent](client-success-agent/) | Diretor de Sucesso do Cliente | Média | NPS ≥ 9 |
| [lean-agent](lean-agent/) | Diretor Lean | Média | Economia gerada (R$) |
| [six-sigma-agent](six-sigma-agent/) | Diretor de Qualidade | Média | Sigma Level crescente |

---

## Formato do arquivo de histórico diário

```json
[
  {
    "session_id": "ads-agent-1748606400000",
    "agent": "ads-agent",
    "date": "2026-05-30",
    "started_at": "2026-05-30T08:00:00.000Z",
    "finished_at": "2026-05-30T08:04:32.000Z",
    "status": "completed",
    "observed": [
      { "ts": "...", "data": "CPA atual: R$72" }
    ],
    "thoughts": [
      { "ts": "...", "thought": "CPA acima da meta — hipótese: criativo fatigado" }
    ],
    "decisions": [
      { "ts": "...", "decision": "Pausar anúncio #4" }
    ],
    "executed": [
      { "ts": "...", "action": "Pausa executada via API Google Ads" }
    ],
    "alerts": [
      { "ts": "...", "level": "warning", "message": "CTR caiu 18%" }
    ],
    "kpis": { "cpa": 72, "ctr": 2.1, "leads_gerados": 3 },
    "next_action": "Receber criativo novo do Copywriter às 18h",
    "summary": "Pausa executada. Aguardando variação de criativo."
  }
]
```

---

## Referências

- Definições nível diretor: [DIRETORES.md](../DIRETORES.md)
- Logger compartilhado: [scripts/agent_logger.js](../scripts/agent_logger.js)
- Skill files: [skills/](../skills/)
