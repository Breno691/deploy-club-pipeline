---
name: orchestrator
description: >
  Coordinates the complete SmartOps IA marketing pipeline for Lean Six Sigma
  and Automacao com IA campaigns. ALWAYS use when user provides a JSON payload
  with task_name and task_date, or says any of: "run the pipeline", "start the
  pipeline", "execute pipeline", "run all agents", "gerar campanha completa",
  "rodar pipeline", "iniciar campanha", or pastes a JSON block containing
  task_name. Accepts skip_research, skip_image, skip_video flags, campaign_goal,
  and platform_targets. Manages BullMQ job queue, enforces agent ordering
  (research first, then creative agents in parallel, then distribution last),
  tracks completion via pipeline_state.json, and surfaces the Publish MD file
  on completion. NEVER includes Manutencao TI content.
---

# Orchestrator

Coordinates the full SmartOps IA content pipeline — from market research to distribution — via BullMQ job queues.

## When to Use This Skill

- User provides a Job Payload JSON with `task_name` and `task_date`
- User says "run the pipeline", "execute pipeline", "gerar campanha", "iniciar pipeline"
- User pastes a JSON block containing `task_name`

## CRITICAL: Start Worker BEFORE Enqueueing

The worker **must be running before** `orchestrator.js` is called. Jobs enqueued without an active worker will sit in the queue indefinitely.

**Correct order:**
```bash
# Terminal 1 — start first
node pipeline/worker.js

# Terminal 2 — then enqueue
npm run pipeline:run
```

## Pipeline Architecture

```
Research Agent
      │
      ├──► Ad Creative Designer  ─┐
      ├──► Video Ad Specialist   ─┼──► Distribution Agent
      └──► Copywriter Agent      ─┘
```

Research first. Creative agents in parallel. Distribution last — always.

## Step 1: Validate Job Payload

```json
{
  "task_name": "smartops_lean_q3",
  "task_date": "2026-05-28",
  "campaign_goal": "conversion",
  "platform_targets": ["instagram", "youtube"],
  "source_folder": "assets/smartops_lean_q3",
  "skip_research": false,
  "skip_image": false,
  "skip_video": false
}
```

| Field | Required | Rules |
|---|---|---|
| `task_name` | Yes | snake_case, no spaces, no accents |
| `task_date` | Yes | YYYY-MM-DD format |
| `platform_targets` | Yes | Array: instagram, youtube, threads |
| `campaign_goal` | No | `conversion`, `awareness`, `lead_gen` — guides creative tone |
| `source_folder` | No | Required only if `skip_research: true` |
| `skip_research` | No | Default false. If true, `source_folder` must exist |
| `skip_image` | No | Default false |
| `skip_video` | No | Default false |

If `skip_research: true` and source folder missing:
```
Pipeline blocked: skip_research is true but source folder was not found.
Expected: [source_folder path or assets/<task_name>/]
Set skip_research: false or upload assets first.
```

## Step 2: Create Output Folder Structure

```
outputs/<task_name>_<task_date>/
├── ads/
├── video/
├── copy/
└── logs/
    └── pipeline_state.json   ← tracks job completion
```

Run:
```bash
node pipeline/orchestrator.js --payload '<json>'
```

## Step 3: Pipeline Execution Phases

### Phase 1 — Research (runs first, no dependencies)
```
Job: research_agent
Script: node scripts/research.js --task <name> --date <date>
Outputs: research_results.json, research_brief.md, interactive_report.html
```

### Phase 2 — Creative (run in parallel, after research)
```
Job: ad_creative_designer
Depends on: research_agent
Scripts: generate_ad.js → render_ad.js
Outputs: ads/layout.json, ads/ad.html, ads/styles.css, ads/instagram_ad.png

Job: video_ad_specialist
Depends on: research_agent
Output: video/ad_scenes.json → video/ad.mp4 (via Remotion)

Job: copywriter_agent
Depends on: research_agent
Script: generate_copy.js
Outputs: copy/threads_post.txt, copy/instagram_caption.txt, copy/youtube_metadata.json
```

### Phase 3 — Distribution (runs last, after all creative jobs)
```
Job: distribution_agent
Depends on: [ad_creative_designer, video_ad_specialist, copywriter_agent]
Script: upload_media.js
Outputs: media_urls.json, Publish <task_name> <date>.md
```

## Step 4: Track Pipeline Status

Status is persisted in `outputs/<task_name>_<date>/logs/pipeline_state.json`:

```json
{
  "research_agent": { "status": "complete", "completedAt": "2026-05-28T10:00:00Z" },
  "ad_creative_designer": { "status": "complete", "completedAt": "2026-05-28T10:05:00Z" },
  "video_ad_specialist": { "status": "complete", "completedAt": "2026-05-28T10:06:00Z" },
  "copywriter_agent": { "status": "complete", "completedAt": "2026-05-28T10:05:30Z" },
  "distribution_agent": { "status": "complete", "completedAt": "2026-05-28T10:08:00Z" }
}
```

Check status at any time:
```bash
cat outputs/<task_name>_<date>/logs/pipeline_state.json
```

## Step 5: Report Pipeline Completion

```
Pipeline complete ✓

Task: smartops_lean_q3 — 2026-05-28
Campaign goal: conversion
Platforms: instagram, youtube

Outputs:
  research_results.json ✓
  ads/instagram_ad.png ✓
  video/ad.mp4 ✓
  copy/threads_post.txt ✓
  copy/instagram_caption.txt ✓
  copy/youtube_metadata.json ✓
  media_urls.json ✓

Publish advisory:
  outputs/smartops_lean_q3_2026-05-28/Publish smartops_lean_q3 2026-05-28.md

To publish: reference the Publish MD file by name in your next message.
```

## Recovering a Failed Pipeline

If the pipeline fails mid-run, check which jobs completed:
```bash
cat outputs/<task_name>_<date>/logs/pipeline_state.json
```

Jobs marked `complete` will NOT re-run. Only incomplete jobs execute again.
Restart the worker and re-run `npm run pipeline:run` with the same payload.

## npm Scripts

```bash
npm run pipeline:run                           # default demo payload
npm run pipeline:run:payload '<json>'          # custom payload
npm run worker                                 # start worker (alias for node pipeline/worker.js)
```

## Troubleshooting

### Worker not connecting to Redis
**Cause:** `UPSTASH_REDIS_URL` missing or wrong format in `.env`
**Solution:** Format must be `rediss://default:PASSWORD@host.upstash.io:6379`

### Job stuck in queue forever
**Cause:** Worker not running when jobs were enqueued
**Solution:** Start `node pipeline/worker.js` — jobs will process immediately

### Pipeline fails with "source folder not found"
**Cause:** `skip_research: true` but `source_folder` path doesn't exist
**Solution:** Either run with `skip_research: false` or create the folder first

### Content about Manutenção TI appears
**This should never happen.** All knowledge files exclude Manutenção TI content.
If it does appear, re-read `knowledge/brand_identity.md` and apply the exclusion rule.

## Quality Checklist

- [ ] Worker started before orchestrator
- [ ] Payload has task_name (snake_case), task_date (YYYY-MM-DD), platform_targets
- [ ] campaign_goal set to guide creative tone
- [ ] skip_research validated (source_folder checked if true)
- [ ] Output folder structure created
- [ ] pipeline_state.json exists in logs/ after first job completes
- [ ] Pipeline completion summary shown with Publish MD path
- [ ] No Manutenção TI content in any output
