/**
 * Agent Logger — SmartOps IA
 * Sistema de histórico persistente para todos os agentes.
 *
 * Uso em qualquer script de agente:
 *   const AgentLogger = require('./agent_logger');
 *   const log = new AgentLogger('ads-agent');
 *   log.start();
 *   log.observe(['CPA atual: R$72', 'CTR: 2.1%']);
 *   log.think(['CPA acima da meta de R$60 — hipótese: criativo fatigado']);
 *   log.decide(['Pausar anúncio #4 por CTR abaixo de 1.5%']);
 *   log.execute(['Pausa executada via API Google Ads', 'Briefing enviado ao Copywriter']);
 *   log.alert('CTR criativo #4 caiu 18% — fadiga criativa', 'warning');
 *   log.setKPIs({ cpa: 72, ctr: 2.1, leads: 3, roas: 3.2 });
 *   log.finish('Otimização concluída. Aguardando novo criativo do Copywriter.');
 */

const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(process.cwd(), 'agents');

class AgentLogger {
  constructor(agentId) {
    this.agentId = agentId;
    this.agentDir = path.join(AGENTS_DIR, agentId);
    this.historyDir = path.join(this.agentDir, 'history');
    this.today = new Date().toISOString().split('T')[0];
    this.startedAt = new Date().toISOString();
    this.sessionId = `${agentId}-${Date.now()}`;

    this.entry = {
      session_id: this.sessionId,
      agent: agentId,
      date: this.today,
      started_at: this.startedAt,
      finished_at: null,
      status: 'running',
      observed: [],
      thoughts: [],
      decisions: [],
      executed: [],
      alerts: [],
      kpis: {},
      next_action: '',
      summary: '',
    };

    this._ensureDirs();
  }

  _ensureDirs() {
    [this.agentDir, this.historyDir].forEach(d => {
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    });
  }

  _save() {
    // Salva sessão atual em arquivo do dia
    const dayFile = path.join(this.historyDir, `${this.today}.json`);
    let dayLog = [];
    if (fs.existsSync(dayFile)) {
      try { dayLog = JSON.parse(fs.readFileSync(dayFile, 'utf8')); } catch {}
    }
    // Atualiza ou adiciona a sessão corrente
    const idx = dayLog.findIndex(e => e.session_id === this.sessionId);
    if (idx >= 0) dayLog[idx] = this.entry;
    else dayLog.push(this.entry);
    fs.writeFileSync(dayFile, JSON.stringify(dayLog, null, 2));

    // Atualiza current_state.json
    const stateFile = path.join(this.agentDir, 'current_state.json');
    const state = {
      agent: this.agentId,
      last_run: this.startedAt,
      status: this.entry.status,
      last_kpis: this.entry.kpis,
      last_alerts: this.entry.alerts,
      last_summary: this.entry.summary,
      last_next_action: this.entry.next_action,
      sessions_today: dayLog.length,
    };
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
  }

  start() {
    console.log(`\n[${this.agentId}] Sessão iniciada: ${this.sessionId}`);
    this._save();
    return this;
  }

  observe(items) {
    if (!Array.isArray(items)) items = [items];
    this.entry.observed.push(...items.map(i => ({ ts: new Date().toISOString(), data: i })));
    this._save();
    return this;
  }

  think(thoughts) {
    if (!Array.isArray(thoughts)) thoughts = [thoughts];
    this.entry.thoughts.push(...thoughts.map(t => ({ ts: new Date().toISOString(), thought: t })));
    this._save();
    return this;
  }

  decide(decisions) {
    if (!Array.isArray(decisions)) decisions = [decisions];
    this.entry.decisions.push(...decisions.map(d => ({ ts: new Date().toISOString(), decision: d })));
    this._save();
    return this;
  }

  execute(actions) {
    if (!Array.isArray(actions)) actions = [actions];
    this.entry.executed.push(...actions.map(a => ({ ts: new Date().toISOString(), action: a })));
    this._save();
    return this;
  }

  // level: 'info' | 'warning' | 'critical'
  alert(message, level = 'info') {
    const alertEntry = { ts: new Date().toISOString(), level, message };
    this.entry.alerts.push(alertEntry);
    const prefix = level === 'critical' ? '🔴' : level === 'warning' ? '🟡' : '🟢';
    console.log(`${prefix} ALERTA [${this.agentId}]: ${message}`);
    this._save();
    return this;
  }

  setKPIs(kpis) {
    this.entry.kpis = { ...this.entry.kpis, ...kpis, updated_at: new Date().toISOString() };
    this._save();
    return this;
  }

  finish(summary, nextAction = '') {
    this.entry.finished_at = new Date().toISOString();
    this.entry.status = 'completed';
    this.entry.summary = summary;
    this.entry.next_action = nextAction;
    this._save();
    console.log(`[${this.agentId}] ✓ Sessão concluída: ${summary}`);
    return this;
  }

  fail(reason) {
    this.entry.finished_at = new Date().toISOString();
    this.entry.status = 'failed';
    this.entry.summary = `FALHA: ${reason}`;
    this._save();
    console.error(`[${this.agentId}] ✗ Falha: ${reason}`);
    return this;
  }

  // Retorna histórico dos últimos N dias
  static getHistory(agentId, days = 7) {
    const historyDir = path.join(AGENTS_DIR, agentId, 'history');
    if (!fs.existsSync(historyDir)) return [];

    const results = [];
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const file = path.join(historyDir, `${dateStr}.json`);
      if (fs.existsSync(file)) {
        try {
          const sessions = JSON.parse(fs.readFileSync(file, 'utf8'));
          results.push({ date: dateStr, sessions });
        } catch {}
      }
    }
    return results;
  }

  // Retorna estado atual de todos os agentes
  static getAllStates() {
    if (!fs.existsSync(AGENTS_DIR)) return {};
    const agents = fs.readdirSync(AGENTS_DIR).filter(d =>
      fs.statSync(path.join(AGENTS_DIR, d)).isDirectory()
    );
    const states = {};
    for (const agent of agents) {
      const stateFile = path.join(AGENTS_DIR, agent, 'current_state.json');
      if (fs.existsSync(stateFile)) {
        try { states[agent] = JSON.parse(fs.readFileSync(stateFile, 'utf8')); } catch {}
      }
    }
    return states;
  }

  // Imprime histórico formatado no console
  static printHistory(agentId, days = 7) {
    const history = AgentLogger.getHistory(agentId, days);
    console.log(`\n=== Histórico: ${agentId} (últimos ${days} dias) ===\n`);
    if (history.length === 0) {
      console.log('Nenhum histórico encontrado.');
      return;
    }
    for (const day of history) {
      console.log(`📅 ${day.date} — ${day.sessions.length} sessão(ões)`);
      for (const s of day.sessions) {
        const dur = s.finished_at
          ? `${Math.round((new Date(s.finished_at) - new Date(s.started_at)) / 1000)}s`
          : 'em execução';
        console.log(`  [${s.status}] ${s.started_at} (${dur})`);
        if (s.summary) console.log(`  → ${s.summary}`);
        if (s.alerts.length) {
          s.alerts.forEach(a => {
            const prefix = a.level === 'critical' ? '🔴' : a.level === 'warning' ? '🟡' : '🟢';
            console.log(`  ${prefix} ${a.message}`);
          });
        }
        if (s.next_action) console.log(`  ⏭ Próxima ação: ${s.next_action}`);
        if (Object.keys(s.kpis).length > 1) {
          const kpiStr = Object.entries(s.kpis)
            .filter(([k]) => k !== 'updated_at')
            .map(([k, v]) => `${k}: ${v}`)
            .join(' · ');
          console.log(`  📊 KPIs: ${kpiStr}`);
        }
      }
      console.log('');
    }
  }
}

module.exports = AgentLogger;

// CLI direto: node scripts/agent_logger.js --history ads-agent --days 7
if (require.main === module) {
  const args = process.argv.slice(2);
  const historyIdx = args.indexOf('--history');
  const daysIdx = args.indexOf('--days');
  const allIdx = args.indexOf('--all');

  if (allIdx !== -1) {
    const states = AgentLogger.getAllStates();
    console.log('\n=== Estado Atual — Todos os Agentes ===\n');
    for (const [agent, state] of Object.entries(states)) {
      const lastRun = state.last_run ? new Date(state.last_run).toLocaleString('pt-BR') : 'nunca';
      const status = state.status === 'completed' ? '✅' : state.status === 'failed' ? '❌' : '🔄';
      console.log(`${status} ${agent.padEnd(35)} Último run: ${lastRun}`);
      if (state.last_summary) console.log(`   └─ ${state.last_summary}`);
    }
  } else if (historyIdx !== -1) {
    const agentId = args[historyIdx + 1];
    const days = daysIdx !== -1 ? parseInt(args[daysIdx + 1]) : 7;
    if (!agentId) {
      console.error('Uso: node scripts/agent_logger.js --history <agent-id> [--days N]');
      process.exit(1);
    }
    AgentLogger.printHistory(agentId, days);
  } else {
    console.log('Uso:');
    console.log('  node scripts/agent_logger.js --all                    # estado de todos os agentes');
    console.log('  node scripts/agent_logger.js --history ads-agent      # histórico 7 dias');
    console.log('  node scripts/agent_logger.js --history ads-agent --days 30');
  }
}
