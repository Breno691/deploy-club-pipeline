# Channel Playbook — Distribuição Multicanal

## Mapa de Canais e Formatos

| Canal | Formatos | Tipo de conteúdo | Fit com nicho |
|-------|----------|-----------------|---------------|
| Instagram Feed | Carrossel 4:5, Imagem | Educativo, autoridade | Alto |
| Instagram Reels | Vídeo 9:16 ≤90s | Viral, hooks | Alto |
| Instagram Stories | Vídeo/imagem 9:16 | Bastidores, enquete | Alto |
| TikTok | Vídeo 9:16 ≤3min | Viral, educativo | Alto |
| YouTube Shorts | Vídeo 9:16 ≤60s | Educativo rápido | Alto |
| YouTube | Vídeo 16:9 longo | Educativo profundo | Alto |
| LinkedIn | Carrossel, post longo | Autoridade B2B | Muito alto |
| Threads | Texto ≤500 chars | Insight direto | Médio |
| X/Twitter | Texto ≤280 chars, thread | Insight técnico | Médio |
| Blog | Artigo SEO | Tráfego orgânico | Alto |
| Email | HTML ou texto | Nutrição, conversão | Muito alto |
| WhatsApp | Texto + imagem | Leads, nutrição | Muito alto |

## Horários Ideais (BRT)

| Canal | Dias | Horários |
|-------|------|---------|
| Instagram / LinkedIn | Ter–Qui | 7h–9h ou 12h–13h |
| YouTube | Qua–Sáb | 14h–17h |
| Threads / X | Dias úteis | 8h–10h |
| TikTok | Ter–Sex | 19h–22h |
| Email | Ter–Qui | 7h–9h |
| WhatsApp | Seg–Sex | 8h–10h ou 17h–19h |

## Frequência Ideal

| Canal | Posts/semana |
|-------|-------------|
| Instagram Feed | 4–5x |
| Instagram Reels | 3–4x |
| Instagram Stories | Diário |
| LinkedIn | 3–4x |
| TikTok | 3–5x |
| YouTube Shorts | 3–5x |
| Email | 1–2x |
| WhatsApp | 2–3x |

## Content Repurposing — Árvore Completa

```
1 REEL (origem)
  ├── TikTok (mesmo vídeo, legenda adaptada)
  ├── YouTube Short (mesmo vídeo, thumbnail novo)
  ├── Instagram Carrossel (extrair 5 pontos)
  │   └── LinkedIn Carrossel (adaptar tom B2B)
  ├── Caption Instagram
  │   ├── Threads Post (resumido ≤500 chars)
  │   └── X/Twitter (≤280 chars ou thread)
  ├── LinkedIn Post longo (expandir com contexto técnico)
  │   └── Blog Post (versão longa com SEO)
  └── Email/Newsletter (narrativo + CTA único)
        └── WhatsApp snippet (3–5 linhas + link)
```

## Adaptação por Canal

| Canal | Tom | Diferença principal |
|-------|-----|-------------------|
| LinkedIn | Formal B2B | Foco em ROI, gestão, resultados enterprise |
| TikTok | Orgânico natural | Linguagem casual, sem termos corporativos |
| Blog | Profundo e SEO | Keywords, H2/H3, links internos |
| Email | Narrativo pessoal | 1 CTA apenas, like DM de amigo |
| WhatsApp | Ultra-curto | 3–5 linhas + link, direto ao ponto |

## KPIs por Canal

| Canal | KPIs principais | Metas |
|-------|----------------|-------|
| Instagram Reels | Retenção >50%, compartilhamentos >2%, saves >3% | Semanal |
| YouTube | CTR thumbnail >5%, avg view duration >40% | Por vídeo |
| Email | Open rate >30%, CTR >3% | Por envio |
| LinkedIn | Impressões orgânicas, comentários, conexões | Semanal |

## Content Flywheel

```
CRIAR → DISTRIBUIR → ANALISAR → IDENTIFICAR PADRÕES
→ OTIMIZAR → REDISTRIBUIR → AMPLIFICAR → CRESCER → CRIAR
```

Analisar em 48h após publicação: saves altos = série de conteúdo.
Compartilhamentos altos = ampliar o ângulo. Comentários = responder e engajar.

## API Snippets — Instagram e YouTube

```javascript
// Instagram Graph API v21.0
const containerRes = await fetch(
  `https://graph.facebook.com/v21.0/${process.env.INSTAGRAM_ACCOUNT_ID}/media`,
  { method: 'POST', body: new URLSearchParams({
    image_url: mediaUrls.instagram_ad,
    caption: instagramCaption,
    access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
  })}
);
const { id: containerId } = await containerRes.json();
await fetch(
  `https://graph.facebook.com/v21.0/${process.env.INSTAGRAM_ACCOUNT_ID}/media_publish`,
  { method: 'POST', body: new URLSearchParams({
    creation_id: containerId,
    access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
  })}
);

// YouTube Data API v3
const { google } = require('googleapis');
const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: process.env.YOUTUBE_REFRESH_TOKEN });
const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
await youtube.videos.insert({
  part: ['snippet', 'status'],
  requestBody: {
    snippet: { title, description, tags, categoryId: '27', defaultLanguage: 'pt' },
    status: { privacyStatus: 'public' },
  },
  media: { body: fs.createReadStream(path.join(taskDir, 'video', 'ad.mp4')) },
});
```
