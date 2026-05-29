require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const taskArg = args.indexOf('--task');
const dateArg = args.indexOf('--date');

const taskName = taskArg !== -1 ? args[taskArg + 1] : process.env.TASK_NAME || 'deploy_club_demo';
const taskDate = dateArg !== -1 ? args[dateArg + 1] : new Date().toISOString().split('T')[0];
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);

const BUCKET = 'campaign-uploads';

const MEDIA_FILES = [
  { localPath: path.join(outputDir, 'ads', 'instagram_ad.png'), key: 'instagram_ad', mimeType: 'image/png' },
  { localPath: path.join(outputDir, 'video', 'ad.mp4'), key: 'ad_video', mimeType: 'video/mp4' },
];

function appendLog(message) {
  const logFile = path.join(outputDir, 'logs', 'distribution_agent.log');
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${message}\n`);
}

async function uploadMedia() {
  console.log(`\nDistribution Agent — Media Upload`);
  console.log(`Task: ${taskName} | Date: ${taskDate}\n`);
  appendLog('Distribution Agent started');

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    const msg = 'SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env';
    console.error(msg);
    appendLog(`FAILED: ${msg}`);
    process.exit(1);
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  const mediaUrls = {
    task_name: taskName,
    date: taskDate,
    uploaded_at: new Date().toISOString(),
  };

  for (const file of MEDIA_FILES) {
    if (!fs.existsSync(file.localPath)) {
      console.log(`  Skipping ${file.key}: file not found at ${file.localPath}`);
      appendLog(`Skipped ${file.key}: file not found`);
      continue;
    }

    const storagePath = `${taskName}/${taskDate}/${path.basename(file.localPath)}`;
    const fileBuffer = fs.readFileSync(file.localPath);

    console.log(`  Uploading ${file.key}...`);
    appendLog(`Uploading ${file.key} to ${storagePath}`);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: file.mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error(`  Upload failed [${file.key}]: ${uploadError.message}`);
      appendLog(`Upload FAILED [${file.key}]: ${uploadError.message}`);
      continue;
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    mediaUrls[file.key] = urlData.publicUrl;
    console.log(`  ✓ ${file.key}: ${urlData.publicUrl}`);
    appendLog(`${file.key} uploaded ✓: ${urlData.publicUrl}`);
  }

  const urlsPath = path.join(outputDir, 'media_urls.json');
  fs.writeFileSync(urlsPath, JSON.stringify(mediaUrls, null, 2));
  appendLog('media_urls.json saved');

  await generatePublishMD(mediaUrls);

  appendLog('Distribution Agent complete ✓');
  console.log(`\nDistribution complete. media_urls.json saved.\n`);
}

async function generatePublishMD(mediaUrls) {
  const copyDir = path.join(outputDir, 'copy');
  const publishPath = path.join(outputDir, `Publish ${taskName} ${taskDate}.md`);

  const instagramCaption = readFileSafe(path.join(copyDir, 'instagram_caption.txt'));
  const threadsPost = readFileSafe(path.join(copyDir, 'threads_post.txt'));
  const youtubeMeta = readJSONSafe(path.join(copyDir, 'youtube_metadata.json'));
  const researchResults = readJSONSafe(path.join(outputDir, 'research_results.json'));

  const schedulingIG = researchResults?.trending_windows?.instagram || 'Terça–Sexta, 11h–13h ou 19h–21h BRT';
  const schedulingYT = researchResults?.trending_windows?.youtube || 'Quinta–Sábado, 14h–17h BRT';
  const schedulingThreads = researchResults?.trending_windows?.threads || 'Dias úteis, 9h–11h BRT';

  const md = `# Publish Advisory: ${taskName} — ${taskDate}

## Media Assets (Supabase)

| Asset | URL |
|---|---|
| Instagram Ad | ${mediaUrls.instagram_ad || '_not uploaded_'} |
| Video Ad | ${mediaUrls.ad_video || '_not uploaded_'} |

---

## Instagram

**Caption:**
\`\`\`
${instagramCaption || '_caption not generated — run Copywriter Agent first_'}
\`\`\`

**Scheduled for:** ${schedulingIG}

**Post via:** Instagram Graph API — reference this file by name to execute.

---

## YouTube

**Title:** ${youtubeMeta?.title || '_not generated_'}

**Description:**
${youtubeMeta?.description || '_not generated_'}

**Tags:** ${youtubeMeta?.tags ? youtubeMeta.tags.join(', ') : '_not generated_'}

**Scheduled for:** ${schedulingYT}

**Post via:** YouTube Data API — reference this file by name to execute.

---

## Threads

**Post text:**
\`\`\`
${threadsPost || '_post not generated — run Copywriter Agent first_'}
\`\`\`

**Scheduled for:** ${schedulingThreads}

> **Note:** No public Threads API available. Copy the text above and post manually.

---

## How to Publish

To trigger real API posting, send a message referencing this file by name:

> Publish ${taskName} ${taskDate}.md

Then confirm which platforms to post to.
- Instagram and YouTube will be executed via API.
- Threads requires manual posting (no public API).

---

## Campaign Notes

- Pipeline completed: ${new Date().toISOString()}
- Assets uploaded: ${Object.keys(mediaUrls).filter(k => !['task_name','date','uploaded_at'].includes(k)).join(', ') || 'none'}
- Scheduling based on: ${researchResults ? 'research signals' : 'default guidelines'}
`;

  fs.writeFileSync(publishPath, md);
  appendLog(`Publish MD saved: ${publishPath}`);
  console.log(`\nPublish advisory ready:\n  ${publishPath}`);
  console.log(`\nTo publish: reference the file by name: "Publish ${taskName} ${taskDate}.md"\n`);
}

function readFileSafe(filePath) {
  try { return fs.readFileSync(filePath, 'utf8').trim(); } catch { return null; }
}

function readJSONSafe(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}

uploadMedia().catch(err => {
  console.error('Upload error:', err.message);
  appendLog(`FAILED: ${err.message}`);
  process.exit(1);
});
