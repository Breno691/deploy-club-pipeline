/**
 * find_emails.js — Busca automática de emails das empresas no prospects_bh.json
 * Usa Tavily AI para pesquisar site + contato de cada empresa
 * Roda: node prospecting/find_emails.js (da raiz do projeto)
 *       ou: node find_emails.js (dentro de prospecting/)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { tavily } = require('@tavily/core');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const fs = require('fs');
const path = require('path');

const PROSPECTS_FILE = path.join(__dirname, 'prospects_bh.json');
const LOG_FILE = path.join(__dirname, '../outputs/prospecting/find_emails_log.json');
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const SKIP_DOMAINS = ['sentry.io', 'example.com', 'email.com', 'test.com', 'schema.org', 'w3.org'];
const BATCH_SIZE = 3;
const DELAY_MS = 2500;

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

function extractEmails(text) {
  if (!text) return [];
  const found = text.match(EMAIL_REGEX) || [];
  return [...new Set(found)].filter(e => {
    const domain = e.split('@')[1]?.toLowerCase() || '';
    return !SKIP_DOMAINS.some(skip => domain.includes(skip));
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function tryFetchContactPage(url) {
  const contactPaths = ['/contato', '/contact', '/fale-conosco', '/fale-com-a-gente', '/sobre', '/about'];
  for (const p of contactPaths) {
    try {
      const base = url.replace(/\/$/, '');
      const res = await fetch(base + p, { timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) {
        const html = await res.text();
        const emails = extractEmails(html);
        if (emails.length > 0) return { emails, source: base + p };
      }
    } catch { /* ignore */ }
  }
  // Try root page too
  try {
    const res = await fetch(url, { timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (res.ok) {
      const html = await res.text();
      const emails = extractEmails(html);
      if (emails.length > 0) return { emails, source: url };
    }
  } catch { /* ignore */ }
  return null;
}

function pickBestEmail(emails, empresa) {
  if (!emails || emails.length === 0) return null;
  // Prefer emails that look like company emails (not personal)
  const personal = ['gmail', 'hotmail', 'yahoo', 'outlook', 'bol.com', 'uol.com'];
  const corporate = emails.filter(e => !personal.some(p => e.toLowerCase().includes(p)));
  return corporate.length > 0 ? corporate[0] : emails[0];
}

async function findEmailForProspect(p) {
  const query = `"${p.empresa}" ${p.cidade} email contato`;
  console.log(`  🔍 Buscando: ${p.empresa} — ${p.cidade}`);

  try {
    const result = await tvly.search(query, {
      searchDepth: 'advanced',
      maxResults: 5,
      includeAnswer: false,
    });

    // Collect all text from results
    const allText = [
      ...(result.results || []).map(r => `${r.url} ${r.title} ${r.content}`),
    ].join('\n');

    const emailsFromSearch = extractEmails(allText);
    const bestEmail = pickBestEmail(emailsFromSearch, p.empresa);

    // Also try to find the company website URL
    const websiteResult = (result.results || []).find(r => {
      const url = (r.url || '').toLowerCase();
      return !url.includes('facebook') && !url.includes('instagram') &&
             !url.includes('linkedin') && !url.includes('google') &&
             !url.includes('cnpj') && !url.includes('tudo');
    });
    const websiteUrl = websiteResult?.url || null;

    let fetchedEmails = null;
    if (!bestEmail && websiteUrl) {
      console.log(`    🌐 Tentando site: ${websiteUrl}`);
      fetchedEmails = await tryFetchContactPage(websiteUrl);
    }

    const finalEmail = bestEmail ||
      (fetchedEmails ? pickBestEmail(fetchedEmails.emails, p.empresa) : null);

    return {
      id: p.id,
      empresa: p.empresa,
      email: finalEmail,
      email_source: finalEmail
        ? (emailsFromSearch.includes(finalEmail) ? 'tavily_search' : 'website_scrape')
        : null,
      website: websiteUrl,
      all_emails_found: [...new Set([...emailsFromSearch, ...(fetchedEmails?.emails || [])])],
    };
  } catch (err) {
    console.log(`    ❌ Erro em ${p.empresa}: ${err.message}`);
    return { id: p.id, empresa: p.empresa, email: null, erro: err.message };
  }
}

async function main() {
  const prospects = JSON.parse(fs.readFileSync(PROSPECTS_FILE, 'utf8'));
  const needEmail = prospects.filter(p => p.status === 'pending' && (!p.email || !p.email_confirmado));

  console.log(`\n📧 Busca automática de emails — SmartOps IA`);
  console.log(`🎯 ${needEmail.length} empresas sem email confirmado\n`);

  if (needEmail.length === 0) {
    console.log('✅ Todas as empresas já têm email confirmado!');
    return;
  }

  const log = [];
  let found = 0;
  let notFound = 0;

  // Process in batches
  for (let i = 0; i < needEmail.length; i += BATCH_SIZE) {
    const batch = needEmail.slice(i, i + BATCH_SIZE);
    console.log(`\n── Lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(needEmail.length / BATCH_SIZE)} ──`);

    const results = await Promise.all(batch.map(p => findEmailForProspect(p)));

    for (const r of results) {
      const idx = prospects.findIndex(p => p.id === r.id);
      if (idx === -1) continue;

      log.push(r);

      if (r.email) {
        prospects[idx].email = r.email;
        prospects[idx].email_confirmado = true;
        prospects[idx].email_fonte = r.email_source;
        if (r.website && !prospects[idx].site) prospects[idx].site = r.website;
        console.log(`  ✅ ${r.empresa}: ${r.email}`);
        found++;
      } else {
        if (r.website && !prospects[idx].site) prospects[idx].site = r.website;
        console.log(`  ⚠️  ${r.empresa}: email não encontrado${r.website ? ` (site: ${r.website})` : ''}`);
        notFound++;
      }
    }

    // Save after each batch (incremental)
    fs.writeFileSync(PROSPECTS_FILE, JSON.stringify(prospects, null, 2));

    if (i + BATCH_SIZE < needEmail.length) {
      process.stdout.write(`  ⏳ Aguardando ${DELAY_MS / 1000}s...\n`);
      await sleep(DELAY_MS);
    }
  }

  // Save log
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  const today = new Date().toISOString().split('T')[0];
  const existingLog = fs.existsSync(LOG_FILE) ? JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')) : [];
  existingLog.push({ data: new Date().toISOString(), encontrados: found, nao_encontrados: notFound, detalhes: log });
  fs.writeFileSync(LOG_FILE, JSON.stringify(existingLog, null, 2));

  console.log(`\n📊 Resultado final:`);
  console.log(`  ✅ Emails encontrados: ${found}`);
  console.log(`  ⚠️  Não encontrados:   ${notFound}`);
  console.log(`\n📧 Prospects prontos para enviar: ${prospects.filter(p => p.email_confirmado && p.status === 'pending').length}`);
  console.log(`\nPróximo passo: node prospecting/send_daily.js`);
}

main().catch(console.error);
