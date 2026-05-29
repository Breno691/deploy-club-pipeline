---
name: video-ad-specialist
description: >
  Performance creative specialist para Meta Ads, TikTok Ads, YouTube Ads, VSL e UGC.
  Cria scene JSON Remotion-compatível com hooks extremos, scripts de alta conversão e
  variações A/B para campanhas de Lean, Six Sigma e automação operacional. SEMPRE use
  quando: "criar video ad", "script de ad", "Meta Ads", "TikTok Ads", "YouTube Ads",
  "VSL", "UGC ad", "hook para anúncio", "criativo de conversão", "retargeting ad",
  "variações A/B", "performance marketing", "video_ad_specialist job". Do NOT use for
  rendering (remotion-best-practices faz isso automaticamente). Do NOT use for
  Manutenção TI. Outputs: video/ad_scenes.json → dispara remotion imediatamente.
metadata:
  author: Deploy Club / SmartOps IA
  version: 2.0.0
  category: performance-creative
  tags: [video-ads, meta-ads, tiktok, youtube, vsl, hooks, conversion, lean, automacao]
---

# Video Ad Specialist — Performance Creative

Cria anúncios cinematográficos, persuasivos e escaláveis. Nenhum ad genérico — cada criativo é orientado a CTR, retenção e conversão.

## Pipeline Position
- Roda **APÓS**: `marketing-research-agent`
- Dispara **automaticamente**: `remotion-best-practices` após salvar JSON
- Depende de: `research_results.json`, knowledge files
- Produz: `video/ad_scenes.json`

---

## Step 1: Carregar Contexto
1. `knowledge/brand_identity.md` → cores, tom, audiência
2. `knowledge/product_campaign.md` → serviços, métricas, depoimentos
3. `research_results.json` → `marketing_angles`, `ad_hooks`, `video_ideas`

## Step 2: Selecionar Estratégia e Tipo de Ad

| Estratégia | Quando usar |
|-----------|-------------|
| `problem_solution` | Dor → alívio (default) |
| `product_showcase` | Destacar features do produto |
| `testimonial` | Prova social com resultado real |
| `authority` | Posicionamento + credenciais |
| `educational` | Educar convertendo |
| `ugc_style` | Parecer orgânico, testemunho direto |
| `comparison` | Antes vs depois, com vs sem processo |

Tipos de ad: Hook ad · Direct response · Educational · Authority · UGC · Retargeting · VSL curta (90–180s) · VSL longa.
Detalhes de estrutura por tipo em `references/ad-templates.md`.

## Step 3: Pacing por Plataforma

| Plataforma | Estrutura | Duração |
|-----------|-----------|---------|
| **Meta / Instagram Reels** | Hook → Problema → Solução → CTA | 12–30s |
| **TikTok** | Hook extremo → Payoff → Prova → CTA | 10–15s |
| **YouTube (skippable)** | Hook nos 5s → Construção → CTA | 15–30s |
| **YouTube Shorts** | Hook → Contexto → Solução → CTA | 30–60s |
| **VSL curta** | Hook → Problema → Consequência → Solução → Oferta | 90–180s |
| **Retargeting** | Lembrete do problema → Prova social → CTA urgente | 15–20s |

**Regra crítica YouTube:** tudo de valor nos primeiros 5s (botão "pular" aparece em 5s).

## Step 4: Hook Engine

Os primeiros 3s decidem tudo. Gerar 3 variações:
- **V1 — Identificação:** "Equipe apagando incêndio todo dia?" *(dor compartilhada)*
- **V2 — Dado:** "Sua empresa perde 30% da receita em retrabalho." *(número chocante)*
- **V3 — Provocação:** "Você acha que sua empresa é eficiente?" *(desafio direto)*

Hook deve funcionar **sem áudio** (legendado). Máximo 7 palavras na primeira frase.
Biblioteca completa de hooks em `references/hooks-library.md`.

## Step 5: Gerar Scene JSON

> `visual` = hint humano. Remotion usa apenas: `type`, `text`, `duration`, `subtext`, `quote`, `price`, `sideA`, `sideB`.

```json
{
  "composition": "AdVideo",
  "props": {
    "style": "problem_solution",
    "duration": 15,
    "platform": "instagram_reels",
    "service": "lean_six_sigma",
    "scenes": [
      { "type": "hook", "text": "Equipe apagando incêndio todo dia?", "visual": "[HINT: caos, mensagens vermelhas]", "duration": 3 },
      { "type": "problem", "text": "Não é falta de esforço. É processo quebrado.", "visual": "[HINT: relógio girando]", "duration": 4 },
      { "type": "product", "text": "DMAIC identifica a causa raiz. 4 semanas.", "visual": "[HINT: DMAIC boxes animados]", "duration": 5 },
      { "type": "cta", "text": "Diagnóstico Grátis.", "subtext": "30 min · smartops-ia.com.br", "duration": 3 }
    ]
  }
}
```

**Tipos válidos:** `hook` · `problem` · `product` · `benefit` · `testimonial` · `offer` · `cta` · `comparison` · `before_after`

## Step 6: Psicologia de Conversão
Aplicar gatilhos por cena: **dor** (hook/problem) · **contraste** (problem→solution) · **autoridade** (product/testimonial) · **prova social** (testimonial) · **urgência** (offer/cta) · **especificidade** (sempre incluir número).

## Step 7: Multi-Platform
```json
"platform_versions": {
  "instagram_reels": { "duration": 15 },
  "youtube_shorts": { "duration": 45, "note": "expandir product +10s" },
  "tiktok": { "duration": 12, "note": "remover cena product, ir direto ao CTA" }
}
```

## Step 8: Salvar e Disparar Remotion
```
outputs/<task_name>_<date>/video/ad_scenes.json
```
Invocar `remotion-best-practices` **imediatamente**. Sem aguardar confirmação.

---

## Troubleshooting
- **Ad genérico:** usar PAS — nomear a dor exata, ampliar consequência, revelar solução com número
- **CTR baixo:** testar as 3 variações de hook (identificação / dado / provocação)
- **CTA fraco:** verbo de ação + benefício específico + baixa fricção ("Chame no WhatsApp para diagnóstico de 30 minutos")

## Quality Checklist
- [ ] Serviço: lean_six_sigma OU automacao_ia (nunca manutencao_ti)
- [ ] Estratégia e tipo de ad selecionados
- [ ] Pacing correto para a plataforma
- [ ] Hook para o scroll em ≤3s
- [ ] 3 variações de hook geradas
- [ ] `visual` marcado como `[HINT: ...]`
- [ ] Todos os campos obrigatórios presentes
- [ ] `ad_scenes.json` salvo no path correto
- [ ] `remotion-best-practices` disparado imediatamente
