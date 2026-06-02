# Output Schema — Marketing Research Agent Enterprise v2.0.0

Todos os formatos de saída produzidos pelos 41 modos do agente.

---

## 1. research_results.json (pipeline `run_auto.js`)

```json
{
  "task_name": "string",
  "date": "YYYY-MM-DD",
  "data_source": "tavily | brand_defaults",
  "product": "string",
  "services": ["Lean Six Sigma", "Automação com IA"],
  "target_audience": "string",
  "campaign_focus": "string",
  "content_topics": ["string"],
  "marketing_angles": ["string"],
  "keywords": ["string"],
  "ad_hooks": ["string"],
  "video_ideas": ["string"],
  "competitor_gaps": ["string"],
  "content_opportunities": [
    {
      "tema": "string",
      "formato": "carrossel | reel | post | video",
      "canal": "Instagram | LinkedIn | YouTube",
      "potencial": "viral | autoridade | educativo | conversão",
      "hook": "string"
    }
  ],
  "audience_pain_points": {
    "primarias": ["string"],
    "secundarias": ["string"],
    "linguagem_real": ["string"]
  },
  "trending_topics": [
    { "tema": "string", "status": "emergente | estabelecida | declinando | modinha", "canal_prioritario": "string" }
  ],
  "trending_windows": {
    "instagram": "string", "youtube": "string", "threads": "string", "linkedin": "string"
  },
  "positioning_recommendations": {
    "diferencial_principal": "string", "tom_sugerido": "string", "angulo_autoridade": "string"
  },
  "confidence_score": { "nota": 0, "classificacao": "Alta | Boa | Moderada | Baixa" },
  "raw_summary": {
    "trends": "string", "competitors": "string", "audience": "string", "hooks": "string", "viral": "string"
  }
}
```

---

## 2. Modos de Pesquisa Direta

### `trends` → `reports/trends_YYYY-MM-DD.md`
```
# TRENDS RESEARCH REPORT
## Score de Confiança (nota/100 + classificação A-D)
## Matriz de Triangulação (mercado / cliente / concorrente)
## Tendências Identificadas (máximo 5)
  - Classificação: Forte/Emergente/Saturada/Modinha/Fraca
  - Tipo de informação: Fato/Sinal/Tendência/Hipótese
  - Evidência, Força (1-10), Oportunidade, Risco, Prioridade, Ação
## Score de Tendência (critérios 0-10)
## Oportunidade Principal
## Ideias (tabela: Tipo / Tema / Canal / Gancho / Prioridade)
## Red Flags
## Handoff
```

### `competitors` → `reports/competitors_YYYY-MM-DD.md`
```
# ANÁLISE COMPETITIVA
## Análise por Concorrente (Posicionamento/Proposta/Forças/Fraquezas/Lacunas)
## Matriz Competitiva (tabela completa)
## Lacunas de Mercado
## Oportunidades de Diferenciação
## Posicionamento Recomendado
## Mensagens a Evitar
## Ações P1/P2/P3
```

### `audience` → `reports/audience_YYYY-MM-DD.md`
```
# AUDIENCE INTELLIGENCE REPORT
## Perfil Detalhado
## Mapa de Dores (superficiais / profundas / financeiras)
## Mapa de Desejos
## Mapa de Objeções (com resposta SmartOps)
## Frases Reais do Público (20)
## Gatilhos de Compra
## Jornada do Cliente (5 estágios)
## Mensagens por Canal
```

### `validate` → `reports/validation_timestamp.md`
```
# VALIDAÇÃO DE IDEIA
## Ideia
## Veredito: Forte/Promissora/Incerta/Fraca/Arriscada
## Score de Oportunidade (/100) com breakdown
## Score de Confiança (/100)
## Análise de Demanda
## Público Provável
## Concorrência
## Riscos Principais
## Teste Mínimo
## Critério Para Avançar / Parar
## Próxima Ação
```

### `brief` → `briefs/research_brief_YYYY-MM-DD.md`
```
# Research Brief Enterprise
## Objetivo / Premissas
## Resumo Executivo
## Score de Confiança
## Principais Descobertas
## Evidências (tabela: Evidência/Tipo/Fonte/Confiança A-D)
## Tendências (tabela)
## Público e Comportamento
## Concorrentes (tabela)
## Oportunidades (tabela com score)
## Riscos (tabela)
## Recomendações P1/P2/P3
## Ideias de Conteúdo (tabela)
## Ideias de Campanha (tabela)
## Próximos Testes (tabela)
## Handoff Para Agentes
## Fontes Consultadas
## Conclusão
```

### `deep` → `reports/deep_research_YYYY-MM-DD.md`
```
# Deep Research Report (formato brief + análise de mercado + estratégia de entrada + plano de validação)
```

---

## 3. Modos de Suporte

### `voice` → `reports/voice_customer_YYYY-MM-DD.md`
```
# VOZ DO CLIENTE
## Dores mais repetidas
## Frases reais ou adaptadas (lista com aspas)
## Desejos, Objeções, Expectativas não atendidas
## Linguagem que usar / evitar
## Promessas que podem funcionar
## Gatilhos de decisão
## Handoff (Ads/Content/Sales)
```

### `gaps` → `reports/market_gaps_YYYY-MM-DD.md`
```
# LACUNAS DE MERCADO
## Por lacuna: Tipo / Evidência / Concorrentes afetados / Oportunidade / Oferta / Mensagem / Prioridade
## Matriz de Lacunas (tabela)
## Oportunidade de Diferenciação
```

### `trend-eval` → `reports/trend_eval_YYYY-MM-DD.md`
```
# AVALIAÇÃO DE TENDÊNCIA
## Classificação: Tendência Saudável / Sinal Emergente / Modinha / Ruído / Saturada
## Evidências / Critérios (tabela Sim/Não)
## Risco de Saturação
## Como usar sem copiar
```

---

## 4. Briefs Para Outros Agentes

### `content-brief` → `briefs/content_brief_YYYY-MM-DD.md`
```
# BRIEFING PARA CONTENT AGENT
## Tema Central / Cluster / Intenção
## Ideias por Canal (tabela: Tema/Canal/Formato/Gancho/CTA)
## Perguntas frequentes do público
## Conteúdos de fundo de funil
## Série de conteúdo
## Entregáveis esperados
```

### `ads-brief` → `briefs/ads_brief_YYYY-MM-DD.md`
```
# BRIEFING PARA ADS AGENT
## Público / Dor / Desejo / Promessa
## Ângulos de Criativo (1/2/3)
## Objeções para quebrar
## Ganchos (3)
## CTA / Canais / Métricas
## Entregáveis (criativos/copies/públicos)
```

### `seo-brief` → `briefs/seo_brief_YYYY-MM-DD.md`
```
# BRIEFING PARA SEO AGENT
## Tema / Intenção de Busca
## Clusters (com satélites)
## Perguntas frequentes
## Páginas Pilar / Satélites
## Oportunidades de keyword (tabela)
```

### `sales-brief` → `briefs/sales_brief_YYYY-MM-DD.md`
```
# BRIEFING PARA SALES AGENT
## Objeções (tabela com resposta)
## Argumentos comerciais
## Perguntas de diagnóstico
## Gatilhos de decisão
## Proposta de valor
## Script inicial
```

### `lean-brief` → `briefs/lean_brief_YYYY-MM-DD.md`
```
# BRIEFING PARA LEAN CONSULTING AGENT
## Problemas operacionais / 8 desperdícios
## Processos críticos / Automações possíveis
## Oferta recomendada / Perguntas para diagnóstico
```

---

## 5. Modos Operacionais

### `sector` → `reports/sector_SETOR_YYYY-MM-DD.md`
### `local` → `reports/local_YYYY-MM-DD.md`
### `pricing` → `reports/pricing_YYYY-MM-DD.md`
### `channels` → `reports/channels_YYYY-MM-DD.md`
### `message` → `reports/message_YYYY-MM-DD.md`
### `offer` → `reports/offer_research_YYYY-MM-DD.md`

---

## 6. Monitoramento Contínuo

### `radar` → `reports/radar_YYYY-MM-DD.md`
```
# RADAR DE MERCADO
## Principais Sinais (top 5)
## O que Mudou / O que permanece igual
## Oportunidades / Riscos emergentes
## Agentes acionados (tabela)
## Ações P1/P2/P3
```

### `weekly` → `reports/weekly_intel_YYYY-MM-DD.md`
```
# RELATÓRIO SEMANAL DE INTELIGÊNCIA
## Tendências da semana (tabela)
## Concorrentes em movimento (tabela)
## Conteúdos em alta (tabela)
## Dores do público / Oportunidades / Riscos
## Recomendações P1/P2/P3
## Handoff (tabela)
```

### `alert` → `reports/alert_timestamp.md`
### `hypothesis` → `reports/hypothesis_timestamp.md`

---

## 7. Análise Comparativa e Estratégica

### `niche-compare` → `reports/niche_compare_YYYY-MM-DD.md`
### `intel-map` → `reports/intel_map_YYYY-MM-DD.md`
### `proposal-intel` → `briefs/proposal_intel_YYYY-MM-DD.md`
### `diagnostic` → `briefs/diagnostic_YYYY-MM-DD.md`
### `sprint` → `reports/sprint_timestamp.md`
### `executive` → `reports/executive_timestamp.md`

---

## 8. Documentação Estratégica (Camada 4)

### `decision-memo` → `briefs/decision_memo_timestamp.md`
```
# DECISION MEMO
## Decisão / Contexto / Opções
## Análise / Evidências (tabela com triangulação)
## Nível de Evidência / Matriz de Triangulação
## Recomendação / Riscos / Teste / Critérios
## Próxima Ação
```

### `market-map` → `reports/market_map_YYYY-MM-DD.md`
```
# MARKET MAP
## Mercado / Segmentos / Públicos
## Concorrentes (tabela)
## Canais / Dores / Tendências (tabela)
## Oportunidades (tabela com score)
## Riscos (tabela)
## Oportunidade principal / Próxima ação
```

### `test-plan` → `briefs/test_plan_timestamp.md`
```
# PLANO DE TESTE
## Hipótese / Objetivo / Público
## Teste (tipo/como/canal/custo/duração)
## Entregável / Métrica / Volume mínimo
## Critério de Sucesso / Parada / Investimento
## Próxima ação (se confirmar / se falhar)
```

### `handoff-brief` → `briefs/handoff_AGENTE_timestamp.md`
```
# HANDOFF BRIEF
## Pesquisa Base / Agente Destino / Objetivo
## Insights (top 5) / Público / Oportunidade / Riscos
## Entregável esperado / Mensagem principal / Métricas
```

---

## 9. Produtização (Camada 5)

### `client-report` → `reports/client_report_CLIENTE_YYYY-MM-DD.md`
```
# RELATÓRIO DE INTELIGÊNCIA DE MERCADO (formato executivo premium)
## Capa / Sumário Executivo / Objetivo / Premissas
## Principais Descobertas / Público / Concorrentes / Tendências
## Oportunidades / Riscos / Recomendação / Plano de Teste
## Próximos Passos (com responsável e prazo)
```

### `niche-study` → `reports/niche_study_NICHO_YYYY-MM-DD.md`
### `research-to-offer` → `briefs/research_to_offer_timestamp.md`
### `research-to-content` → `briefs/research_to_content_timestamp.md`
### `research-to-campaign` → `briefs/research_to_campaign_timestamp.md`
### `dashboard` → `reports/dashboard_YYYY-MM-DD.md`

---

## 10. Modo HTML

### `html-report` → `reports/interactive_report_YYYY-MM-DD.html`
```
Tema escuro SmartOps IA:
  Background: #0A0A0F | Card: #0B0F17 | Border: #1F2937
  Accent Lean: #7C3AED | Accent Automação: #10B981
  Fonts: Bebas Neue (headline) + Inter (body)

Seções: Cards de resumo + Tendências + Chart.js + Oportunidades + Concorrentes + Ações
```
