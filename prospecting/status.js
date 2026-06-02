const fs = require('fs');
const path = require('path');

const prospects = JSON.parse(fs.readFileSync(path.join(__dirname, 'prospects_bh.json'), 'utf8'));

const total = prospects.length;
const enviados = prospects.filter(p => p.status === 'enviado').length;
const pendente_ok = prospects.filter(p => p.status === 'pending' && p.email_confirmado).length;
const sem_email = prospects.filter(p => p.status === 'pending' && !p.email_confirmado).length;

console.log('\n📊 STATUS DO FUNIL DE PROSPECÇÃO\n');
console.log(`Total de prospects: ${total}`);
console.log(`✅ Enviados: ${enviados}`);
console.log(`📧 Pendentes (email confirmado): ${pendente_ok}`);
console.log(`🔍 Sem email confirmado: ${sem_email}`);

console.log('\n─── Por Prioridade ───');
['A+', 'A', 'B'].forEach(prio => {
  const n = prospects.filter(p => p.prioridade === prio).length;
  const env = prospects.filter(p => p.prioridade === prio && p.status === 'enviado').length;
  console.log(`  ${prio}: ${n} total | ${env} enviados`);
});

console.log('\n─── Sem email — Buscar manualmente ───');
prospects
  .filter(p => p.status === 'pending' && !p.email_confirmado)
  .sort((a, b) => ({ 'A+': 0, 'A': 1, 'B': 2 }[a.prioridade] - ({ 'A+': 0, 'A': 1, 'B': 2 }[b.prioridade])))
  .forEach(p => {
    console.log(`  [${p.prioridade}] ${p.empresa} — ${p.cidade}/${p.bairro} | ${p.canal_abordagem}`);
  });

console.log('');
