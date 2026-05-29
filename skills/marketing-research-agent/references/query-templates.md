# Query Templates — Marketing Research Agent

## Buscas Principais (sempre executar)

```javascript
const queries = {
  trends: `Lean Six Sigma automação IA Brasil ${year} tendências crescimento mercado`,
  competitors: `consultoria Lean Six Sigma automação processos pequenas empresas concorrentes posicionamento preços`,
  audience: `problemas operacionais pequenas empresas Brasil retrabalho desperdício gargalos eficiência 2026`,
  hooks: `melhores hooks marketing consultoria processos automação pequena empresa conversão anúncio`,
  viral: `conteúdo viral melhoria contínua automação IA operações Instagram TikTok ${year}`,
};
```

## Buscas Complementares (quando relevante)

```javascript
const supplementary = {
  creators: `creators influencers Lean Six Sigma automação operações YouTube LinkedIn TikTok Brasil`,
  keywords: `palavras-chave Lean Six Sigma automação processos Brasil busca crescimento SEO`,
  social_listening: `comentários reclamações problemas operacionais gestão processos empresas Brasil`,
  market_gaps: `gaps nicho melhoria contínua automação IA Brasil oportunidades não exploradas`,
  positioning: `posicionamento premium consultoria operações IA Brasil diferenciação mercado`,
};
```

---

## 10 Capacidades de Análise

### 1. Competitor Analysis
Para cada concorrente/creator identificado, mapear:
- Posicionamento (generalista vs especialista, preço, autoridade)
- Linguagem e tom (técnico vs acessível)
- Formatos usados (reel, carrossel, post longo, YouTube)
- Conteúdos que performam (engajamento acima da média)
- **Gaps:** o que NÃO fazem que a marca pode fazer

### 2. Trend Detection
Classificar cada trend identificada:
- `emergente` — crescendo, pouco saturado (alta oportunidade)
- `estabelecida` — mainstream, competição alta
- `declinando` — momentum caindo (evitar)

### 3. Viral Content Research
Padrões de hook que viralizam no nicho:
- Afirmação contra-intuitiva + dado específico
- "X% das empresas cometem esse erro sem saber"
- POV de caos operacional (identificação imediata)
- Comparação antes/depois com número de resultado

### 4. Audience Research
| Dimensão | Insights para o nicho |
|----------|----------------------|
| Dores primárias | Retrabalho, equipe apagando incêndio, processo sem dono |
| Dores secundárias | Cliente insatisfeito, perda de receita invisível |
| Objeções | "Lean é para fábricas", "automação é cara" |
| Linguagem real | "gargalo", "apagar incêndio", "padronizar", "mapear" |
| Medos | Investir em consultoria sem resultado |

### 5. Market Gap Analysis
Perguntas-chave:
- Que problema o público tem que nenhum concorrente resolve bem?
- Que formato de conteúdo o nicho ainda não explorou?
- Que linguagem diferencia quem lidera no nicho?

Gaps típicos identificados:
- Conteúdo que combina Lean + IA (a maioria faz um OU outro)
- Casos reais de pequenas empresas (a maioria foca em grandes)
- Conteúdo em português com profundidade técnica real

### 6. Content Opportunity Engine
Para cada oportunidade, especificar:
```
Tema: [tópico específico]
Formato ideal: [reel / carrossel / post / vídeo]
Canal prioritário: [Instagram / LinkedIn / YouTube]
Potencial: [viral / autoridade / educativo / conversão]
Hook sugerido: [primeira linha do conteúdo]
```

### 7. Search Intelligence (Keywords)
| Categoria | Exemplos |
|-----------|---------|
| Metodologias | Lean Six Sigma, DMAIC, BPM, Process Mining, Kaizen |
| Problemas | retrabalho, gargalo, desperdício, processo ineficiente |
| Soluções | automação de processos, melhoria contínua, padronização |
| Ferramentas | n8n, WhatsApp Business API, Claude Code |
| Resultados | redução de custos, eficiência operacional, produtividade |

### 8. Social Listening
O que escutar:
- Comentários em posts de concorrentes sobre problemas operacionais
- Perguntas em grupos de LinkedIn e Facebook de gestão
- Reclamações em comunidades de empresários brasileiros
- Termos exatos que o público usa para descrever seus problemas

### 9. Creator Intelligence
Para cada creator relevante, analisar:
- Formato dos conteúdos com maior engajamento
- Estrutura de storytelling
- Frequência e consistência
- CTAs que geram mais comentários/salvamentos

### 10. Positioning Intelligence
Matriz rápida de posicionamento:
| Dimensão | Mercado atual | Oportunidade |
|----------|--------------|-------------|
| Especialização | Generalistas dominam | Especialista Lean + IA para PMEs |
| Formato de entrega | Cursos online | Projeto com resultado fechado |
| Linguagem | Técnica e distante | Direta, com número e prova real |
| Proof | Teórica | Cases reais com prazo e número |

---

## Defaults de Fallback (brand_defaults)

Usar quando Tavily falha:

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
    "youtube": "Quarta–Sábado, 14h–17h BRT",
    "threads": "Dias úteis, 8h–10h BRT",
    "linkedin": "Terça–Quinta, 7h–9h BRT"
  }
}
```
