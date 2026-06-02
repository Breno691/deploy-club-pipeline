// WorkflowMonitoringAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// Thresholds de saúde de workflow
const HEALTH_THRESHOLDS = {
  success_rate_min:  0.95,  // < 95% → alerta
  latency_max_s:     30,    // > 30s → alerta
  cost_spike_pct:    50,    // > 50% acima da média → alerta
  failures_daily:    3,     // > 3 falhas/dia → crítico
};

function assessWorkflowHealth(executions = []) {
  if (!executions.length) return { status: 'SEM_DADOS', score: 0 };

  const total    = executions.length;
  const success  = executions.filter(e => e.status === 'success').length;
  const failed   = executions.filter(e => e.status === 'failed').length;
  const success_rate = success / total;
  const avg_duration = executions.reduce((s, e) => s + (e.duration_s || 0), 0) / total;

  const issues = [];
  if (success_rate < HEALTH_THRESHOLDS.success_rate_min)
    issues.push(`Taxa de sucesso: ${(success_rate * 100).toFixed(1)}% (mín: 95%)`);
  if (avg_duration > HEALTH_THRESHOLDS.latency_max_s)
    issues.push(`Latência média: ${avg_duration.toFixed(1)}s (máx: 30s)`);
  if (failed >= HEALTH_THRESHOLDS.failures_daily)
    issues.push(`${failed} falhas detectadas (máx diário: 3)`);

  const score = Math.max(0, 100 - (issues.length * 25) - (failed * 5));
  const status = score >= 90 ? 'SAUDAVEL' : score >= 70 ? 'ATENCAO' : score >= 50 ? 'DEGRADADO' : 'CRITICO';

  return {
    status,
    health_score:   score,
    total_runs:     total,
    success_count:  success,
    failed_count:   failed,
    success_rate:   `${(success_rate * 100).toFixed(1)}%`,
    avg_duration_s: Math.round(avg_duration * 10) / 10,
    issues,
    recommendation: status === 'SAUDAVEL' ? 'Workflow funcionando bem'
      : status === 'ATENCAO' ? 'Investigar issues antes que piore'
      : 'Pausar e corrigir imediatamente',
    monitored_at: new Date().toISOString(),
  };
}

function detectFailurePattern(executions = []) {
  const failures = executions.filter(e => e.status === 'failed');
  if (!failures.length) return { pattern: 'SEM_FALHAS', recommendation: 'Nenhuma falha detectada' };

  const errorTypes = {};
  failures.forEach(f => {
    const type = f.error_type || 'unknown';
    errorTypes[type] = (errorTypes[type] || 0) + 1;
  });

  const topError = Object.entries(errorTypes).sort((a, b) => b[1] - a[1])[0];
  const hours = failures.map(f => new Date(f.started_at || Date.now()).getHours());
  const peakHour = hours.reduce((max, h, _, arr) =>
    arr.filter(x => x === h).length > arr.filter(x => x === max).length ? h : max, hours[0]);

  return {
    total_failures: failures.length,
    top_error:      topError?.[0],
    top_error_count: topError?.[1],
    error_distribution: errorTypes,
    peak_failure_hour: `${peakHour}:00`,
    pattern: topError?.[1] >= 3 ? 'RECORRENTE' : 'ESPORADICO',
    recommendation: topError?.[0] === 'timeout'
      ? 'Aumentar timeout ou otimizar chamada externa'
      : topError?.[0] === 'auth'
      ? 'Renovar credenciais — token expirado'
      : 'Analisar logs detalhados da falha principal',
  };
}

async function generateMonitoringReportWithClaude(workflows) {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Workflow Monitoring Agent da SmartOps IA.

Missão: Monitorar todos os workflows em produção e detectar problemas antes que causem impacto.

## STATUS DOS WORKFLOWS:
${workflows.map(w => `**${w.name}**
Status: ${w.health?.status || 'DESCONHECIDO'}
Execuções: ${w.health?.total_runs || 0}
Taxa de sucesso: ${w.health?.success_rate || '?'}
Latência média: ${w.health?.avg_duration_s || '?'}s
Issues: ${w.health?.issues?.join(', ') || 'nenhum'}`).join('\n\n')}

---

Gere o Monitoring Report:

# WORKFLOW MONITORING REPORT

## STATUS GERAL
[semáforo: VERDE/AMARELO/VERMELHO] — [resumo em 1 linha]

## WORKFLOWS EM ALERTA
[listar apenas os que precisam de atenção]

## ANÁLISE DE FALHAS
[para cada workflow com problema: causa provável + ação]

## WORKFLOWS SAUDÁVEIS
[resumo rápido dos que estão OK]

## AÇÕES URGENTES
[o que fazer agora — máximo 3 ações]

## TENDÊNCIAS
[padrões observados que podem virar problema]

## PRÓXIMO CHECK
[quando fazer próxima revisão]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { assessWorkflowHealth, detectFailurePattern, generateMonitoringReportWithClaude, HEALTH_THRESHOLDS };
