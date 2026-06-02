// logger.js — Experimentation Agent
const fs   = require('fs');
const path = require('path');

function createLogger(outputDir) {
  const logPath = path.join(outputDir, 'logs', 'experimentation_agent.log');
  if (!fs.existsSync(path.dirname(logPath))) {
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
  }
  return {
    log: (msg) => {
      const line = `[${new Date().toISOString()}] ${msg}\n`;
      fs.appendFileSync(logPath, line);
    },
    logJson: (label, data) => {
      const line = `[${new Date().toISOString()}] ${label}: ${JSON.stringify(data)}\n`;
      fs.appendFileSync(logPath, line);
    },
  };
}

function saveOutput(baseDir, filename, content) {
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
  const p = path.join(baseDir, filename);
  const data = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  fs.writeFileSync(p, data, 'utf-8');
  console.log(`  ✓ Saved: ${p}`);
  return p;
}

function readJsonSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

module.exports = { createLogger, saveOutput, readJsonSafe };
