require('dotenv').config();
const { Queue } = require('bullmq');
const fs = require('fs');
const path = require('path');

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

const DEFAULT_PAYLOAD = {
  task_name: 'deploy_club_demo',
  task_date: new Date().toISOString().split('T')[0],
  platform_targets: ['instagram', 'youtube'],
  source_folder: null,
  skip_research: false,
  skip_image: false,
  skip_video: false,
};

async function main() {
  let payload = DEFAULT_PAYLOAD;

  const payloadArg = process.argv.indexOf('--payload');
  if (payloadArg !== -1 && process.argv[payloadArg + 1]) {
    try {
      payload = JSON.parse(process.argv[payloadArg + 1]);
    } catch {
      console.error('Invalid JSON payload. Using default.');
    }
  }

  validatePayload(payload);

  const taskDir = path.join(
    process.env.PIPELINE_OUTPUT_DIR || 'outputs',
    `${payload.task_name}_${payload.task_date}`
  );

  createOutputDirs(taskDir);

  if (payload.skip_research) {
    const assetsDir = payload.source_folder
      ? path.resolve(payload.source_folder)
      : path.join(process.env.PIPELINE_ASSETS_DIR || 'assets', payload.task_name);
    if (!fs.existsSync(assetsDir)) {
      console.error(`\nPipeline blocked: skip_research is true but source folder was not found.`);
      console.error(`Expected: ${assetsDir}`);
      console.error(`Either set source_folder in the payload or upload assets to assets/${payload.task_name}/\n`);
      process.exit(1);
    }
  }

  const queue = new Queue('ai-content-pipeline', { connection: REDIS_CONNECTION });

  console.log(`\nEnqueuing pipeline jobs for: ${payload.task_name} — ${payload.task_date}\n`);

  await queue.add('research_agent', {
    ...payload,
    taskDir,
    agent: 'research_agent',
  }, {
    jobId: `${payload.task_name}_research`,
    priority: 1,
  });

  await queue.add('ad_creative_designer', {
    ...payload,
    taskDir,
    agent: 'ad_creative_designer',
    skip: payload.skip_image,
  }, {
    jobId: `${payload.task_name}_ad_creative`,
    priority: 2,
    delay: 0,
  });

  await queue.add('video_ad_specialist', {
    ...payload,
    taskDir,
    agent: 'video_ad_specialist',
    skip: payload.skip_video,
  }, {
    jobId: `${payload.task_name}_video`,
    priority: 2,
    delay: 0,
  });

  await queue.add('copywriter_agent', {
    ...payload,
    taskDir,
    agent: 'copywriter_agent',
  }, {
    jobId: `${payload.task_name}_copy`,
    priority: 2,
    delay: 0,
  });

  await queue.add('distribution_agent', {
    ...payload,
    taskDir,
    agent: 'distribution_agent',
  }, {
    jobId: `${payload.task_name}_distribution`,
    priority: 3,
    delay: 0,
  });

  console.log('Jobs enqueued:');
  console.log('  [1] research_agent');
  console.log('  [2] ad_creative_designer' + (payload.skip_image ? ' (will be skipped)' : ''));
  console.log('  [2] video_ad_specialist' + (payload.skip_video ? ' (will be skipped)' : ''));
  console.log('  [2] copywriter_agent');
  console.log('  [3] distribution_agent');
  console.log(`\nStart the worker in a separate terminal: node pipeline/worker.js`);
  console.log(`Monitor logs: outputs/${payload.task_name}_${payload.task_date}/logs/\n`);

  await queue.close();
}

function validatePayload(payload) {
  if (!payload.task_name || /\s/.test(payload.task_name)) {
    throw new Error('task_name is required and must not contain spaces. Use snake_case.');
  }
  if (!payload.task_date || !/^\d{4}-\d{2}-\d{2}$/.test(payload.task_date)) {
    throw new Error('task_date is required and must be in YYYY-MM-DD format.');
  }
  if (!payload.platform_targets || payload.platform_targets.length === 0) {
    throw new Error('platform_targets must include at least one platform: instagram, youtube, threads.');
  }
}

function createOutputDirs(taskDir) {
  const dirs = [
    taskDir,
    path.join(taskDir, 'ads'),
    path.join(taskDir, 'video'),
    path.join(taskDir, 'copy'),
    path.join(taskDir, 'logs'),
  ];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  console.log(`Output directory created: ${taskDir}`);
}

main().catch(err => {
  console.error('Orchestrator error:', err.message);
  process.exit(1);
});
