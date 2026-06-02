/**
 * find_and_send_bh.js — Busca empresas pequenas de BH + envia emails de automação
 * Foco: clínicas, contabilidades, imobiliárias, pet shops, cursos
 * Roda: node prospecting/find_and_send_bh.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { tavily } = require('@tavily/core');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const PROSPECTS_FILE = path.join(__dirname, 'prospects_bh.json');
const LOG_DIR = path.join(__dirname, '../outputs/prospecting');
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const SKIP_DOMAINS = ['sentry.io','example.com','schema.org','w3.org','google.com','facebook.com',
  'instagram.com','linkedin.com','guiafacil.com','telelistas.net','yelp.com','tripadvisor.com',
  'foursquare.com','mapas.google','cnpj.biz','receita.fazenda','gov.br','jus.br','tjmg.jus.br',
  'fiemg','sebrae','sindicato','associacao'];
const SKIP_PERSONAL = ['gmail.com','hotmail.com','yahoo.com','outlook.com','bol.com','uol.com.br','terra.com.br'];

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

// Setores com queries Tavily otimizadas para encontrar emails reais de pequenas empresas em BH
const SEARCHES = [
  // CLÍNICAS — automação de agendamento
  { setor: 'Clínica Médica', servico: 'automacao', prioridade: 'A+',
    query: 'clínica médica belo horizonte savassi funcionários email contato agendamento site' },
  { setor: 'Clínica Odontológica', servico: 'automacao', prioridade: 'A+',
    query: 'consultório odontológico dentista belo horizonte pampulha email site contato' },
  { setor: 'Clínica de Estética', servico: 'automacao', prioridade: 'A+',
    query: 'clínica estética belo horizonte buritis belvedere email agendamento site' },
  { setor: 'Clínica de Fisioterapia', servico: 'automacao', prioridade: 'A+',
    query: 'clínica fisioterapia reabilitação belo horizonte email site contato' },
  { setor: 'Clínica Veterinária', servico: 'automacao', prioridade: 'A',
    query: 'clínica veterinária pet shop belo horizonte savassi buritis email site' },

  // CONTABILIDADE — automação de processos
  { setor: 'Escritório de Contabilidade', servico: 'automacao', prioridade: 'A+',
    query: 'escritório contabilidade contador belo horizonte savassi lourdes email site contato' },
  { setor: 'Escritório de Contabilidade', servico: 'automacao', prioridade: 'A+',
    query: 'contabilidade empresarial belo horizonte venda nova barreiro email comercial site' },

  // IMOBILIÁRIAS
  { setor: 'Imobiliária', servico: 'automacao', prioridade: 'A+',
    query: 'imobiliária corretora imóveis belo horizonte pampulha belvedere email site contato' },
  { setor: 'Imobiliária', servico: 'automacao', prioridade: 'A',
    query: 'imobiliária venda nova nordeste belo horizonte email site contato corretora' },

  // CURSOS E ESCOLAS
  { setor: 'Escola de Cursos Profissionalizantes', servico: 'automacao', prioridade: 'A+',
    query: 'escola cursos profissionalizantes belo horizonte email matrícula site contato' },
  { setor: 'Escola de Idiomas', servico: 'automacao', prioridade: 'A',
    query: 'escola idiomas inglês belo horizonte pampulha savassi email site contato' },

  // PET SHOP / VETERINÁRIO
  { setor: 'Pet Shop', servico: 'automacao', prioridade: 'A',
    query: 'pet shop banho tosa belo horizonte email site contato agendamento' },

  // SALÃO / ESTÉTICA
  { setor: 'Salão de Beleza', servico: 'automacao', prioridade: 'A',
    query: 'salão beleza barbearia belo horizonte savassi buritis email site agendamento' },

  // DISTRIBUIDORAS PEQUENAS — lean
  { setor: 'Distribuidora', servico: 'lean', prioridade: 'A',
    query: 'distribuidora atacado belo horizonte venda nova email site contato pequena empresa' },

  // OFICINAS
  { setor: 'Oficina Mecânica', servico: 'automacao', prioridade: 'A',
    query: 'oficina mecânica auto center belo horizonte email site contato ordem serviço' },
];

function extractEmails(text) {
  if (!text) return [];
  const found = text.match(EMAIL_REGEX) || [];
  return [...new Set(found)].filter(e => {
    const lower = e.toLowerCase();
    const domain = lower.split('@')[1] || '';
    return !SKIP_DOMAINS.some(s => lower.includes(s)) && domain.length > 4;
  });
}

function pickBestEmail(emails) {
  if (!emails || emails.length === 0) return null;
  const corporate = emails.filter(e => !SKIP_PERSONAL.some(p => e.toLowerCase().includes(p)));
  return corporate.length > 0 ? corporate[0] : emails[0];
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function getNextId(prospects) {
  return Math.max(...prospects.map(p => p.id || 0), 0) + 1;
}

function buildProspect(id, empresa, setor, email, servico, prioridade, site) {
  return {
    id, empresa, setor,
    cidade: 'Belo Horizonte',
    bairro: '',
    telefone: '', whatsapp: '',
    email, email_confirmado: true, email_fonte: 'tavily_bh_campaign',
    contato_responsavel: 'Responsável',
    dor_principal: servico === 'automacao'
      ? 'Processos manuais, agendamentos e follow-up sem automação'
      : 'Retrabalho, desperdício e processos desorganizados',
    servico_sugerido: servico,
    canal_abordagem: 'email',
    prioridade,
    status: 'pending',
    data_contato: null,
    observacoes: 'Adicionado pela campanha BH automação 2026-06-01',
    site: site || '',
  };
}

async function searchAndExtract(s) {
  try {
    const result = await tvly.search(s.query, { searchDepth: 'advanced', maxResults: 6 });
    const prospects = [];

    for (const r of (result.results || [])) {
      const url = r.url || '';
      const urlLower = url.toLowerCase();

      // Pular diretórios e sites de listagem
      if (SKIP_DOMAINS.some(d => urlLower.includes(d))) continue;
      // Pular se não parece site de empresa real
      if (urlLower.includes('contagem') || urlLower.includes('betim') ||
          urlLower.includes('sabara') || urlLower.includes('nova-lima')) continue;

      const text = `${url} ${r.title || ''} ${r.content || ''}`;
      const emails = extractEmails(text);
      const email = pickBestEmail(emails);
      if (!email) continue;

      // Extrair nome da empresa do título ou URL
      const empresa = r.title
        ? r.title.split(/[-|–]/)[0].trim().replace(/\s+/g, ' ').substring(0, 60)
        : url.replace(/https?:\/\/(www\.)?/, '').split('/')[0].split('.')[0];

      if (empresa.length < 3) continue;

      prospects.push({ empresa, email, site: url });
    }

    return prospects;
  } catch (err) {
    console.log(`  ❌ Erro na busca [${s.setor}]: ${err.message}`);
    return [];
  }
}

async function main() {
  const prospects = JSON.parse(fs.readFileSync(PROSPECTS_FILE, 'utf8'));
  const existingEmails = new Set(prospects.map(p => (p.email || '').toLowerCase()));
  const existingEmpresas = new Set(prospects.map(p => (p.empresa || '').toLowerCase()));

  console.log('\n🔍 SmartOps IA — Campanha BH: Automação para pequenas empresas');
  console.log(`📋 ${SEARCHES.length} buscas programadas\n`);

  const novos = [];
  let nextId = getNextId(prospects);

  // Executar buscas em lotes de 3
  for (let i = 0; i < SEARCHES.length; i += 3) {
    const lote = SEARCHES.slice(i, i + 3);
    console.log(`── Buscando: ${lote.map(s => s.setor).join(' | ')} ──`);

    const resultados = await Promise.all(lote.map(s => searchAndExtract(s).then(rs => ({ s, rs }))));

    for (const { s, rs } of resultados) {
      for (const r of rs) {
        const emailLower = r.email.toLowerCase();
        const empresaLower = r.empresa.toLowerCase();

        // Evitar duplicatas
        if (existingEmails.has(emailLower) || existingEmpresas.has(empresaLower)) continue;

        const p = buildProspect(nextId++, r.empresa, s.setor, r.email, s.servico, s.prioridade, r.site);
        novos.push(p);
        existingEmails.add(emailLower);
        existingEmpresas.add(empresaLower);
        console.log(`  ✅ ${s.setor}: ${r.empresa} <${r.email}>`);
      }
    }

    if (i + 3 < SEARCHES.length) await sleep(2000);
  }

  if (novos.length === 0) {
    console.log('\n⚠️  Nenhuma nova empresa encontrada com email válido.');
    return;
  }

  // Salvar no JSON
  const todosProspects = [...prospects, ...novos];
  fs.writeFileSync(PROSPECTS_FILE, JSON.stringify(todosProspects, null, 2));
  console.log(`\n💾 ${novos.length} novas empresas adicionadas ao prospects_bh.json`);

  // Disparar emails imediatamente
  console.log(`\n📧 Disparando emails agora...\n`);

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

  const templateLean = fs.readFileSync(path.join(__dirname, 'templates/email_lean.html'), 'utf8');
  const templateAuto = fs.readFileSync(path.join(__dirname, 'templates/email_automacao.html'), 'utf8');

  function renderTemplate(p) {
    const tpl = p.servico_sugerido === 'lean' ? templateLean : templateAuto;
    return tpl
      .replace(/\{\{NOME\}\}/g, p.contato_responsavel || 'prezado')
      .replace(/\{\{EMPRESA\}\}/g, p.empresa)
      .replace(/\{\{SETOR\}\}/g, p.setor);
  }

  function getSubject(p) {
    if (p.servico_sugerido === 'lean') return `${p.empresa}: quanto o retrabalho está custando à sua operação?`;
    return `${p.empresa}: sua equipe ainda agenda e faz follow-up na mão?`;
  }

  function plainText(p) {
    if (p.servico_sugerido === 'lean') {
      return `Olá,\n\nSou o Breno da SmartOps IA — consultoria de Lean Six Sigma em BH.\n\nEmpresas de ${p.setor} costumam perder tempo com retrabalho e processos desorganizados. Faço um diagnóstico gratuito de 30 minutos para mostrar onde estão as perdas na ${p.empresa}.\n\nTem interesse?\n\nAbraço,\nBreno Luiz\nSmartOps IA — (31) 97203-9180\nsmartops-ia.com.br\n\n---\nPara não receber mais, responda "remover".`;
    }
    return `Olá,\n\nSou o Breno da SmartOps IA — especialista em automação de processos com IA em BH.\n\nA maioria das empresas de ${p.setor} ainda faz agendamentos, follow-up e cobranças na mão. Automatizo isso em 1-2 semanas, sem programador.\n\nPara a ${p.empresa}, faço uma avaliação gratuita de processos — mostro exatamente o que dá para automatizar.\n\nSeria interessante conversar?\n\nAbraço,\nBreno Luiz\nSmartOps IA — (31) 97203-9180\nsmartops-ia.com.br\n\n---\nPara não receber mais, responda "remover".`;
  }

  let enviados = 0;
  let erros = 0;
  const log = [];

  for (const p of novos) {
    try {
      await transporter.sendMail({
        from: '"Breno Luiz | SmartOps IA" <breno@smartops-ia.com.br>',
        to: p.email,
        subject: getSubject(p),
        html: renderTemplate(p),
        text: plainText(p),
        replyTo: 'breno@smartops-ia.com.br',
      });

      const idx = todosProspects.findIndex(x => x.id === p.id);
      todosProspects[idx].status = 'enviado';
      todosProspects[idx].data_contato = new Date().toISOString();

      console.log(`  ✅ ${p.setor} | ${p.empresa} <${p.email}>`);
      log.push({ empresa: p.empresa, email: p.email, status: 'ok', setor: p.setor });
      enviados++;

      await sleep(4000 + Math.random() * 5000);
    } catch (err) {
      console.log(`  ❌ ${p.empresa}: ${err.message}`);
      log.push({ empresa: p.empresa, email: p.email, status: 'erro', erro: err.message });
      erros++;
    }
  }

  // Salvar JSON atualizado com status enviado
  fs.writeFileSync(PROSPECTS_FILE, JSON.stringify(todosProspects, null, 2));

  // Log
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const today = new Date().toISOString().split('T')[0];
  const logFile = path.join(LOG_DIR, `log_${today}.json`);
  const existingLog = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile, 'utf8')) : [];
  existingLog.push({ rodada: new Date().toISOString(), campanha: 'bh_automacao', enviados, erros, detalhes: log });
  fs.writeFileSync(logFile, JSON.stringify(existingLog, null, 2));

  console.log(`\n📊 Campanha BH concluída:`);
  console.log(`   🏢 Novas empresas encontradas: ${novos.length}`);
  console.log(`   ✅ Emails enviados: ${enviados}`);
  console.log(`   ❌ Erros: ${erros}`);
}

main().catch(console.error);
