# Query Templates — Marketing Research Agent Enterprise v2.0.0

## Queries do Pipeline Principal (run_auto.js)

```javascript
const pipelineQueries = {
  trends:      `Lean Six Sigma automação IA Brasil ${year} tendências crescimento PME`,
  competitors: `consultoria Lean automação processos pequenas empresas posicionamento preços`,
  audience:    `problemas operacionais pequenas empresas Brasil retrabalho desperdício gargalos`,
  hooks:       `hooks marketing consultoria processos automação conversão anúncio 2026`,
  viral:       `conteúdo viral melhoria contínua automação IA Instagram TikTok ${year}`,
};
```

---

## Queries Por Modo

### `trends` — Tendências
```javascript
[
  `${topic} tendências ${year} Brasil PME dados crescimento`,
  `${topic} market growth small business ${year}`,
  `${topic} oportunidade mercado futuro`,
  `${topic} comportamento consumidor mudança recente`,
]
```

### `competitors` — Análise Competitiva
```javascript
[
  `consultoria lean automação pequenas empresas Brasil posicionamento`,
  `automação processos PME preços concorrentes reviews`,
  `lean six sigma consultoria BH posicionamento diferencial`,
  `${concorrente} reclamações reviews pontos fracos`,
]
```

### `audience` — Público
```javascript
[
  `problemas dores gestores donos PME Brasil operações`,
  `pequenas empresas reclamações processos retrabalho`,
  `gestor PME 2026 desafios tecnologia automação`,
  `dono pequena empresa BH dificuldades crescimento`,
]
```

### `validate` — Validação de Ideia
```javascript
[
  `${ideia} mercado demanda Brasil validação`,
  `${ideia} concorrentes reviews quem já faz`,
  `${ideia} público-alvo dores problemas`,
]
```

### `deep` — Deep Research
```javascript
[
  `${topic} Brasil ${year} mercado análise`,
  `${topic} público comportamento dores`,
  `${topic} concorrentes análise posicionamento`,
  `${topic} tendências futuro crescimento`,
]
```

### `voice` — Voz do Cliente
```javascript
[
  `${topic} reclamações reviews problemas clientes`,
  `${topic} fórum comentários dúvidas opiniões`,
  `${topic} Reclame Aqui problemas frequentes`,
]
```

### `sector` — Pesquisa Setorial
```javascript
[
  `${setor} problemas gestão processos Brasil PME`,
  `${setor} automação oportunidade gestores`,
  `${setor} dores proprietários empresários reclamações`,
]
```

### `radar` — Radar de Mercado
```javascript
[
  `${topic} novidades semana tendências recentes`,
  `${topic} mudanças mercado concorrentes novos`,
  `lean automação IA PME Brasil novidades`,
]
```

### `weekly` — Relatório Semanal
```javascript
[
  `lean automação IA PME Brasil tendências semana`,
  `consultoria processos pequenas empresas novidades`,
  `automação n8n IA negócios novidades recentes`,
]
```

### `niche-study` — Estudo de Nicho
```javascript
[
  `${nicho} problemas gestão processos automação`,
  `${nicho} dores gestores empresários reclamações`,
  `${nicho} oportunidades consultoria lean`,
]
```

### `pricing` — Precificação
```javascript
[
  `${servico} preço consultoria custo Brasil`,
  `${servico} quanto custa mercado referência`,
]
```

### `client-report` — Relatório Para Cliente
```javascript
[
  `${topic} mercado tendências ${year}`,
  `${topic} concorrentes análise posicionamento`,
]
```

---

## Buscas Complementares (quando relevante)

```javascript
const supplementary = {
  creators:        `creators influencers Lean automação processos YouTube LinkedIn TikTok Brasil`,
  keywords:        `palavras-chave Lean automação processos Brasil SEO crescimento`,
  social_listening:`comentários reclamações problemas operacionais gestão PME Brasil`,
  market_gaps:     `gaps nicho automação IA Brasil oportunidades não exploradas`,
  positioning:     `posicionamento premium consultoria operações IA Brasil diferenciação`,
  reclame_aqui:    `${concorrente} Reclame Aqui reclamações`,
  ads_library:     `anúncios consultoria lean automação meta ads`,
};
```

---

## Modificadores de Query (melhoram relevância)

| Modificador | Quando usar |
|---|---|
| `Brasil ${year}` | Sempre para dados locais recentes |
| `PME pequenas empresas` | Quando o foco é SMB |
| `BH Belo Horizonte` | Quando é pesquisa local |
| `reclamações reviews` | Quando busca voz do cliente |
| `preço custo` | Quando busca dados de precificação |
| `tendência crescimento` | Quando busca oportunidade |
| `concorrentes análise` | Quando busca posicionamento |
| `automação processos` | Foco SmartOps em automação |
| `lean seis sigma` | Foco SmartOps em metodologia |

---

## Fallback — brand_defaults (quando Tavily falha)

```json
{
  "marketing_angles": [
    "O processo está quebrado — não a equipe",
    "Automatizar processo ruim só faz errar mais rápido",
    "Em 4 semanas, de equipe apagando incêndio para processo padronizado"
  ],
  "ad_hooks": [
    "Equipe apagando incêndio todo dia não é falta de esforço. É processo quebrado.",
    "Automatizou sem mapear o processo? Acabou de automatizar o erro.",
    "Em 4 semanas o retrabalho foi eliminado. 3 meses de tentativa não resolveram."
  ],
  "trending_windows": {
    "instagram": "Terça–Quinta, 7h–9h BRT ou 12h–13h BRT",
    "youtube":   "Quarta–Sábado, 14h–17h BRT",
    "threads":   "Dias úteis, 8h–10h BRT",
    "linkedin":  "Terça–Quinta, 7h–9h BRT"
  },
  "confidence_score": { "nota": 45, "classificacao": "Baixa — sem dados externos" }
}
```
