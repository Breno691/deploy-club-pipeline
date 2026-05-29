# Deploy SmartOps Mobile — EasyPanel

## PASSO 1 — Criar tabelas no Supabase (2 min)

1. Abre https://supabase.com → seu projeto
2. Clica em **SQL Editor** → **New query**
3. Cola o conteúdo de `supabase-setup.sql`
4. Clica **Run**

---

## PASSO 2 — Subir código para o GitHub (1 min)

```bash
# No terminal do VS Code:
git add mobile-server/
git commit -m "feat: add mobile data entry server"
git push
```

---

## PASSO 3 — Criar serviço no EasyPanel (5 min)

1. Abre https://easypanel.io → seu servidor
2. Clica **+ New Service** → **App**
3. Configura:
   - **Name:** `smartops-dados`
   - **Source:** GitHub → repositório `deploy-club-pipeline`
   - **Branch:** `main`
   - **Dockerfile path:** `mobile-server/Dockerfile`

4. Em **Environment Variables**, adiciona:
   ```
   SUPABASE_URL      = https://fehnahtgmcppatcwgpiz.supabase.co
   SUPABASE_SERVICE_KEY = [sua service key completa do .env]
   PORT              = 3200
   ```

5. Em **Domains**, clica **Add Domain** → cria subdomínio:
   - `dados.sumjyb.easypanel.host` (ou o nome que preferir)

6. Clica **Deploy**

---

## PASSO 4 — Acessar do celular

Depois do deploy (1-2 min), acesse:
```
https://dados.sumjyb.easypanel.host
```

Salva no **Home Screen** do celular como atalho para acesso rápido.

---

## O que acontece depois

- Lead adicionado no celular → salvo no Supabase
- Agentes locais podem ler do Supabase via API (próxima atualização)
- Dashboard local também pode ler do Supabase

## URL final
`https://dados.sumjyb.easypanel.host`
