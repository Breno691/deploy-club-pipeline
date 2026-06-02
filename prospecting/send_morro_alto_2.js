require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const PROSPECTS_FILE = path.join(__dirname, 'prospects_bh.json');
const prospects = JSON.parse(fs.readFileSync(PROSPECTS_FILE, 'utf8'));
const existingEmails = new Set(prospects.map(p => (p.email || '').toLowerCase()));
let nextId = Math.max(...prospects.map(p => p.id || 0), 0) + 1;

const candidatos = [
  { empresa: 'Belos Dentes Odontologia', setor: 'Clínica Odontológica', email: 'atendimento@belosdentes.com.br', servico: 'automacao' },
  { empresa: 'Centro Veterinário Vespasiano', setor: 'Clínica Veterinária', email: 'contato@veterinariavespasiano.com.br', servico: 'automacao' },
  { empresa: 'Sttyllo Contabilidade', setor: 'Contabilidade', email: 'contato@sttyllocontabilidade.com.br', servico: 'automacao' },
  { empresa: 'Metal Sider', setor: 'Metalurgia / Indústria', email: 'mariana.ferreira@metalsider.com.br', servico: 'lean' },
];

const novos = candidatos
  .filter(n => !existingEmails.has(n.email.toLowerCase()))
  .map(n => ({
    id: nextId++, ...n,
    cidade: 'Vespasiano', bairro: 'Morro Alto',
    telefone: '', whatsapp: '',
    email_confirmado: true, email_fonte: 'tavily_morro_alto_2',
    contato_responsavel: 'Responsável',
    dor_principal: n.servico === 'automacao' ? 'Processos manuais sem automação' : 'Retrabalho e desperdício',
    canal_abordagem: 'email', prioridade: 'A',
    status: 'pending', data_contato: null,
    observacoes: 'Campanha Morro Alto fase 2 - 2026-06-01',
  }));

if (novos.length === 0) { console.log('Todos já enviados.'); process.exit(0); }

const todos = [...prospects, ...novos];
fs.writeFileSync(PROSPECTS_FILE, JSON.stringify(todos, null, 2));

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com', port: 587, secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  tls: { rejectUnauthorized: false },
});

const tplLean = fs.readFileSync(path.join(__dirname, 'templates/email_lean.html'), 'utf8');
const tplAuto = fs.readFileSync(path.join(__dirname, 'templates/email_automacao.html'), 'utf8');

function render(p) {
  return (p.servico === 'lean' ? tplLean : tplAuto)
    .replace(/\{\{NOME\}\}/g, 'prezado')
    .replace(/\{\{EMPRESA\}\}/g, p.empresa)
    .replace(/\{\{SETOR\}\}/g, p.setor);
}
function subject(p) {
  return p.servico === 'lean'
    ? `${p.empresa}: quanto o retrabalho está custando à sua operação?`
    : `${p.empresa}: sua equipe ainda faz isso na mão?`;
}
function text(p) {
  return p.servico === 'lean'
    ? `Olá,\n\nSou o Breno da SmartOps IA — Lean Six Sigma em BH/Vespasiano.\nFaço diagnóstico gratuito de 30 minutos sem compromisso.\n\nBreno Luiz | (31) 97203-9180 | smartops-ia.com.br\n\nPara não receber mais, responda "remover".`
    : `Olá,\n\nSou o Breno da SmartOps IA — automação de processos com IA em BH/Vespasiano.\nImplemento em 1-2 semanas sem programador. Avaliação gratuita para a ${p.empresa}.\n\nBreno Luiz | (31) 97203-9180 | smartops-ia.com.br\n\nPara não receber mais, responda "remover".`;
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  console.log(`\n📧 Enviando ${novos.length} emails — Morro Alto fase 2\n`);
  let ok = 0;
  for (const p of novos) {
    try {
      await transporter.sendMail({
        from: '"Breno Luiz | SmartOps IA" <breno@smartops-ia.com.br>',
        to: p.email, subject: subject(p), html: render(p), text: text(p),
        replyTo: 'breno@smartops-ia.com.br',
      });
      const idx = todos.findIndex(x => x.id === p.id);
      todos[idx].status = 'enviado';
      todos[idx].data_contato = new Date().toISOString();
      console.log(`  ✅ ${p.setor} | ${p.empresa} <${p.email}>`);
      ok++;
      await sleep(4000 + Math.random() * 4000);
    } catch (e) {
      console.log(`  ❌ ${p.empresa}: ${e.message}`);
    }
  }
  fs.writeFileSync(PROSPECTS_FILE, JSON.stringify(todos, null, 2));
  console.log(`\n✅ Enviados: ${ok}/${novos.length}`);
})();
