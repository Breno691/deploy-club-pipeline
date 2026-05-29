require('dotenv').config();
const { Worker } = require('bullmq');
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ─── Redis Connection ──────────────────────────────────────────────────────────
// UPSTASH_REDIS_URL format: rediss://default:PASSWORD@host.upstash.io:6379
function parseRedisConnection(url) {
  if (!url) return { host: 'localhost', port: 6379 };
  try {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: parseInt(u.port) || 6379,
      password: decodeURIComponent(u.password),
      tls: url.startsWith('rediss://') ? {} : undefined,
    };
  } catch {
    return { host: 'localhost', port: 6379 };
  }
}
const REDIS_CONNECTION = parseRedisConnection(process.env.UPSTASH_REDIS_URL);

// ─── File-Based Job State (persists across worker restarts) ───────────────────
function getStateFile(taskDir) {
  return path.join(taskDir, 'logs', 'pipeline_state.json');
}

function loadState(taskDir) {
  const f = getStateFile(taskDir);
  if (!fs.existsSync(f)) return {};
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return {}; }
}

function markJobDone(taskDir, jobName) {
  const state = loadState(taskDir);
  state[jobName] = { status: 'complete', completedAt: new Date().toISOString() };
  fs.writeFileSync(getStateFile(taskDir), JSON.stringify(state, null, 2));
}

function isJobDone(taskDir, jobName) {
  return loadState(taskDir)[jobName]?.status === 'complete';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function log(taskDir, agent, message) {
  const logFile = path.join(taskDir, 'logs', `${agent}.log`);
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(logFile, line);
  console.log(`[${agent}] ${message}`);
}

function runScript(script, args = [], timeoutMs = 300000) {
  const result = spawnSync('node', [script, ...args], {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    timeout: timeoutMs,
  });
  if (result.error) throw result.error;
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.status !== 0) {
    throw new Error(result.stderr?.slice(0, 500) || `Script exited with code ${result.status}`);
  }
  return result.stdout;
}

async function waitForDependency(taskDir, agentName, maxWaitMs = 480000) {
  const interval = 3000;
  let waited = 0;
  while (!isJobDone(taskDir, agentName)) {
    if (waited >= maxWaitMs) {
      throw new Error(`Dependency timeout: ${agentName} did not complete within ${maxWaitMs / 1000}s`);
    }
    await new Promise(r => setTimeout(r, interval));
    waited += interval;
  }
}

// ─── Job Handlers ─────────────────────────────────────────────────────────────
const jobHandlers = {

  research_agent: async (job) => {
    const { task_name, task_date, taskDir, skip_research } = job.data;
    if (skip_research) {
      log(taskDir, 'research_agent', 'Skipped via skip_research flag');
      return 'skipped';
    }
    log(taskDir, 'research_agent', 'Starting Tavily research (5 searches)...');
    runScript('scripts/research.js', ['--task', task_name, '--date', task_date]);
    log(taskDir, 'research_agent', 'Research complete ✓');
    return 'complete';
  },

  ad_creative_designer: async (job) => {
    const { task_name, task_date, taskDir, skip } = job.data;
    if (skip) {
      log(taskDir, 'ad_creative_designer', 'Skipped via skip_image flag');
      return 'skipped';
    }
    await waitForDependency(taskDir, 'research_agent');

    // Step 1: Generate layout JSON via Claude API
    log(taskDir, 'ad_creative_designer', 'Generating ad layout JSON...');
    runScript('scripts/generate_ad.js', ['--task', task_name, '--date', task_date]);

    // Step 2: Build HTML from layout JSON (light terracotta Deploy Club theme)
    log(taskDir, 'ad_creative_designer', 'Building HTML from layout JSON...');
    runScript('scripts/build_ad_html.js', ['--task', task_name, '--date', task_date]);

    // Step 3: Render HTML to PNG via Playwright
    log(taskDir, 'ad_creative_designer', 'Rendering PNG via Playwright...');
    runScript('scripts/render_ad.js', ['--task', task_name, '--date', task_date]);

    log(taskDir, 'ad_creative_designer', 'Ad creative complete ✓');
    return 'complete';
  },

  video_ad_specialist: async (job) => {
    const { task_name, task_date, taskDir, skip } = job.data;
    if (skip) {
      log(taskDir, 'video_ad_specialist', 'Skipped via skip_video flag');
      return 'skipped';
    }
    await waitForDependency(taskDir, 'research_agent');

    const scenesPath = path.join(taskDir, 'video', 'ad_scenes.json');
    if (!fs.existsSync(scenesPath)) {
      log(taskDir, 'video_ad_specialist', 'ad_scenes.json not found — Claude agent must generate scenes via video-ad-specialist skill first.');
      log(taskDir, 'video_ad_specialist', 'Marking as pending scene generation.');
      return 'pending_scenes';
    }

    log(taskDir, 'video_ad_specialist', 'Rendering video with Remotion...');
    const outputPath = path.resolve(path.join(taskDir, 'video', 'ad.mp4'));
    try {
      execSync(
        `npx remotion render remotion/src/index.ts AdVideo "${outputPath}" --props "${scenesPath}"`,
        { stdio: 'pipe', timeout: 300000 }
      );
      log(taskDir, 'video_ad_specialist', `Video rendered ✓: ${outputPath}`);
    } catch (err) {
      const msg = err.stderr?.toString().slice(0, 300) || err.message;
      log(taskDir, 'video_ad_specialist', `Remotion render failed: ${msg}`);
      log(taskDir, 'video_ad_specialist', 'Scene JSON preserved — render manually with: npx remotion render remotion/src/index.ts AdVideo');
    }
    return 'complete';
  },

  copywriter_agent: async (job) => {
    const { task_name, task_date, taskDir } = job.data;
    await waitForDependency(taskDir, 'research_agent');

    log(taskDir, 'copywriter_agent', 'Generating platform copy via Claude API...');
    runScript('scripts/generate_copy.js', ['--task', task_name, '--date', task_date]);
    log(taskDir, 'copywriter_agent', 'Copy generation complete ✓');
    return 'complete';
  },

  distribution_agent: async (job) => {
    const { task_name, task_date, taskDir } = job.data;

    await waitForDependency(taskDir, 'ad_creative_designer');
    await waitForDependency(taskDir, 'video_ad_specialist');
    await waitForDependency(taskDir, 'copywriter_agent');

    log(taskDir, 'distribution_agent', 'All creative jobs complete. Uploading to Supabase...');
    runScript('scripts/upload_media.js', ['--task', task_name, '--date', task_date]);
    log(taskDir, 'distribution_agent', 'Distribution complete ✓');
    return 'complete';
  },
};

// ─── Worker ───────────────────────────────────────────────────────────────────
const worker = new Worker(
  'ai-content-pipeline',
  async (job) => {
    const handler = jobHandlers[job.name];
    if (!handler) {
      console.warn(`[worker] No handler registered for job: ${job.name}`);
      return 'no_handler';
    }

    const status = await handler(job);

    // Persist completion to disk so parallel jobs can detect it
    if (status !== 'pending_scenes') {
      markJobDone(job.data.taskDir, job.name);
    }
    return { status };
  },
  {
    connection: REDIS_CONNECTION,
    concurrency: 3,
    // Retry failed jobs up to 2 times with exponential backoff
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    },
  }
);

worker.on('completed', (job, result) => {
  const status = result?.status || 'complete';
  const icon = status === 'skipped' ? '⏭' : '✓';
  console.log(`\n${icon} ${job.name} — ${status}`);
  checkPipelineComplete(job.data);
});

worker.on('failed', (job, err) => {
  console.error(`\n✗ ${job?.name} failed (attempt ${job?.attemptsMade}/${job?.opts?.attempts || 1}): ${err.message}`);
  if (job?.data?.taskDir) {
    log(job.data.taskDir, job.name, `FAILED (attempt ${job.attemptsMade}): ${err.message}`);
  }
});

worker.on('error', (err) => {
  console.error('\n[worker] Redis connection error:', err.message);
  console.error('Check UPSTASH_REDIS_URL in your .env file.');
});

// ─── Pipeline Completion Check ────────────────────────────────────────────────
function checkPipelineComplete(jobData) {
  const { task_name, task_date, taskDir } = jobData;
  if (!taskDir) return;

  const state = loadState(taskDir);
  const required = ['research_agent', 'ad_creative_designer', 'video_ad_specialist', 'copywriter_agent', 'distribution_agent'];
  const allDone = required.every(j => state[j]?.status === 'complete');

  if (allDone) {
    const publishPath = path.join(taskDir, `Publish ${task_name} ${task_date}.md`);
    const divider = '='.repeat(60);
    console.log(`\n${divider}`);
    console.log('Pipeline complete ✓');
    console.log(`Task: ${task_name} — ${task_date}`);
    if (fs.existsSync(publishPath)) {
      console.log(`\nPublish advisory:\n  ${publishPath}`);
      console.log(`\nTo publish: send "Publish ${task_name} ${task_date}.md" in Claude Code.`);
    }
    console.log(`${divider}\n`);
  }
}

console.log('\nWorker started. Listening for jobs on queue: ai-content-pipeline');
console.log('Press Ctrl+C to stop.\n');
