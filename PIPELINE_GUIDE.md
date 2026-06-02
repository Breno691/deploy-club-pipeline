# SmartOps IA — Guia Completo do Pipeline

## Pipeline Completo (1 comando)

```bash
node pipeline/run_auto.js --task lean_waste --date 2026-06-10
```

Isso executa automaticamente:
1. Pesquisa com Tavily AI
2. Copy para Instagram + Threads + YouTube
3. Ad criativo HTML → PNG (1080×1080)
4. **NOVO: Vídeo Remotion MP4** (template selecionado automaticamente)
5. Upload Supabase Storage
6. Post Instagram

---

## Flags Disponíveis

| Flag | Descrição |
|---|---|
| `--task nome` | Nome da campanha (ex: `lean_waste`, `automacao_ia`) |
| `--date YYYY-MM-DD` | Data da campanha |
| `--skip-post` | Não publica no Instagram |
| `--skip-video` | Pula geração de vídeo (mais rápido) |
| `--no-narration` | Gera vídeo sem narração ElevenLabs |

---

## Gerar Só o Vídeo (sem pipeline completo)

```bash
node scripts/generate_video.js --task lean_waste --date 2026-06-10
```

Com template específico:
```bash
node scripts/generate_video.js --task lean_waste --date 2026-06-10 --template VividFlow30s
```

Sem narração:
```bash
node scripts/generate_video.js --task lean_waste --date 2026-06-10 --no-narration
```

---

## Gerar Narração Avulsa (ElevenLabs)

```bash
# Usa script pré-pronto de 30s
node pipeline/generate_narration.js --script ad_30s --out remotion/public/audio/narration_30s.mp3

# Texto personalizado
node pipeline/generate_narration.js --text "Sua empresa perde dinheiro..." --out remotion/public/audio/meu_texto.mp3
```

Scripts disponíveis: `ad_30s`, `hook_15s`, `stats_20s`

---

## Remotion Studio (visualizar templates)

```bash
cd remotion && npm start
# Abre em http://localhost:3000
```

Renderizar template manualmente:
```bash
cd remotion && npx remotion render src/index.ts VividFlow30s output.mp4
```

---

## Configuração do .env

```env
# Obrigatório
ANTHROPIC_API_KEY=sk-ant-...
TAVILY_API_KEY=tvly-...

# Para publicar no Instagram
INSTAGRAM_ACCESS_TOKEN=...
INSTAGRAM_ACCOUNT_ID=...

# Para upload de arquivos
SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_ROLE_KEY=...

# Para narração IA (opcional)
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB  # Adam (masculino)

# Para pular geração de vídeo por padrão
SKIP_VIDEO=false
```

---

## Templates Disponíveis (31 composições)

### Visuais Dinâmicos (recomendados para Reels virais)
| ID | Estilo | Melhor para |
|---|---|---|
| `VividFlow30s` | Gradiente colorido fluindo, letras em cascata | Awareness, marca |
| `PosterBlue35s` | Stamp effect, blocos alternados | Oferta, urgência |
| `DriftIndigo29s` | Shapes geométricas derivando, elegante | Consultoria premium |
| `DriftTeal29s` | Mesmo, tons teal/verde | Automação, tech |
| `BoldTypoBlack` | Palavra gigante 220px, cinética | Hook, viral |
| `Synthwave23s` | Grade perspectiva 80s, neon | Energia, atenção |

### Data Storytelling (para mostrar ROI e resultados)
| ID | Estilo | Melhor para |
|---|---|---|
| `KineticData32s` | Bar chart + before/after + contador | ROI, métricas |
| `D3DataStory38s` | D3.js: barras, linha, donut animados | Relatórios, dados |
| `HUDData30s` | Interface cockpit, barras de progresso | Dashboard, análise |

### Branding Premium
| ID | Estilo | Melhor para |
|---|---|---|
| `Aurora30s` | Gradiente holográfico, glassmorphism | Marca, inspiração |
| `GlassCool30s` | Vidro fosco, gradiente azul/roxo | SaaS, tech moderno |
| `MinimalistLight35s` | Editorial off-white, Apple-style | Autoridade, confiança |
| `BentoDark25s` | Layout bento, Apple dark mode | Produto, features |

### Alto Impacto / Viral
| ID | Estilo | Melhor para |
|---|---|---|
| `NeoBrutYellow30s` | Bordas pretas, amarelo choque | Viral, oferta |
| `PodcastDark19s` | Palavra por palavra, Alex Hormozi style | Insight, educação |
| `NeonCyber30s` | Dark + neon vermelho/ciano, CCTV | Disrupção, tech |

### Integrações (Lottie/3D)
| ID | Estilo | Melhor para |
|---|---|---|
| `LottieIcons35s` | Animações Lottie de ícones | Explicativo, features |
| `ThreeD3D36s` | Esfera 3D + partículas Three.js | Lançamento, premium |

---

## Calendário Automático (3x/semana)

O pipeline seleciona templates automaticamente baseado em:
1. **Rotação semanal** — garante variedade visual ao longo do mês
2. **Tema da campanha** — adapta o estilo ao conteúdo detectado

Exemplo de rotação:
- Semana A: Ter=VividFlow · Qui=KineticData · Sáb=PodcastDark
- Semana B: Ter=DriftTeal · Qui=NeoBrutYellow · Sáb=Aurora
- Semana C: Ter=BoldTypo · Qui=D3DataStory · Sáb=GlassCool

Para forçar um template: `--template VividFlow30s`

---

## Estrutura dos Outputs

```
outputs/lean_waste_2026-06-10/
├── research_results.json      # Dados da pesquisa Tavily
├── research_brief.md          # Resumo da pesquisa
├── media_urls.json            # URLs das mídias no Supabase
├── auto_result.json           # Resultado final do pipeline
├── ads/
│   ├── layout.json            # Design do ad estático
│   ├── ad.html                # HTML do ad
│   └── instagram_ad.png       # Ad PNG 1080×1080
├── copy/
│   ├── instagram_caption.txt  # Caption Instagram
│   ├── threads_post.txt       # Post Threads
│   └── youtube_metadata.json  # Título/descrição YouTube
├── video/
│   ├── ad_video.mp4           # 🆕 Vídeo Remotion renderizado
│   ├── template_props.json    # Props usados no template
│   └── selected_template.json # Template escolhido
└── logs/
    ├── auto_pipeline.log      # Log completo do pipeline
    └── video_pipeline.log     # 🆕 Log da geração de vídeo
```

---

## Integração com n8n

O pipeline server (`https://n8n-pipeline-server.sumjyb.easypanel.host`) aceita:

```json
POST /run-pipeline
{
  "taskName": "lean_waste",
  "taskDate": "2026-06-10",
  "skipPost": false,
  "skipVideo": false,
  "template": "VividFlow30s"  // opcional
}
```

Resposta inclui `video_url` quando gerado com sucesso.

---

## Agendamento Automático 3x/Semana

Para rodar automaticamente Terça, Quinta e Sábado às 8h:

```bash
# Usando PM2 (recomendado)
pm2 start pipeline/worker.js --name smartops-pipeline

# No n8n: cron trigger
# 0 8 * * 2,4,6  →  todo Ter/Qui/Sáb às 8h
```

Temas sugeridos por dia:
- **Terça**: Lean Six Sigma / retrabalho / desperdício
- **Quinta**: Automação IA / n8n / eficiência
- **Sábado**: Cases / ROI / resultado / diagnóstico
