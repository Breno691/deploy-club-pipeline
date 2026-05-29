require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const taskArg = args.indexOf('--task');
const dateArg = args.indexOf('--date');
const taskName = taskArg !== -1 ? args[taskArg + 1] : process.env.TASK_NAME || 'smartops_demo';
const taskDate = dateArg !== -1 ? args[dateArg + 1] : new Date().toISOString().split('T')[0];
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const copyDir = path.join(outputDir, 'copy');

function appendLog(msg) {
  fs.appendFileSync(
    path.join(outputDir, 'logs', 'copywriter_agent.log'),
    `[${new Date().toISOString()}] ${msg}\n`
  );
}

function readFileSafe(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

async function generateCopy() {
  console.log(`\nCopywriter Agent — Generating platform copy`);
  console.log(`Task: ${taskName} | Date: ${taskDate}\n`);
  appendLog('generate_copy started');

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not set in .env');
  }

  if (!fs.existsSync(copyDir)) fs.mkdirSync(copyDir, { recursive: true });

  // Load all context
  const brandIdentity = readFileSafe('knowledge/brand_identity.md');
  const productCampaign = readFileSafe('knowledge/product_campaign.md');
  const platformGuidelines = readFileSafe('knowledge/platform_guidelines.md');
  const researchRaw = readFileSafe(path.join(outputDir, 'research_results.json'));

  let research = {};
  try { research = JSON.parse(researchRaw); } catch {}

  const selectedAngle = research.marketing_angles?.[0] || 'O processo está quebrado — não a equipe';
  const topHook = research.ad_hooks?.[0] || 'Equipe apagando incêndio todo dia? Não é falta de esforço. É processo quebrado.';
  const keywords = (research.keywords || []).slice(0, 6).join(', ');
  const services = (research.services || ['Lean Six Sigma', 'Automação com IA']).join(' e ');

  const client = new Anthropic();

  const systemPrompt = `You are the copywriter for SmartOps IA, a Brazilian Lean Six Sigma and AI Automation consultancy for small businesses in BH, MG.
Consultant: Breno Luiz, Black Belt Lean Six Sigma. Contact: (31) 97203-9180 · smartops-ia.com.br

SERVICES IN SCOPE: ${services}
DO NOT write about: Manutenção TI, formatação, SSD, vírus, computadores — these are excluded.

BRAND RULES (non-negotiable):
- Every claim needs a specific number: −30% custo operacional, 4 semanas, 30 minutos, 24h, 2–4 semanas, −30%
- Never say "incrível", "método exclusivo", vague promises like "vai melhorar muito"
- Tone: professional but direct — like an experienced consultant, not a salesperson
- Each platform must have a distinct tone and format — never copy-paste between platforms
- Max 1 emoji across entire output
- CTA always references "Diagnóstico gratuito de 30 minutos" or "smartops-ia.com.br"
- Lean first, automation second — always mention this sequence when relevant

SELECTED CAMPAIGN ANGLE: ${selectedAngle}
TOP HOOK: ${topHook}
KEYWORDS: ${keywords}

BRAND IDENTITY EXCERPT:
${brandIdentity.slice(0, 1500)}

PLATFORM GUIDELINES EXCERPT:
${platformGuidelines.slice(0, 1500)}`;

  // ── Threads Post ────────────────────────────────────────────────────────────
  appendLog('Generating Threads post...');
  const threadsResponse = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Write a Threads post for Deploy Club.

Rules:
- Max 500 characters total
- 1-3 short sentences
- Provocative, raw, conversational — most casual of all platforms
- 0-1 hashtags (never lead with hashtag)
- Can end with dry observation, rhetorical question, or challenge
- Self-deprecation welcome ("o idiota aqui, ó")

Return ONLY the post text, nothing else.`
    }],
  });

  const threadsPost = threadsResponse.content[0].text.trim();
  fs.writeFileSync(path.join(copyDir, 'threads_post.txt'), threadsPost);
  appendLog('threads_post.txt saved');
  console.log('  threads_post.txt ✓');

  // ── Instagram Caption ───────────────────────────────────────────────────────
  appendLog('Generating Instagram caption...');
  const igResponse = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Write an Instagram caption for Deploy Club.

Structure (follow exactly):
1. Hook line: proof with number OR pain point (1 sentence)
2. Benefit: concrete result in specific terms (1-2 sentences)
3. CTA: challenging tone, never pleading (1 sentence)
4. Blank line
5. Hashtags: exactly 3-5, mix of #DeployClub + product + niche

Rules:
- Max 1-2 emojis total
- CTA must come before hashtags
- Use keywords: ${keywords}

Return ONLY the caption text, nothing else.`
    }],
  });

  const igCaption = igResponse.content[0].text.trim();
  fs.writeFileSync(path.join(copyDir, 'instagram_caption.txt'), igCaption);
  appendLog('instagram_caption.txt saved');
  console.log('  instagram_caption.txt ✓');

  // ── YouTube Metadata ────────────────────────────────────────────────────────
  appendLog('Generating YouTube metadata...');
  const ytResponse = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Generate YouTube metadata for a Deploy Club video.

Return ONLY valid JSON, no markdown:
{
  "title": "60-70 char SEO title with specific number | Deploy Club",
  "description": "2-3 sentences: what it shows + concrete result with number + CTA with [link]",
  "tags": ["10-12 relevant tags", "mix of brand, product, niche keywords"]
}

Title rules: clear + specific number + no clickbait + ends with "| Deploy Club"
Use these keywords in tags: ${keywords}`
    }],
  });

  let ytMetadata;
  try {
    const rawYT = ytResponse.content[0].text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    ytMetadata = JSON.parse(rawYT);
  } catch {
    throw new Error('Claude returned invalid JSON for YouTube metadata');
  }

  fs.writeFileSync(path.join(copyDir, 'youtube_metadata.json'), JSON.stringify(ytMetadata, null, 2));
  appendLog('youtube_metadata.json saved');
  console.log('  youtube_metadata.json ✓');

  // ── Summary log ─────────────────────────────────────────────────────────────
  appendLog(`Campaign angle used: ${selectedAngle}`);
  appendLog('generate_copy complete ✓');
  console.log(`\nCopy generation complete. Files in: ${copyDir}\n`);

  // Print preview
  console.log('── Threads preview ──');
  console.log(threadsPost.slice(0, 120) + (threadsPost.length > 120 ? '...' : ''));
  console.log('\n── Instagram hook ──');
  console.log(igCaption.split('\n')[0]);
  console.log('\n── YouTube title ──');
  console.log(ytMetadata.title);
  console.log('');
}

generateCopy().catch(err => {
  console.error('generate_copy error:', err.message);
  appendLog(`FAILED: ${err.message}`);
  process.exit(1);
});
