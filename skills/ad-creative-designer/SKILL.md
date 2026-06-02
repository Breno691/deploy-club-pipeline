---
name: ad-creative-designer
description: >
  Gera criativos de imagem estática para campanhas SmartOps IA (Lean Six Sigma e
  Automação com IA — nunca Manutenção TI). SEMPRE use quando: "criar criativo",
  "fazer ad de imagem", "gerar anúncio para Instagram", "design de ad", "layout do anúncio",
  "criar carrossel", "conceito visual", "criar UGC", "auditar criativo", "criar brief visual",
  "create image ad", "design a static ad", "generate ad creative", quando o pipeline executa
  o job ad_creative_designer, ou quando há research_results.json disponível para ad.
metadata:
  author: Deploy Club / SmartOps IA
  version: 2.0.0
  category: creative-design
  tags: [criativo, ad, imagem, layout, carrossel, ugc, design, instagram, visual]
---

# AD CREATIVE DESIGNER

## ROLE

Especialista em design e direção criativa de anúncios estáticos para SmartOps IA — gera briefings visuais, layouts HTML, conceitos criativos e especificações para produção.

## MISSION

Transformar pesquisa de mercado e hooks de copy em criativos visuais de alta conversão — dark theme SmartOps IA, métricas reais, CTA claro, identidade consistente.

## PIPELINE POSITION

- Roda **APÓS**: `scripts/research.js` (usa research_results.json)
- Roda **ANTES**: `scripts/render_ad.js` (renderiza o HTML em PNG)
- Produz: `ads/layout.json` + `ads/ad.html` + `ads/styles.css`
- PNG final: `ads/instagram_ad.png` (1080×1080)

---

## MODOS DO AGENTE

Execute: `node agents/ad-creative-designer-agent/ad_creative_designer_agent.js --mode <modo>`

| Modo | Descrição | Argumento |
|---|---|---|
| `brief` | Briefing criativo completo para o time de design | `--formato carrossel\|stories\|square` |
| `layout` | Especificação técnica de layout JSON + HTML | `--formato carrossel\|stories\|square` |
| `conceito` | Conceito criativo com ângulo, narrativa e CTA | `--angulo dor\|resultado\|prova` |
| `carousel` | Carrossel completo com slides estruturados | `--slides 5\|6\|7` |
| `ugc` | Script e conceito UGC (user-generated content) | `--perfil "dono de industria"` |
| `audit` | Auditoria de criativo existente contra brand guidelines | — |
| `report` | Relatório de performance criativa e recomendações | — |

---

## IDENTIDADE VISUAL SmartOps IA

| Token | Valor |
|---|---|
| Background | `#0A0A0F` |
| Card | `#0B0F17` |
| Border | `#1F2937` |
| Accent Lean | `#7C3AED` (roxo) |
| Accent Automação | `#10B981` (verde) |
| Headline font | Bebas Neue |
| Body font | Inter |
| CTA WhatsApp | `#25D366` |

### Esquema por serviço
| Serviço | Accent | Light |
|---|---|---|
| Lean Six Sigma | `#7C3AED` | `#a78bfa` |
| Automação com IA | `#10B981` | `#6ee7b7` |
| Brand geral | `#7C3AED` | `#a78bfa` |

---

## TEMPLATES

| Template | Quando usar |
|---|---|
| `lean_focus` | Ads de Lean Six Sigma — process flow, before/after, métricas |
| `automation_focus` | Ads de Automação — WhatsApp, bot, dashboard, n8n |
| `proof_card` | Depoimentos, resultados, case studies |
| `hook_card` | Hook de dor forte — frase impactante em destaque |
| `metric_card` | Resultado numérico em evidência (−30% custo, 4 semanas) |

---

## PROCESSO PIPELINE

### Step 1: Ler Contexto
```
knowledge/brand_identity.md      → cores, fontes, tom
knowledge/product_campaign.md    → serviços, selling points, métricas
knowledge/visual_references.md   → padrões visuais, exemplos
research_results.json            → hooks, ângulos, keywords (se disponível)
```

### Step 2: `scripts/generate_ad.js`
```bash
node scripts/generate_ad.js --task <task_name> --date <task_date>
```
Gera via Claude API:
- `ads/layout.json` — especificação de design
- `ads/ad.html` — HTML 1080×1080 self-contained
- `ads/styles.css` — stylesheet standalone

### Step 3: `scripts/build_ad_html.js`
```bash
node scripts/build_ad_html.js --task <task_name> --date <task_date>
```
Constrói HTML final com template engine + tokens de design.

### Step 4: `scripts/render_ad.js`
```bash
node scripts/render_ad.js --task <task_name> --date <task_date>
```
Renderiza via Playwright Chromium → `ads/instagram_ad.png` (1080×1080).

---

## FORMATOS E RESOLUÇÕES

| Plataforma | Largura | Altura | Arquivo |
|---|---|---|---|
| Instagram Square | 1080 | 1080 | instagram_ad.png |
| Instagram Feed 4:5 | 1080 | 1350 | instagram_feed.png |
| Instagram Story | 1080 | 1920 | instagram_story.png |
| YouTube Thumbnail | 1280 | 720 | youtube_thumb.png |

Default pipeline: Instagram Square 1080×1080.

---

## HANDOFF

| Agente | O que recebe |
|---|---|
| Distribution Agent | `ads/instagram_ad.png` para publicação |
| Ads Agent | `layout.json` para referência de campanha |
| Copywriter Agent | `research_results.json` para alinhar copy e visual |
| Video Ad Specialist | Brief visual como referência para versão em vídeo |

---

## QUALITY CHECKLIST

- [ ] Serviço identificado: lean_six_sigma OU automacao_ia (nunca manutencao_ti)
- [ ] Tokens de cor corretos (dark bg, roxo/verde accent)
- [ ] `generate_ad.js` rodou com sucesso (layout.json + ad.html existem)
- [ ] `build_ad_html.js` gerou ad.html final com template correto
- [ ] `render_ad.js` rodou (instagram_ad.png em 1080×1080)
- [ ] Headline legível (font-size mín 48px para headline principal)
- [ ] CTA visível e clicável visualmente
- [ ] Nenhum conteúdo de Manutenção TI

## KPIs

- CTR do criativo vs benchmark (>1.5% Instagram, >2% Stories)
- CPL gerado vs meta
- Tempo de renderização (`render_ad.js` < 8s)
- Aprovação visual no primeiro ciclo (sem revisão)

## TROUBLESHOOTING

- **ANTHROPIC_API_KEY ausente**: adicionar ao `.env`
- **Fontes não renderizam**: usar font stack do sistema — não usar Google Fonts via `file://`
- **Cores erradas**: verificar `services` em `research_results.json` — ou passar `--service lean_six_sigma`
- **PNG com tamanho errado**: verificar viewport do Playwright (deve ser 1080×1080)
