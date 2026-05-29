# SmartOps IA — Visual References & Design System

*Referências visuais para geração automática de criativos de alta performance.*
*Fonte: análise de padrões Dribbble, Behance, Konecta App pack + diretrizes de conversão.*

---

## FILOSOFIA PRINCIPAL

> Nunca criar anúncios que pareçam anúncios.
> Criar conteúdos que pareçam dashboards, interfaces, relatórios, documentos internos ou resultados reais.
> O usuário deve sentir: **"Isso parece algo que alguém realmente usa."**

**Teste obrigatório antes de finalizar o criativo:**
1. A mensagem é entendida em menos de 2 segundos?
2. O visual parece conteúdo ou anúncio?
3. Existe um resultado concreto visível?
4. O anúncio funcionaria sem legenda?
5. Continua legível em tela pequena?

---

## HIERARQUIA VISUAL (ordem de atenção)

```
1. Resultado visual (número, métrica, sintoma)
2. Headline (máx 8 palavras, Bebas Neue, uppercase)
3. Prova (métrica, caso, timeline)
4. CTA (máx 4 palavras)
```

O elemento visual principal deve ocupar **50–70% da composição**.

---

## OS 5 FORMATOS PRIORITÁRIOS

### Prioridade 1 — Dashboard Realista
**Quando usar:** Prova de resultado, métricas, comparativo antes/depois

Elementos obrigatórios:
- Top bar estilo app (bolinhas red/yellow/green + título + badge LIVE)
- 3 metric cards em linha (número grande + label + variação)
- Painel de status com itens classificados (crítico/atenção/ok)
- Timeline de metodologia (Done/Active/Pending)
- Footer com brand + CTA

Referências visuais: Linear, Vercel Dashboard, Notion

---

### Prioridade 2 — Mockup + Copy (Phone/Screen)
**Quando usar:** Conversão direta, CTA WhatsApp, mostrar produto em uso

Elementos obrigatórios:
- Coluna esquerda: mockup de celular (240×500px+) com conteúdo real
- Coluna direita: headline grande + subtext + benefits list
- Footer: WhatsApp verde + número + botão CTA

Layout inspirado nos ads do Konecta App (barbearia, petshop, Mary Kay):
- Produto visual ocupa 40–50% esquerda
- Copy à direita com hierarquia clara
- Footer escuro com contato direto

---

### Prioridade 3 — Bento Grid
**Quando usar:** Múltiplos benefícios, 50 sintomas, categorias de dor

Layout:
- Grid 3×2 ou 2×3 de cards
- Cada card: 1 ideia só
- Card destaque (maior ou com borda accent): item principal
- Fundo cards: #0B0F17 | Borda destaque: accent color

Conteúdo por card:
- Número grande (01, 02, 03)
- Ícone ou emoji
- Label curto (máx 3 palavras)
- Subtext (máx 10 palavras)

---

### Prioridade 4 — Documento Interno / Checklist
**Quando usar:** "Você tem esses problemas?", auditoria operacional, lista de sintomas

Estética: parece um relatório interno, não um anúncio

Elementos:
- Header estilo documento (título + data + logo pequeno)
- Lista de itens com checkboxes ou status icons
- Itens com badges coloridos (crítico/atenção/ok)
- Rodapé com "Agende seu diagnóstico"

---

### Prioridade 5 — Mini Estudo de Caso
**Quando usar:** Prova social, resultado de cliente, antes/depois

Estrutura:
```
PROBLEMA → SOLUÇÃO → RESULTADO
```
- Seção Problema: headline de dor + contexto (2 linhas)
- Seta ou divisor visual
- Seção Resultado: métrica grande em destaque (−30%, 4 sem)
- Quote do cliente (se disponível)
- CTA de diagnóstico

---

## PALETA DE CORES

```
Fundo principal:    #05070B  (quase preto)
Fundo card:         #0B0F17  (dark navy)
Fundo elevado:      #111827  (cinza escuro)
Texto primário:     #FFFFFF
Texto secundário:   #A1A1AA
Texto muted:        #6B7280
Borda sutil:        #1F2937

Accent Lean (roxo):       #7C3AED
Accent Automação (verde): #10B981
Neon destaque:            #00FF88
Preço/oferta:             #FACC15
Urgência discreta:        #FF3B3B
WhatsApp:                 #25D366
```

**Regra do accent:** máximo 10% da composição.
**Nunca usar:** gradientes arco-íris, vermelho agressivo, amarelo excessivo.

---

## TIPOGRAFIA

```
Headline:    Bebas Neue  | uppercase | 80–128px | letter-spacing 2px
Subtext:     Inter 400   | 17–21px   | line-height 1.6
Labels/Mono: JetBrains Mono 500 | 10–12px | uppercase | letter-spacing 1.5px
CTA:         Inter 700   | 15–17px
Body:        Inter 400/500 | 13–15px
```

**Regra:** headline deve dominar. Se tirar a headline, o ad perde sentido.

---

## ELEMENTOS QUE AUMENTAM CREDIBILIDADE

Adicionar quando fizer sentido:
- Logs de terminal (JetBrains Mono, verde #00FF88)
- Checkmarks coloridos (✓ verde, ✗ vermelho, ⚠ amarelo)
- Métricas com variação (↑ vermelho / ↓ verde)
- Badges de status (crítico / atenção / ok)
- Timeline com dots (Done/Active/Pending)
- Top bar estilo macOS (bolinhas red/yellow/green)
- Badge "● LIVE" ou "● AO VIVO"
- Contador regressivo ou prazo

---

## PADRÕES DE COPY POR FORMATO

### Dashboard → Foco em dado concreto
```
Headline: "340H DESPERDIÇADAS POR MÊS"
Sub: "Mapeamos a causa raiz em 30 minutos."
```

### Mockup → Pergunta que paralisa
```
Headline: "VOCÊ JÁ NORMALIZOU O CAOS?"
Sub: "Toda empresa tem um processo quebrado."
```

### Bento → Reconhecimento de dor
```
Headline: "ISSO ACONTECE NA SUA EMPRESA?"
Sub: "6 sintomas que parecem normais, mas custam caro."
```

### Checklist → Autocategorização
```
Headline: "QUANTOS VOCÊ RECONHECE?"
Sub: "Se marcou 3 ou mais, sua operação está vazando dinheiro."
```

### Caso → Prova de método
```
Headline: "4 SEMANAS. PROCESSO RESOLVIDO."
Sub: "Clínica em BH eliminava retrabalho há 3 meses. Não mais."
```

---

## REGRAS DE COMPOSIÇÃO

| Elemento | Regra |
|---|---|
| Margem externa | 60–72px |
| Gap entre elementos | 14–20px |
| Border-radius cards | 10–16px |
| Border-radius botões | 10–12px |
| Box-shadow CTA | `0 0 32–48px rgba(accent, 0.35)` |
| Grid interno | 48–54px |
| Linha divisória | `1px solid #1F2937` |

---

## FOTOS / IMAGENS (quando usar)

**Priorizar:**
- Dashboard aberto no notebook
- Setup de trabalho real
- Processo sendo mapeado (whiteboard, post-its)
- Dados sendo analisados

**Evitar:**
- Pessoas apontando
- Apertos de mão corporativos
- Banco de imagens genérico
- Equipes sorrindo para câmera

**Na ausência de foto:** usar mockup HTML/CSS puro (terminal, dashboard, checklist). Nunca deixar o espaço vazio.

---

## ESTILOS VISUAIS POR CAMPANHA

| Campanha | Formato | Accent | Headline |
|---|---|---|---|
| Dependência do dono | Dashboard | #7C3AED | "VOCÊ É DONO OU FUNCIONÁRIO DA PRÓPRIA EMPRESA?" |
| Caos operacional | Checklist | #FF3B3B | "ESSES PROBLEMAS PARECEM NORMAIS. NÃO SÃO." |
| Falhas de comunicação | Mockup WhatsApp | #25D366 | "SEU CLIENTE AINDA ESPERA RESPOSTA?" |
| Problemas de equipe | Bento | #7C3AED | "SE UMA PESSOA FALTA, TUDO PARA?" |
| Perda de dinheiro | Dashboard | #FACC15 | "QUANTO CUSTA SEU RETRABALHO POR MÊS?" |
| Resultado de cliente | Caso | #10B981 | "4 SEMANAS. PROCESSO RESOLVIDO." |
| Automação WhatsApp | Mockup | #25D366 | "SEU WHATSAPP RESPONDE ÀS 3H DA MANHÃ?" |

---

## O QUE EVITAR

| ❌ Errado | ✅ Certo |
|---|---|
| Vários benefícios na mesma peça | 1 mensagem só |
| Gradiente arco-íris | Accent sólido (10% máximo) |
| Estética de infoproduto/afiliado | Dark premium estilo SaaS |
| Personagens 3D | Mockup real ou dashboard |
| Copy longa | Máx 8 palavras na headline |
| Botão vermelho gigante | CTA accent color, elegante |
| Muito emoji | Zero ou 1 emoji no máximo |
| "Incrível", "exclusivo", "revolucionário" | Números reais: −30%, 4 semanas, 30 min |
