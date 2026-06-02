// generate_narration.js
// Integração ElevenLabs → gera arquivo de áudio MP3 para narração dos vídeos Remotion
// Uso: node pipeline/generate_narration.js --text "Sua empresa perde dinheiro..." --out outputs/audio.mp3
// Variável de ambiente: ELEVENLABS_API_KEY

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Voice IDs ElevenLabs — vozes em português recomendadas
const VOICES = {
  // Masculina profissional
  professional_male: 'pNInz6obpgDQGcFmaJgB',  // Adam
  // Feminina clara
  professional_female: 'EXAVITQu4vr4xnSDxMaL', // Bella
  // Narrador impactante
  narrator: 'VR6AewLTigWG4xSOukaG',            // Arnold
};

const DEFAULT_SETTINGS = {
  stability: 0.75,
  similarity_boost: 0.85,
  style: 0.3,
  use_speaker_boost: true,
};

async function generateNarration({
  text,
  outputPath,
  voiceId = VOICES.professional_male,
  apiKey = process.env.ELEVENLABS_API_KEY,
  model = 'eleven_multilingual_v2',
}) {
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY não encontrada. Adicione ao .env: ELEVENLABS_API_KEY=sua_chave');
  }

  console.log(`🎙️  Gerando narração com ElevenLabs...`);
  console.log(`   Texto: "${text.slice(0, 80)}..."`);
  console.log(`   Voice: ${voiceId} | Model: ${model}`);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: model,
        voice_settings: DEFAULT_SETTINGS,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs API error ${response.status}: ${err}`);
  }

  const buffer = await response.arrayBuffer();
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(outputPath, Buffer.from(buffer));
  const sizeKb = (buffer.byteLength / 1024).toFixed(1);
  console.log(`✅ Áudio gerado: ${outputPath} (${sizeKb} KB)`);

  return outputPath;
}

// ── ROTEIROS PRONTOS PARA SMARTOPS IA ────────────────────────────────────────
export const SCRIPTS = {
  ad_30s: `Sua empresa perde dinheiro todo mês sem perceber. Retrabalho. Improviso. Processos que dependem só de você.
A SmartOps IA identifica e elimina esses desperdícios com Lean Six Sigma e automação com Inteligência Artificial.
Menos trinta por cento de custo operacional. Processos automatizados em quatro semanas. Resultado garantido.
Diagnóstico gratuito. Presencial aqui em Belo Horizonte. Acesse smartops-ia ponto com ponto br.`,

  hook_15s: `Quanto custa o caos na sua empresa por mês?
A SmartOps IA calcula isso em trinta minutos — e te mostra como eliminar.
Diagnóstico gratuito. Presencial BH.`,

  stats_20s: `Em noventa dias de SmartOps IA: menos trinta e dois por cento de custo operacional.
Quarenta e cinco por cento mais processos automatizados. Três vezes mais capacidade sem contratar.
Lean Six Sigma mais Inteligência Artificial aplicados na sua PME.`,
};

// ── CLI ───────────────────────────────────────────────────────────────────────
if (process.argv[1].endsWith('generate_narration.js')) {
  const args = Object.fromEntries(
    process.argv.slice(2).reduce((acc, v, i, arr) => {
      if (v.startsWith('--')) acc.push([v.slice(2), arr[i + 1]]);
      return acc;
    }, [])
  );

  const text = args.text ?? SCRIPTS[args.script ?? 'ad_30s'];
  const out  = args.out ?? `outputs/narration_${Date.now()}.mp3`;
  const voice = args.voice ?? 'professional_male';

  generateNarration({ text, outputPath: out, voiceId: VOICES[voice] ?? voice })
    .then(() => console.log('🎬 Pronto para usar no Remotion!'))
    .catch(e => { console.error('❌', e.message); process.exit(1); });
}

export { generateNarration, VOICES };
