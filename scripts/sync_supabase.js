require('dotenv').config();
const { getLeads, getClients, getFinancial } = require('../lib/data');

async function sync() {
  console.log('\nSmartOps IA — Sync Supabase → local\n');
  const start = Date.now();

  const [leads, clients, financial] = await Promise.all([
    getLeads(),
    getClients(),
    getFinancial(),
  ]);

  const real_leads   = leads.filter(l => !l._exemplo);
  const real_clients = clients.filter(c => !c._exemplo);

  console.log(`  ✓ Leads:     ${real_leads.length} registros`);
  console.log(`  ✓ Clientes:  ${real_clients.length} registros`);
  console.log(`  ✓ Financeiro: receita R$ ${financial.receita_total || 0} | custos R$ ${financial.custos_totais || 600}`);
  console.log(`\n  Arquivos atualizados em data/`);
  console.log(`  Tempo: ${Date.now() - start}ms\n`);
}

sync().catch(err => {
  console.error('Sync error:', err.message);
  process.exit(1);
});
