/**
 * find_and_send_morro_alto.js — Todos os comércios do Morro Alto, Vespasiano
 * Busca via Tavily + envia email de automação/lean
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { tavily } = require('@tavily/core');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const PROSPECTS_FILE = path.join(__dirname, 'prospects_bh.json');
const LOG_DIR = path.join(__dirname, '../outputs/prospecting');
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const SKIP = ['sentry','example','schema','w3.org','google','facebook','instagram','linkedin',
  'telelistas','guiafacil','yelp','tripadvisor','cnpj.biz','gov.br','jus.br','tjmg','fiemg',
  'sebrae','sindicato','foursquare','mapas','receita.fazenda','tudo.com','apontador'];
const PERSONAL = ['gmail.com','hotmail.com','yahoo.com','outlook.com','bol.com','uol.com.br'];

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const SEARCHES = [
  { q: 'farmácia drogaria "morro alto" vespasiano MG email site contato', setor: 'Farmácia', servico: 'automacao' },
  { q: 'supermercado mercado "morro alto" vespasiano MG email site', setor: 'Supermercado', servico: 'lean' },
  { q: 'clínica médica dentista odontologia "morro alto" vespasiano MG email site', setor: 'Clínica', servico: 'automacao' },
  { q: 'academia fitness "morro alto" vespasiano MG email site', setor: 'Academia', servico: 'automacao' },
  { q: 'oficina mecânica auto center "morro alto" vespasiano MG email site', setor: 'Oficina Mecânica', servico: 'automacao' },
  { q: 'padaria lanchonete restaurante "morro alto" vespasiano MG email site', setor: 'Alimentação', servico: 'lean' },
  { q: 'escola curso profissionalizante "morro alto" vespasiano MG email', setor: 'Educação', servico: 'automacao' },
  { q: 'salão beleza barbearia "morro alto" vespasiano MG email site', setor: 'Salão de Beleza', servico: 'automacao' },
  { q: 'pet shop veterinário "morro alto" vespasiano MG email site', setor: 'Pet Shop', servico: 'automacao' },
  { q: 'construtora reforma obra "morro alto" vespasiano MG email site', setor: 'Construção', servico: 'lean' },
  { q: 'material construção loja "morro alto" vespasiano MG email site', setor: 'Material de Construção', servico: 'lean' },
  { q: 'contabilidade escritório contador "morro alto" vespasiano MG email', setor: 'Contabilidade', servico: 'automacao' },
  { q: 'imobiliária corretor imóveis vespasiano "morro alto" email site', setor: 'Imobiliária', servico: 'automacao' },
  { q: 'transportadora logística vespasiano "morro alto" email site', setor: 'Transporte', servico: 'lean' },
  { q: 'loja comércio varejo "morro alto" vespasiano MG email site contato', setor: 'Comércio', servico: 'automacao' },
  { q: 'empresa serviços vespasiano "morro alto" email contato site', setor: 'Serviços', servico: 'automacao' },
];

function extractEmails(text) {
  const found = (text || '').match(EMAIL_REGEX) || [];
  return [...new Set(found)].filter(e => {
    const d = e.toLowerCase().split('@')[1] || '';
    return !SKIP.some(s => e.toLowerCase().includes(s)) && d.length > 4;
  });
}

function pickBest(emails) {
  const corp = emails.filter(e => !PERSONAL.some(p => e.toLowerCase().includes(p)));
  return corp.length ? corp[0] : (emails[0] || null);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function renderTemplate(p, tplLean, tplAuto) {
  const tpl = p.servico_sugerido === 'lean' ? tplLean : tplAuto;
  return tpl
    .replace(/\{\{NOME\}\}/g, 'prezado')
    .replace(/\{\{EMPRESA\}\}/g, p.empresa)
    .replace(/\{\{SETOR\}\}/g, p.setor);
}

function getSubject(p) {
  return p.servico_sugerido === 'lean'
    ? `${p.empresa}: quanto o retrabalho está custando à sua operação?`
    : `${p.empresa}: sua equipe ainda faz isso na mão?`;
}

function getPlainText(p) {
  if (p.servico_sugerido === 'lean') {
    return `Olá,\n\nSou o Breno da SmartOps IA — consultoria Lean Six Sigma em BH.\n\nEmpresas de ${p.setor} em Vespasiano perdem tempo e dinheiro com processos desorganizados. Faço um diagnóstico gratuito de 30 minutos sem compromisso.\n\nTem interesse?\n\nBreno Luiz — SmartOps IA\n(31) 97203-9180 | smartops-ia.com.br\n\n---\nPara não receber mais, responda "remover".`;
  }
  return `Olá,\n\nSou o Breno da SmartOps IA — automação de processos com IA, aqui em BH/Vespasiano.\n\nEmpresas de ${p.setor} ainda fazem na mão o que poderia ser automático: agendamentos, follow-up, cobranças. Implemento em 1-2 semanas, sem programador.\n\nPara a ${p.empresa}, faço uma avaliação gratuita de processos — mostro exatamente o que automatizar e quanto economiza.\n\nBreno Luiz — SmartOps IA\n(31) 97203-9180 | smartops-ia.com.br\n\n---\nPara não receber mais, responda "remover".`;
}

async function main() {
  const prospects = JSON.parse(fs.readFileSync(PROSPECTS_FILE, 'utf8'));
  const existingEmails = new Set(prospects.map(p => (p.email || '').toLowerCase()));
  const existingEmpresas = new Set(prospects.map(p => (p.empresa || '').toLowerCase()));
  let nextId = Math.max(...prospects.map(p => p.id || 0), 0) + 1;
  const novos = [];

  console.log('\n🔍 SmartOps IA — Morro Alto, Vespasiano: buscando todos os comércios\n');

  for (let i = 0; i < SEARCHES.length; i += 3) {
    const lote = SEARCHES.slice(i, i + 3);
    console.log(`── ${lote.map(s => s.setor).join(' | ')} ──`);

    const resultados = await Promise.all(lote.map(s =>
      tvly.search(s.q, { searchDepth: 'advanced', maxResults: 6 })
        .then(r => ({ s, r }))
        .catch(() => ({ s, r: { results: [] } }))
    ));

    for (const { s, r } of resultados) {
      for (const item of (r.results || [])) {
        const url = (item.url || '').toLowerCase();
        if (SKIP.some(d => url.includes(d))) continue;

        const content = (item.content || '').toLowerCase();
        const title = (item.title || '').toLowerCase();
        const isVespasiano = url.includes('vespasiano') || content.includes('vespasiano') ||
          content.includes('morro alto') || title.includes('vespasiano') || title.includes('morro alto');
        if (!isVespasiano) continue;

        const text = `${item.url} ${item.title} ${item.content}`;
        const emails = extractEmails(text);
        const email = pickBest(emails);
        if (!email) continue;

        const empresa = (item.title || '').split(/[-|–|»]/)[0].trim().substring(0, 60);
        if (empresa.length < 3) continue;

        const emailL = email.toLowerCase();
        const empresaL = empresa.toLowerCase();
        if (existingEmails.has(emailL) || existingEmpresas.has(empresaL)) continue;

        existingEmails.add(emailL);
        existingEmpresas.add(empresaL);

        novos.push({
          id: nextId++,
          empresa,
          setor: s.setor,
          cidade: 'Vespasiano',
          bairro: 'Morro Alto',
          telefone: '', whatsapp: '',
          email, email_confirmado: true, email_fonte: 'tavily_morro_alto',
          contato_responsavel: 'Responsável',
          dor_principal: s.servico === 'automacao'
            ? 'Processos manuais e atendimento sem automação'
            : 'Desperdício e processos desorganizados',
          servico_sugerido: s.servico,
          canal_abordagem: 'email',
          prioridade: 'A',
          status: 'pending',
          data_contato: null,
          observacoes: 'Campanha Morro Alto 2026-06-01',
          site: item.url || '',
        });
        console.log(`  ✅ ${s.setor}: ${empresa} <${email}>`);
      }
    }

    if (i + 3 < SEARCHES.length) await sleep(2000);
  }

  if (novos.length === 0) {
    console.log('\n⚠️  Nenhuma empresa nova encontrada com email válido em Morro Alto.');
    console.log('Motivo: Vespasiano/Morro Alto tem menos presença digital que BH.');
    console.log('Recomendação: abordagem presencial com coleta de email no local.');
    return;
  }

  const todos = [...prospects, ...novos];
  fs.writeFileSync(PROSPECTS_FILE, JSON.stringify(todos, null, 2));
  console.log(`\n💾 ${novos.length} empresas adicionadas\n📧 Disparando emails...\n`);

  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com', port: 587, secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { rejectUnauthorized: false },
  });

  const tplLean = fs.readFileSync(path.join(__dirname, 'templates/email_lean.html'), 'utf8');
  const tplAuto = fs.readFileSync(path.join(__dirname, 'templates/email_automacao.html'), 'utf8');

  let ok = 0, erro = 0;

  for (const p of novos) {
    try {
      await transporter.sendMail({
        from: '"Breno Luiz | SmartOps IA" <breno@smartops-ia.com.br>',
        to: p.email,
        subject: getSubject(p),
        html: renderTemplate(p, tplLean, tplAuto),
        text: getPlainText(p),
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
      erro++;
    }
  }

  fs.writeFileSync(PROSPECTS_FILE, JSON.stringify(todos, null, 2));

  fs.mkdirSync(LOG_DIR, { recursive: true });
  const today = new Date().toISOString().split('T')[0];
  const logFile = path.join(LOG_DIR, `log_${today}.json`);
  const existing = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile, 'utf8')) : [];
  existing.push({ rodada: new Date().toISOString(), campanha: 'morro_alto_vespasiano', enviados: ok, erros: erro });
  fs.writeFileSync(logFile, JSON.stringify(existing, null, 2));

  console.log(`\n📊 Morro Alto concluído:`);
  console.log(`   🏢 Empresas encontradas: ${novos.length}`);
  console.log(`   ✅ Enviados: ${ok}`);
  console.log(`   ❌ Erros: ${erro}`);
}

main().catch(console.error);
