# PLANO DA SEMANA — SmartOps IA
**Semana:** 02 a 07 de Junho 2026  
**Objetivo:** Primeiro cliente fechado. Meta: 3 reuniões agendadas esta semana.

---

## 🚨 URGENTE — HOJE (02/06)

| # | Ação | Tempo | Como |
|---|------|-------|------|
| 1 | **Configurar SMTP no n8n** | 5 min | n8n → Credentials → New → SMTP → smtp.zoho.com / 587 / breno@smartops-ia.com.br / senha Zoho |
| 2 | **Verificar DKIM no Zoho Mail** | 5 min | Zoho Mail Admin → Domains → "Verificar todos os registros" |
| 3 | **Instalar dependências prospecção** | 2 min | `cd prospecting && npm install` |
| 4 | **Buscar emails dos 8 rascunhos sem destinatário** | 30 min | Abrir cada empresa no Google, site/contato, copiar email |
| 5 | **Confirmar email Distribuidora Pampulha** | 1 min | Email confirmado: distribuidora@distribuidorapampulha.com.br — marcar email_confirmado: true e enviar |

---

## 📅 SEGUNDA (02/06) — Configurar + Primeiro envio

- [ ] SMTP n8n configurado
- [ ] DKIM verificado
- [ ] npm install em prospecting/
- [ ] Atualizar emails confirmados no prospects_bh.json
- [ ] Rodar: `node prospecting/send_daily.js` — primeiro lote

---

## 📅 TERÇA (03/06) — Vespasiano Presencial + Emails

**Manhã (presencial):**
- [ ] **CRD Construções** — visita presencial em Nova Pampulha
- [ ] **Metalúrgica da região** — pesquisar no Distrito Industrial de Vespasiano

**Tarde:**
- [ ] Buscar emails das empresas sem contato (Google Maps, sites)
- [ ] Atualizar prospects_bh.json com novos emails encontrados
- [ ] `node prospecting/send_daily.js` — segundo lote

---

## 📅 QUARTA (04/06) — LinkedIn + Emails

- [ ] **Carbolog** — mensagem direta no LinkedIn
- [ ] Envio automático diário: `node prospecting/send_daily.js`
- [ ] Responder qualquer retorno de email com convite para diagnóstico gratuito

---

## 📅 QUINTA (05/06) — Follow-up + Conteúdo

- [ ] Follow-up nos que abriram o email (sem resposta ainda)
- [ ] Publicar no Instagram: "Como descobrimos 3 gargalos em 30 minutos" (stories)
- [ ] `node prospecting/send_daily.js` — lote do dia

---

## 📅 SEXTA (06/06) — Reuniões + Balanço

- [ ] Realizar diagnósticos gratuitos agendados
- [ ] Enviar propostas para quem fizer diagnóstico
- [ ] `node prospecting/send_daily.js` — lote do dia
- [ ] Revisar respostas e adicionar novos prospects

---

## 📅 SÁBADO (07/06) — Planejamento próxima semana

- [ ] `node prospecting/status.js` — ver números da semana
- [ ] Adicionar 10 novos prospects ao JSON
- [ ] Planejar a próxima semana

---

## 🤖 AUTOMAÇÃO DIÁRIA (já configurada)

O script `prospecting/send_daily.js` envia automaticamente até 15 emails/dia:
- Prioridade: A+ → A → B
- Alterna templates: Lean e Automação por setor
- Registra tudo em `outputs/prospecting/log_YYYY-MM-DD.json`
- Para ver status: `node prospecting/status.js`

**Para rodar todo dia automaticamente via n8n:**
1. n8n → New Workflow → Schedule Trigger (todo dia 8h)
2. Execute Command → `cd /caminho/prospecting && node send_daily.js`

---

## 📊 MÉTRICAS DA SEMANA

| Métrica | Meta |
|---------|------|
| Emails enviados | 60+ |
| Respostas recebidas | 5+ |
| Diagnósticos agendados | 3 |
| Diagnósticos realizados | 2 |
| Propostas enviadas | 1 |
| Clientes fechados | 1 |

---

## 📋 EMPRESAS PRIORITÁRIAS VESPASIANO (abordagem direta)

| Empresa | Prioridade | Canal | Dor | Status |
|---------|-----------|-------|-----|--------|
| Carbolog | A+ | LinkedIn | Rastreamento manual | Buscar perfil |
| CRD Construções | A+ | Presencial | Retrabalho obra | Visitar terça |
| Distribuidora Pampulha | A+ | Email ✅ | Logística/estoque | Enviar hoje |
| Metalúrgica Vespasiano | A+ | Email | Setup/refugo | Buscar email |
| Multi Fitness | A+ | Email | Agendamento manual | Buscar email |

---

## 📋 EMPRESAS PRIORITÁRIAS BH (email)

| Empresa | Prioridade | Serviço | Bairro |
|---------|-----------|---------|--------|
| Escritório de Advocacia | A+ | Automação | Lourdes |
| Indústria de Embalagens | A+ | Lean | Dist. Industrial |
| Distribuidora Alvorada | A+ | Lean | Venda Nova |
| Transportadora Cargas | A+ | Automação | Venda Nova |
| Escritório Contábil | A+ | Automação | Savassi |

---

## 🔧 COMANDOS RÁPIDOS

```bash
# Ver status dos prospects
node prospecting/status.js

# Enviar emails do dia
node prospecting/send_daily.js

# Adicionar novo prospect manualmente
# Edite prospecting/prospects_bh.json e adicione o objeto

# Ver logs de envio
cat outputs/prospecting/log_YYYY-MM-DD.json
```

---

## 💡 COMO ENCONTRAR EMAILS

1. **Google Maps** → buscar empresa → site → página de contato
2. **Site da empresa** → rodapé ou "Contato"
3. **LinkedIn** → perfil da empresa → contato
4. **CNPJ.biz** → buscar CNPJ → dados cadastrais (às vezes tem email)
5. **Guia Fácil / TrueLocal** → buscar empresa por cidade

Quando encontrar o email:
1. Abra `prospecting/prospects_bh.json`
2. Preencha `"email": "email@empresa.com.br"`
3. Mude `"email_confirmado": true`
4. Rode `node prospecting/send_daily.js`
