require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const PROSPECTS_FILE = path.join(__dirname, 'prospects_bh.json');
const LOG_DIR = path.join(__dirname, '../outputs/prospecting');
const DAILY_LIMIT = parseInt(process.env.DAILY_LIMIT || '15');

const templateLean = fs.readFileSync(path.join(__dirname, 'templates/email_lean.html'), 'utf8');
const templateAuto = fs.readFileSync(path.join(__dirname, 'templates/email_automacao.html'), 'utf8');

function renderTemplate(servico, prospect) {
  const tpl = servico === 'lean' ? templateLean : templateAuto;
  const nome = prospect.contato_responsavel || 'prezado';
  return tpl
    .replace(/\{\{NOME\}\}/g, nome)
    .replace(/\{\{EMPRESA\}\}/g, prospect.empresa)
    .replace(/\{\{SETOR\}\}/g, prospect.setor);
}

function getSubject(servico, empresa) {
  if (servico === 'lean') {
    return `${empresa}: quanto o retrabalho está custando à sua operação?`;
  }
  return `${empresa}: sua equipe ainda faz isso na mão?`;
}

function plainText(servico, prospect) {
  const nome = prospect.contato_responsavel || 'prezado';
  if (servico === 'lean') {
    return `Olá ${nome},

Sou o Breno, da SmartOps IA — consultoria de Lean Six Sigma em BH.

Trabalho com empresas de ${prospect.setor} que perdem tempo e dinheiro com processos desorganizados: retrabalho constante, gargalos que ninguém resolve, dependência de pessoas-chave.

Resultado típico: -30% em custo operacional em 90 dias.

Para mostrar como funciona para a ${prospect.empresa}, faço um diagnóstico gratuito de 30 minutos — sem compromisso.

Tem interesse?

Abraço,
Breno Luiz
SmartOps IA — Lean Six Sigma + Automação com IA
(31) 97203-9180
smartops-ia.com.br

---
Para não receber mais este tipo de mensagem, responda com "remover".`;
  }
  return `Olá ${nome},

Sou o Breno, da SmartOps IA — consultoria de automação de processos com IA em BH.

Empresas de ${prospect.setor} geralmente fazem na mão tarefas que poderiam ser automáticas: follow-up, propostas, agendamentos, relatórios.

A gente implementa automações que funcionam 24h, sem programador e sem software caro. Até 40h/mês liberadas por colaborador.

Para a ${prospect.empresa}, faço uma avaliação gratuita de processos — mostro exatamente o que automatizar e quanto isso economiza.

Seria interessante conversar?

Abraço,
Breno Luiz
SmartOps IA — Lean Six Sigma + Automação com IA
(31) 97203-9180
smartops-ia.com.br

---
Para não receber mais este tipo de mensagem, responda com "remover".`;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const prospects = JSON.parse(fs.readFileSync(PROSPECTS_FILE, 'utf8'));
  const today = new Date().toISOString().split('T')[0];

  // Contagem de hoje (evitar reenvio)
  const sentToday = prospects.filter(p => p.data_contato && p.data_contato.startsWith(today)).length;
  if (sentToday >= DAILY_LIMIT) {
    console.log(`✅ Limite diário atingido: ${sentToday}/${DAILY_LIMIT} emails já enviados hoje.`);
    return;
  }

  const priorityOrder = { 'A+': 0, 'A': 1, 'B': 2, 'C': 3 };
  const pending = prospects
    .filter(p => p.status === 'pending' && p.email && p.email_confirmado === true)
    .sort((a, b) => (priorityOrder[a.prioridade] ?? 9) - (priorityOrder[b.prioridade] ?? 9));

  const semEmail = prospects.filter(p => p.status === 'pending' && (!p.email || !p.email_confirmado)).length;

  if (pending.length === 0) {
    console.log('⚠️  Nenhum prospect com email confirmado. Todos precisam ter email_confirmado: true.');
    console.log(`📋 Aguardando email: ${semEmail} empresas — edite prospects_bh.json.`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'breno@smartops-ia.com.br',
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  const toSend = pending.slice(0, DAILY_LIMIT - sentToday);
  const results = [];

  console.log(`\n📧 SmartOps IA — Envio de prospecção ${today}`);
  console.log(`🎯 ${toSend.length} emails para enviar (limite: ${DAILY_LIMIT}/dia)\n`);

  for (const p of toSend) {
    try {
      const html = renderTemplate(p.servico_sugerido, p);
      const text = plainText(p.servico_sugerido, p);
      const subject = getSubject(p.servico_sugerido, p.empresa);

      await transporter.sendMail({
        from: `"Breno Luiz | SmartOps IA" <${process.env.SMTP_USER || 'breno@smartops-ia.com.br'}>`,
        to: p.email,
        subject,
        html,
        text,
        replyTo: process.env.SMTP_USER || 'breno@smartops-ia.com.br',
      });

      const idx = prospects.findIndex(x => x.id === p.id);
      prospects[idx].status = 'enviado';
      prospects[idx].data_contato = new Date().toISOString();
      prospects[idx].email_enviado_tipo = p.servico_sugerido;

      results.push({ empresa: p.empresa, email: p.email, status: 'ok', tipo: p.servico_sugerido });
      console.log(`✅ ${p.prioridade} | ${p.empresa} <${p.email}> [${p.servico_sugerido}]`);

      await sleep(4000 + Math.random() * 6000);
    } catch (err) {
      results.push({ empresa: p.empresa, email: p.email, status: 'erro', erro: err.message });
      console.error(`❌ ${p.empresa}: ${err.message}`);
    }
  }

  fs.writeFileSync(PROSPECTS_FILE, JSON.stringify(prospects, null, 2));

  fs.mkdirSync(LOG_DIR, { recursive: true });
  const logFile = path.join(LOG_DIR, `log_${today}.json`);
  const existingLog = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile, 'utf8')) : [];
  existingLog.push({
    rodada: new Date().toISOString(),
    enviados: results.filter(r => r.status === 'ok').length,
    erros: results.filter(r => r.status === 'erro').length,
    detalhes: results,
  });
  fs.writeFileSync(logFile, JSON.stringify(existingLog, null, 2));

  const ok = results.filter(r => r.status === 'ok').length;
  const err = results.filter(r => r.status === 'erro').length;
  const restante = prospects.filter(p => p.status === 'pending' && p.email_confirmado).length;
  const aguardando = prospects.filter(p => p.status === 'pending' && !p.email_confirmado).length;

  console.log(`\n📊 Resumo:`);
  console.log(`   ✅ Enviados hoje: ${ok}`);
  console.log(`   ❌ Erros: ${err}`);
  console.log(`   ⏳ Pendentes confirmados: ${restante}`);
  console.log(`   🔍 Aguardando email: ${aguardando} — edite prospects_bh.json`);
  console.log(`\n💾 Log salvo em: ${logFile}`);
}

main().catch(console.error);
