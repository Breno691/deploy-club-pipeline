// AlertMonitorAgent.js — Monitora KPIs e dispara alertas CEO
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const { detectCEOAlerts, calcBusinessHealth } = require('../calculations/ceoCalculators');

const client = new Anthropic();

function scanForAlerts(data = {}) {
  const alerts = detectCEOAlerts(data);
  const health  = calcBusinessHealth(data);

  // Alertas de tempo baseados no dia da semana
  const weekday = new Date().getDay();
  const timeAlerts = [];
  if (weekday === 1) timeAlerts.push({ type: 'lembrete', msg: 'Segunda: revisar pipeline + confirmar reuniões da semana', urgency: 'INFO' });
  if (weekday === 5) timeAlerts.push({ type: 'lembrete', msg: 'Sexta: revisar resultados + planejar semana seguinte', urgency: 'INFO' });
  if (weekday === 3) timeAlerts.push({ type: 'lembrete', msg: 'Quarta: follow-up de propostas + prospecção', urgency: 'INFO' });

  return {
    ...alerts,
    time_alerts: timeAlerts,
    health_score: health.total,
    health_label: health.label,
    needs_action: alerts.criticos.length > 0 || alerts.altos.length > 0,
    telegram_message: buildTelegramAlert(alerts, health, data),
  };
}

function buildTelegramAlert(alerts, health, data) {
  const emoji = alerts.color === 'VERMELHO' ? '🔴' : alerts.color === 'AMARELO' ? '🟡' : '🟢';
  const lines = [
    `${emoji} *CEO ALERT — SmartOps IA*`,
    `📊 Saúde: ${health.total}/100 — ${health.label}`,
    `💰 Receita: R$ ${(data.receita_mes || 0).toLocaleString('pt-BR')} / R$ ${CONFIG.goals.receita_meta_mes.toLocaleString('pt-BR')}`,
    `🎯 Pipeline: R$ ${(data.pipeline_valor || 0).toLocaleString('pt-BR')} | Reuniões: ${data.reunioes_semana || 0}`,
  ];
  if (alerts.alerts.length > 0) {
    lines.push('');
    lines.push('⚠️ *ALERTAS:*');
    alerts.alerts.slice(0, 3).forEach(a => lines.push(`[${a.urgency}] ${a.data}`));
  }
  return lines.join('\n');
}

async function generateAlertReportWithClaude(alertData, businessData = {}) {
  const scanResult = scanForAlerts({ ...alertData, ...businessData });

  if (!scanResult.needs_action) {
    return `# STATUS CHECK — ${new Date().toISOString().split('T')[0]}\n\n🟢 Sem alertas críticos. Saúde do negócio: ${scanResult.health_score}/100.\n\nContinue o plano.`;
  }

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Você é o CEO Advisor Agent da SmartOps IA.

Alertas detectados que precisam de ação do CEO Breno Luiz:

${scanResult.alerts.map(a => `[${a.urgency}] ${a.data}\nAção recomendada: ${a.action}`).join('\n\n')}

Saúde do negócio: ${scanResult.health_score}/100 — ${scanResult.health_label}

Gere um alerta conciso (máximo 10 linhas):

# ⚠️ CEO ALERT — AÇÃO NECESSÁRIA

## SITUAÇÃO
[O que está acontecendo em 1-2 linhas]

## AÇÃO IMEDIATA (próximos 30 min)
[O que fazer agora — específico e acionável]

## IMPACTO SE NÃO AGIR
[O que acontece se ignorar por mais 24h]

## PRÓXIMO CHECK
[Quando revisar novamente]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { scanForAlerts, generateAlertReportWithClaude, buildTelegramAlert };
