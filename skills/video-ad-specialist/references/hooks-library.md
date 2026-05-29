# Hooks Library — Video Ad Specialist

## Categorias de Hook

### 1. Identificação de Dor (maior retenção)
```
"Equipe apagando incêndio todo dia?"
"Sua equipe trabalha muito. O problema continua voltando?"
"Todo gestor que conheço passa o dia resolvendo urgência."
"Reunião de segunda. Mesmos problemas. Mais uma semana igual."
```

### 2. Dado Chocante (alto CTR)
```
"Sua empresa perde 30% da receita em retrabalho todos os dias."
"80% dos problemas operacionais têm a mesma causa raiz."
"Empresas perdem em média R$X/mês em processos sem valor."
"3 horas por dia apagando incêndio que nunca deveria ter começado."
```

### 3. Provocação Direta (alto compartilhamento)
```
"Você acha que sua empresa é eficiente?"
"O maior desperdício da sua empresa: ninguém está medindo."
"Automatizar processo ruim é a coisa mais cara que você pode fazer."
"Se sua operação depende de heróis para funcionar, você não tem processo."
```

### 4. Tensão Visual (para reels e TikTok)
```
"[tela de WhatsApp caótico] Sua operação parece isso por dentro?"
"[relógio girando] Cada hora sem padrão é dinheiro saindo."
"[lista de problemas acumulando] Isso é o seu backlog de incêndios."
```

### 5. Pergunta Desafiadora (para YouTube)
```
"Por que sua empresa trabalha tanto e entrega tão pouco?"
"Quanto custa uma hora de retrabalho na sua operação?"
"Quantas vezes esse mesmo problema voltou nos últimos 3 meses?"
"Você já mapeou quanto custa não ter processo?"
```

---

## Estrutura de Variações A/B

Para cada campanha, gerar 3 variações de hook obrigatoriamente:
```json
{
  "ad_variations": [
    { "id": "v1", "angle": "identificacao_dor",
      "hook": "Equipe apagando incêndio todo dia?" },
    { "id": "v2", "angle": "dado_chocante",
      "hook": "Sua empresa perde 30% da receita em retrabalho." },
    { "id": "v3", "angle": "provocacao_direta",
      "hook": "Você acha que sua empresa é eficiente?" }
  ]
}
```

---

## Exemplos Completos por Tipo de Ad

### Meta Ad — Lean, Conversão (15s)
```json
{ "scenes": [
  { "type": "hook", "text": "Equipe apagando incêndio todo dia?", "duration": 3 },
  { "type": "problem", "text": "Não é falta de esforço. É processo quebrado.", "duration": 4 },
  { "type": "product", "text": "DMAIC: causa raiz em 4 semanas. −30% custo.", "duration": 5 },
  { "type": "cta", "text": "Diagnóstico Grátis.", "subtext": "30 min · smartops-ia.com.br", "duration": 3 }
]}
```

### TikTok Ad — Automação, Awareness (12s)
```json
{ "scenes": [
  { "type": "hook", "text": "Seu WhatsApp responde às 3h da manhã?", "duration": 2 },
  { "type": "product", "text": "Bot com IA: responde, qualifica e agenda. 24h.", "duration": 6 },
  { "type": "cta", "text": "Diagnóstico Grátis.", "subtext": "Pronto em 1–2 semanas", "duration": 4 }
]}
```

### YouTube Authority Ad (30s)
```json
{ "scenes": [
  { "type": "hook", "text": "O maior desperdício da sua empresa: ninguém está medindo.", "duration": 5 },
  { "type": "problem", "text": "Retrabalho invisível. Gargalos sem dono. R$X por mês.", "duration": 6 },
  { "type": "product", "text": "Lean Six Sigma em 30 minutos de diagnóstico. Causa raiz em 4 semanas.", "duration": 8 },
  { "type": "testimonial", "text": "\"Em 4 semanas o processo ficou padronizado.\"", "quote": "— Fernanda O., Diretora", "duration": 6 },
  { "type": "cta", "text": "Diagnóstico Gratuito.", "subtext": "30 minutos · Sem compromisso", "duration": 5 }
]}
```

### Retargeting Ad (15s)
```json
{ "scenes": [
  { "type": "hook", "text": "Ainda tem problema de retrabalho na sua operação?", "duration": 3 },
  { "type": "testimonial", "text": "\"Em 4 semanas o processo ficou padronizado.\"", "quote": "— Fernanda O.", "duration": 7 },
  { "type": "cta", "text": "Diagnóstico esta semana.", "subtext": "Vagas limitadas", "duration": 5 }
]}
```

### VSL Curta (90s estrutura)
```
[0–10s]  Hook: identificação de dor máxima
[10–25s] Problema: ampliar com consequência específica
[25–45s] Consequência: custo de não resolver (R$X/mês)
[45–70s] Solução: DMAIC ou automação com resultado real
[70–90s] Oferta + CTA: diagnóstico gratuito, urgência real
```

---

## KPIs de Referência

| Métrica | Meta | Sinal se abaixo |
|---------|------|----------------|
| Hook retention 3s | >70% | Reescrever hook |
| 25% completion | >60% | Problema na 2ª cena |
| 50% completion | >40% | Solução não convence |
| CTR | >2% Meta, >1% YouTube | Testar novo ângulo |
| CPA | Abaixo do CAC alvo | Revisar CTA + oferta |
