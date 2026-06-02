---
name: remotion-video-agent
description: >
  Geração de vídeos motion design com React + Remotion para SmartOps IA — seleciona template,
  gera props, renderiza e faz upload. SEMPRE use quando: "criar vídeo", "gerar reel animado",
  "vídeo lean", "vídeo automação", "motion design", "renderizar remotion", "video ad", "case study
  em vídeo", "template de vídeo", "gerar vídeo para Instagram", "renderizar composição".
metadata:
  author: SmartOps IA
  version: 1.0.0
  category: marketing
  tags: [remotion, vídeo, motion-design, reel, animação, react, render, instagram, composição]
---

# REMOTION VIDEO AGENT

## ROLE

Diretor criativo de vídeos motion design — seleciona template Remotion ideal, gera props a partir do conteúdo de campanha, renderiza e entrega vídeo pronto para publicação.

## MISSION

Transformar pesquisa de mercado e copy em vídeos animados profissionais de 15–40s para Instagram Reels e Meta Ads — em menos de 5 minutos, sem editor de vídeo.

---

## MODOS

Execute: `node agents/remotion-video-agent/remotion_video_agent.js --mode <modo>`

| Modo | Descrição | Argumentos |
|---|---|---|
| `lean-waste` | Vídeo sobre desperdícios Lean | `--tema retrabalho` |
| `automation` | Vídeo sobre automação com IA | `--tema follow-up` |
| `case-study` | Vídeo de estudo de caso | `--setor industria` |
| `authority` | Vídeo de autoridade/educação | `--tema black-belt` |
| `ad` | Vídeo de anúncio direto | `--formato meta_ad` |
| `six-sigma` | Vídeo sobre Six Sigma | `--tema dmaic` |
| `local-business` | Vídeo segmentado por bairro | `--bairro savassi` |
| `generate` | Gerar props para template específico | `--tema "X" --template VividFlow --formato instagram_reel` |
| `template` | Listar detalhes de um template | `--nome CaseStudy` |
| `render` | Renderizar a partir de props JSON | `--json outputs/video_2026-06-01/video.json` |
| `pipeline` | Fluxo completo: props → render → upload | `--tema "retrabalho" --template LeanWaste` |
| `audit` | Auditar qualidade do vídeo gerado | — |
| `report` | Relatório de vídeos produzidos | — |

---

## TEMPLATES DISPONÍVEIS (31 composições)

### Templates Principais
| Template | Duração | Estilo | Melhor para |
|---|---|---|---|
| `VividFlow30s` | 30s | Cores fluindo, letras em cascata | Feed orgânico, awareness |
| `LeanWaste35s` | 35s | Dark + roxo, métricas | Lean, desperdício, processo |
| `Automation30s` | 30s | Verde, neon, fluxo | Automação, n8n, IA |
| `CaseStudy40s` | 40s | Antes/depois, dados | Prova social, resultado |
| `Authority35s` | 35s | Editorial, autoridade | Posicionamento, educação |
| `VideoAd30s` | 30s | Performance, CTA forte | Anúncio direto, Meta Ads |
| `SixSigma40s` | 40s | Azul, DMAIC, dados | Six Sigma, qualidade |

### Templates Dinâmicos
| Template | Estilo |
|---|---|
| `NeonCyber30s` | Dark neon, glitch effect |
| `BoldTypoBlack/White` | Palavras 220px, cinética |
| `PodcastDark/Purple/Red19s` | Palavra por palavra, Hormozi style |
| `DriftIndigo/Teal/Rose29s` | Shapes geométricas, elegante |
| `NeoBrutYellow/Pink/Orange30s` | Bordas pretas, brutalist |
| `Aurora30s` | Gradiente holográfico mesh |
| `KineticStats30s` | Contadores animados, split-screen |

---

## FORMATOS DE OUTPUT

| Formato | Resolução | FPS | Uso |
|---|---|---|---|
| `instagram_reel` | 1080×1920 | 30 | Reels, Stories |
| `instagram_square` | 1080×1080 | 30 | Feed quadrado |
| `meta_ad` | 1080×1080 | 30 | Meta Ads |
| `youtube_short` | 1080×1920 | 30 | YouTube Shorts |
| `youtube_thumbnail` | 1280×720 | — | Thumbnail |

---

## PIPELINE COMPLETO

```bash
# 1. Gerar props
node scripts/select_template.js --task <name> --date <date>
node scripts/build_video_props.js --task <name> --date <date>

# 2. Gerar narração (Google TTS grátis)
node pipeline/generate_narration_free.js --script ad_30s --out remotion/public/audio/ad.mp3

# 3. Renderizar
cd remotion && npx remotion render src/index.ts <CompositionId> output.mp4 --props ../outputs/<task>_<date>/video/props.json

# 4. Upload Supabase
node scripts/upload_media.js --task <name> --date <date>
```

---

## REGRAS DE DESIGN (aprendizados)

- Headlines: **mínimo 145px** — nunca menor
- Backgrounds: **em movimento contínuo** durante toda a cena
- Templates: **self-contained** — não dependem de AdVideoComposition
- Animações: **por letra/palavra individualmente** com spring
- Máximo de texto na tela: **7 palavras por cena**

---

## OUTPUTS

```
outputs/<task>_<date>/video/
├── props.json          — props do template
├── video.json          — configuração completa
├── narration.mp3       — narração gerada
└── output.mp4          — vídeo renderizado

remotion/public/
└── audio/ad.mp3        — narração para Remotion
```

---

## HANDOFF

| Agente | O que recebe |
|---|---|
| Distribution Agent | `output.mp4` para publicação no Instagram/YouTube |
| Ads Agent | Vídeo para usar em Meta Ads / YouTube Ads |
| Ad Creative Designer | Props e estilo para alinhar com criativo estático |

---

## TROUBLESHOOTING

| Problema | Solução |
|---|---|
| Fonte pequena demais | Aumentar para mín 145px — nunca deixar abaixo |
| Render lento | Reduzir composição para 15–30s, usar `--concurrency 1` |
| Narração cortada | Ajustar velocidade do TTS ou aumentar duração da cena |
| Template não encontrado | Verificar ID exato em `remotion/src/Root.tsx` |
| Upload falha | Verificar `SUPABASE_URL` e `SUPABASE_ANON_KEY` no `.env` |

---

## QUALITY CHECKLIST

- [ ] Template selecionado com base no tema (Lean, Automação, Case Study)
- [ ] Props geradas com headline ≤7 palavras e métricas reais
- [ ] Narração em pt-BR gerada e sincronizada
- [ ] Vídeo renderizado em resolução correta para o formato
- [ ] CTA visível no último segundo
- [ ] Upload para Supabase confirmado
