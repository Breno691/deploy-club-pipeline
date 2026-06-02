// generate_narration_free.js
// Narração 100% gratuita usando Google TTS — mesma voz do Google Translate.
// Sem API key, sem cadastro, sem limite diário prático.
// Voz pt-BR feminina (Fernanda) — clara e profissional.
// Uso: node pipeline/generate_narration_free.js --text "Seu texto" --out audio.mp3

'use strict';
require('dotenv').config();
const googleTTS = require('google-tts-api');
const https     = require('https');
const fs        = require('fs');
const path      = require('path');

// ── Configuração de voz ───────────────────────────────────────────────────────
// Google TTS suporta pt-BR nativamente — mesma voz do Google Translate
const LANG   = 'pt-BR';
const SPEED  = 0.92;   // levemente mais lento para narração (0.24–1.0)

/**
 * Baixa MP3 de uma URL e retorna Buffer.
 */
function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} ao baixar áudio`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Converte texto em Buffer MP3 usando Google TTS (gratuito, sem API key).
 * Divide textos longos automaticamente em segmentos de ~200 chars.
 */
async function textToSpeech(text) {
  // getAllAudioUrls divide automaticamente em segmentos de 200 chars
  const urls = googleTTS.getAllAudioUrls(text, { lang: LANG, slow: false, speed: SPEED, splitPunct: '.,!?' });

  if (!urls || urls.length === 0) throw new Error('Google TTS não retornou URLs de áudio');

  console.log(`   Gerando ${urls.length} segmento(s) de áudio...`);

  const buffers = await Promise.all(urls.map(({ url }) => downloadBuffer(url)));
  return Buffer.concat(buffers);
}

/**
 * Salva narração em arquivo MP3.
 */
async function saveNarration(text, outputPath) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const buffer = await textToSpeech(text);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Narração gerada: ${outputPath} (${(buffer.length/1024).toFixed(1)} KB) — Google TTS pt-BR`);
  return outputPath;
}

// ── Scripts prontos para SmartOps IA ─────────────────────────────────────────
const SCRIPTS = {
  ad_30s: `Sua empresa está perdendo dinheiro todo mês sem perceber.
Retrabalho. Processos que dependem só de você. Decisões no feeling.
A SmartOps IA mapeia, elimina os desperdícios e automatiza o que pode ser automatizado.
Menos trinta por cento de custo. Processos funcionando sem você. Resultado em noventa dias.
Diagnóstico gratuito. Presencial aqui em Belo Horizonte.`,

  hook_15s: `Quanto custa o caos na sua empresa por mês?
A SmartOps IA calcula isso em trinta minutos e te mostra como eliminar.
Diagnóstico gratuito. Presencial em BH.`,

  automation_30s: `Seu time ainda faz manualmente o que poderia ser automático?
Relatórios, WhatsApp, planilhas, tudo isso pode rodar sozinho.
A SmartOps IA implementa automações com inteligência artificial em quatro semanas.
Zero código. Zero contratação. Resultado garantido.`,

  lean_30s: `Você sabia que em média trinta por cento do custo de uma pequena empresa é retrabalho?
É dinheiro sendo pago duas vezes pelo mesmo resultado.
Com Lean Six Sigma aplicado pela SmartOps IA, esse desperdício some em quatro semanas.
Presencial em Belo Horizonte. Diagnóstico gratuito de trinta minutos.`,

  stats_20s: `Em noventa dias de SmartOps IA.
Menos trinta e dois por cento de custo operacional.
Quarenta e cinco por cento mais processos automatizados com IA.
Três vezes mais capacidade sem contratar.`,
};

module.exports = { textToSpeech, saveNarration, SCRIPTS, LANG };

// ── CLI ───────────────────────────────────────────────────────────────────────
if (require.main === module) {
  const args   = process.argv.slice(2);
  const get    = (f, d = null) => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : d; };

  const text = get('--text') ?? SCRIPTS[get('--script') ?? 'ad_30s'];
  const out  = get('--out')  ?? `narration_${Date.now()}.mp3`;

  console.log('🎙️  Google TTS — gratuito, sem API key');
  console.log(`   Língua: pt-BR`);
  console.log(`   Texto: "${text.slice(0, 80)}..."`);
  console.log('   Conectando ao Google...\n');

  saveNarration(text, out)
    .then(() => {
      console.log('\n🎬 Pronto! Para usar no Remotion:');
      console.log(`   1. Copie o arquivo para remotion/public/audio/`);
      console.log(`   2. Adicione no template: <NarrationTrack src="audio/${path.basename(out)}" />`);
    })
    .catch(e => { console.error('❌', e.message); process.exit(1); });
}
