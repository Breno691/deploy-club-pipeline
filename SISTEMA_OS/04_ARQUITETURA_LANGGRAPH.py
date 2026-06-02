"""
SISTEMA OS — SmartOps IA
Arquitetura LangGraph + CrewAI para Orquestração de Agentes
Versão: 2026-05-30

Fluxo geral:
  Triggers (schedule/webhook/event)
    → Orchestrator seleciona agente(s)
    → Agente executa com suas ferramentas e memória
    → Agente reporta resultado + gera mensagens para outros agentes
    → CEO Advisor consolida e decide prioridade
    → Ações executadas via n8n / APIs
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from typing import Annotated, Any, Literal, TypedDict

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.checkpoint.postgres import PostgresSaver
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

# ── Configuração ──────────────────────────────────────────────────────────────

MODEL_FAST    = "claude-haiku-4-5-20251001"   # execução rápida, relatórios
MODEL_SMART   = "claude-sonnet-4-6"            # análises e decisões
MODEL_DEEP    = "claude-opus-4-8"              # CEO Advisor, Strategic Planning

ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]
DATABASE_URL      = os.environ.get("DATABASE_URL", "postgresql://localhost/smartops")
TELEGRAM_AGENT_BOT_TOKEN = os.environ["TELEGRAM_AGENT_BOT_TOKEN"]
TELEGRAM_CHAT_ID  = os.environ.get("TELEGRAM_AGENT_CHAT_ID", "1349738505")

# ── State (estado compartilhado entre nós do grafo) ───────────────────────────

class SmartOpsState(TypedDict):
    messages:         Annotated[list, add_messages]
    agent_id:         str
    trigger_type:     str                    # schedule / webhook / agent / manual
    triggered_by:     str
    session_id:       str
    date:             str
    observations:     list[dict]
    decisions:        list[dict]
    actions_taken:    list[dict]
    alerts:           list[dict]
    kpis:             dict[str, Any]
    reports:          dict[str, str]         # agent_id → report_text
    next_agents:      list[str]              # agentes a acionar em seguida
    priority:         Literal["P1","P2","P3"]
    status:           Literal["running","completed","failed","waiting_approval"]
    error:            str | None


# ── Ferramentas compartilhadas ────────────────────────────────────────────────

@tool
def send_telegram(message: str, agent_name: str) -> str:
    """Envia mensagem ao bot @IAAgentesmartopsbot via Telegram."""
    import urllib.parse, urllib.request
    params = urllib.parse.urlencode({
        "chat_id": TELEGRAM_CHAT_ID,
        "text":    message,
        "parse_mode": "Markdown",
    }).encode()
    url = f"https://api.telegram.org/bot{TELEGRAM_AGENT_BOT_TOKEN}/sendMessage"
    try:
        req  = urllib.request.Request(url, data=params, method="POST")
        resp = urllib.request.urlopen(req, timeout=10)
        return f"✓ Mensagem enviada — {agent_name}"
    except Exception as e:
        return f"✗ Erro Telegram: {e}"


@tool
def save_to_db(table: str, data: dict) -> str:
    """Salva dados no banco de dados PostgreSQL da SmartOps IA."""
    import psycopg2
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur  = conn.cursor()
        cols = ", ".join(data.keys())
        vals = ", ".join(["%s"] * len(data))
        cur.execute(f"INSERT INTO {table} ({cols}) VALUES ({vals})", list(data.values()))
        conn.commit()
        cur.close()
        conn.close()
        return f"✓ Salvo em {table}"
    except Exception as e:
        return f"✗ DB Error: {e}"


@tool
def web_search(query: str, max_results: int = 5) -> str:
    """Pesquisa na internet via Tavily AI."""
    from tavily import TavilyClient
    client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])
    results = client.search(query, max_results=max_results, search_depth="advanced")
    return json.dumps(results.get("results", []), ensure_ascii=False, indent=2)


@tool
def open_ticket(from_agent: str, to_agent: str, title: str, description: str, priority: str = "P2") -> str:
    """Abre um ticket de colaboração entre agentes."""
    ticket = {
        "created_by":  from_agent,
        "assigned_to": to_agent,
        "title":       title,
        "description": description,
        "priority":    priority,
        "status":      "aberto",
        "created_at":  datetime.now(timezone.utc).isoformat(),
    }
    return save_to_db.invoke({"table": "tickets", "data": ticket})


@tool
def send_agent_message(from_agent: str, to_agent: str, type: str, payload: dict, priority: str = "P2") -> str:
    """Envia mensagem de um agente para outro (colaboração inter-agente)."""
    msg = {
        "from_agent":         from_agent,
        "to_agent":           to_agent,
        "type":               type,
        "priority":           priority,
        "payload":            json.dumps(payload),
        "requires_response":  type == "request",
        "sent_at":            datetime.now(timezone.utc).isoformat(),
    }
    return save_to_db.invoke({"table": "agent_messages", "data": msg})


@tool
def save_kpi_snapshot(agent_id: str, metrics: dict, period: str = "daily") -> str:
    """Salva snapshot de KPIs do agente no banco."""
    snapshot = {
        "agent_id":    agent_id,
        "period":      period,
        "metrics":     json.dumps(metrics),
        "snapshot_at": datetime.now(timezone.utc).isoformat(),
    }
    return save_to_db.invoke({"table": "kpi_snapshots", "data": snapshot})


# ── Prompts de sistema por agente ─────────────────────────────────────────────

AGENT_SYSTEM_PROMPTS = {
    "ads-agent": """Você é o Diretor de Mídia Paga da SmartOps IA.
Missão: gerar leads qualificados ao menor CPA possível (meta: ≤ R$60).
KPIs: CPA ≤ R$60 | ROAS ≥ 4.0 | CTR ≥ 2.5% | Leads A/A+ ≥ 80/mês.
Autonomia: pode pausar anúncios com CPA > R$120 por 3 dias, realocar até 20% do orçamento, ajustar lances ±25%.
Aja proativamente. Cada análise termina em ação concreta.""",

    "website-analytics-agent": """Você é o Diretor de Analytics da SmartOps IA.
Missão: saber tudo que acontece no site e disparar ações corretivas automaticamente.
KPIs: Conversão ≥ 5% | Exit rate ≤ 50% | LCP mobile ≤ 2.5s.
Autonomia: abre tickets P1/P2/P3 para CRO/Design/Copy sem aprovação.
Não espere problemas — detecte antes que aconteçam.""",

    "cro-agent": """Você é o Diretor de Conversão da SmartOps IA.
Missão: transformar tráfego em leads via testes contínuos.
KPIs: Conversion Rate ≥ 5% | CTR CTAs ≥ 3.5% | Abandono formulário ≤ 30%.
Autonomia: altera textos, CTAs, botões e formulários sem aprovação. Promove variante com significância ≥ 95%.""",

    "revenue-agent": """Você é o Chief Revenue Intelligence da SmartOps IA.
Missão: conectar todos os dados do funil e apontar onde o dinheiro entra, vaza e qual alavanca tem maior ROI.
Meta: R$50k MRR com clientes a R$10k+/mês.
KPIs: MRR crescente | LTV/CAC ≥ 3x | Forecast ≥ 100%.
Você entrega UMA decisão de receita por dia — a de maior ROI.""",

    "ceo-advisor-agent": """Você é o CEO Virtual da SmartOps IA.
Missão: maximizar crescimento, receita e lucro. Consolidar todos os relatórios dos diretores.
KPIs: Receita mensal crescente | Top 3 prioridades entregues até 9h30 | Decisão #1 de ROI.
Autonomia máxima: pode alterar prioridades, metas, roadmap e alocação de recursos.
Entregue ao Breno: uma frase de contexto, top 3 prioridades e a decisão #1 do dia.""",

    "lead-scoring-agent": """Você é o Diretor de Qualificação da SmartOps IA.
Missão: classificar leads A+/A/B/C/D em < 15 minutos e garantir que o Breno atenda primeiro os leads certos.
Critérios A+: PME BH/MG, 10-50 func., dono/CEO, indústria/varejo/logística, urgente.
KPIs: A+ identificado < 15min | Taxa de acerto ≥ 60% | Leads A+ contatados em < 5min.
Alerte imediatamente ao Breno via Telegram quando um A+ entra.""",

    # ... demais agentes adicionados da mesma forma
}


# ── Factory de agentes ────────────────────────────────────────────────────────

def build_agent_node(agent_id: str, model: str = MODEL_SMART):
    """Constrói um nó de agente LangGraph com suas ferramentas e prompt."""

    agent_tools = [
        web_search,
        send_telegram,
        save_to_db,
        open_ticket,
        send_agent_message,
        save_kpi_snapshot,
    ]

    llm = ChatAnthropic(
        model=model,
        api_key=ANTHROPIC_API_KEY,
        max_tokens=4096,
    ).bind_tools(agent_tools)

    system_prompt = AGENT_SYSTEM_PROMPTS.get(agent_id, f"Você é o {agent_id} da SmartOps IA.")

    def agent_node(state: SmartOpsState) -> SmartOpsState:
        date = state.get("date", datetime.now().strftime("%Y-%m-%d"))

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=(
                f"Data: {date}\n"
                f"Sessão: {state.get('session_id', 'N/A')}\n"
                f"Trigger: {state.get('trigger_type', 'schedule')}\n\n"
                f"Execute sua missão diária. Analise, decida, execute e reporte."
            )),
        ] + state["messages"]

        response = llm.invoke(messages)

        return {
            **state,
            "messages": [response],
            "status":   "completed" if not state.get("error") else "failed",
        }

    return agent_node


# ── Nó de decisão do CEO Advisor ─────────────────────────────────────────────

def ceo_advisor_node(state: SmartOpsState) -> SmartOpsState:
    """CEO Advisor consolida relatórios e entrega top 3 prioridades."""

    llm = ChatAnthropic(
        model=MODEL_DEEP,
        api_key=ANTHROPIC_API_KEY,
        max_tokens=2048,
    ).bind_tools([send_telegram, save_kpi_snapshot])

    reports_summary = "\n\n".join([
        f"**{agent}:**\n{report}"
        for agent, report in state.get("reports", {}).items()
    ])

    alerts_summary = "\n".join([
        f"[{a['level']}] {a['agent_id']}: {a['message']}"
        for a in state.get("alerts", [])
    ]) or "Nenhum alerta crítico."

    messages = [
        SystemMessage(content=AGENT_SYSTEM_PROMPTS.get("ceo-advisor-agent", "")),
        HumanMessage(content=(
            f"Data: {state.get('date')}\n\n"
            f"RELATÓRIOS DOS DIRETORES:\n{reports_summary}\n\n"
            f"ALERTAS ATIVOS:\n{alerts_summary}\n\n"
            f"Entregue:\n"
            f"1. Frase do dia (orientação estratégica)\n"
            f"2. Top 3 prioridades com ROI estimado\n"
            f"3. Decisão #1 de hoje\n"
            f"4. O que NÃO fazer hoje\n"
            f"Depois envie resumo via Telegram."
        )),
    ]

    response = llm.invoke(messages)
    return {**state, "messages": [response], "status": "completed"}


# ── Roteador — decide qual agente ativar ─────────────────────────────────────

def route_by_agent(state: SmartOpsState) -> str:
    """Roteia para o nó correto baseado no agent_id."""
    agent_id = state.get("agent_id", "ceo-advisor-agent")
    known = {
        "ads-agent",
        "website-analytics-agent",
        "cro-agent",
        "lead-scoring-agent",
        "revenue-agent",
        "ceo-advisor-agent",
        "copywriter-agent",
        "lean-agent",
        "six-sigma-agent",
        "kaizen-agent",
        "sales-intelligence-agent",
        "proposal-agent",
        "client-success-agent",
        "risk-agent",
        "financial-intelligence-agent",
        "strategic-planning-agent",
        "chief-of-staff-agent",
        "competitor-intelligence-agent",
        "seo-agent",
        "content-performance-agent",
        "process-mining-agent",
        "automation-agent",
        "personal-brand-agent",
        "executive-dashboard-agent",
    }
    return agent_id if agent_id in known else "ceo-advisor-agent"


def should_continue(state: SmartOpsState) -> Literal["tools", "end"]:
    """Decide se o agente deve continuar usando ferramentas ou finalizar."""
    last = state["messages"][-1]
    if hasattr(last, "tool_calls") and last.tool_calls:
        return "tools"
    return "end"


# ── Construção do grafo ───────────────────────────────────────────────────────

def build_smartops_graph() -> StateGraph:
    """Constrói o grafo de orquestração dos agentes SmartOps IA."""

    graph = StateGraph(SmartOpsState)

    # Ferramentas compartilhadas
    tools_node = ToolNode([
        web_search,
        send_telegram,
        save_to_db,
        open_ticket,
        send_agent_message,
        save_kpi_snapshot,
    ])

    # Adiciona nós de agentes
    agent_configs = [
        ("ads-agent",                   MODEL_SMART),
        ("website-analytics-agent",     MODEL_SMART),
        ("cro-agent",                   MODEL_SMART),
        ("lead-scoring-agent",          MODEL_FAST),
        ("revenue-agent",               MODEL_SMART),
        ("copywriter-agent",            MODEL_SMART),
        ("lean-agent",                  MODEL_SMART),
        ("six-sigma-agent",             MODEL_SMART),
        ("kaizen-agent",                MODEL_FAST),
        ("sales-intelligence-agent",    MODEL_SMART),
        ("proposal-agent",              MODEL_SMART),
        ("client-success-agent",        MODEL_SMART),
        ("risk-agent",                  MODEL_FAST),
        ("financial-intelligence-agent",MODEL_SMART),
        ("strategic-planning-agent",    MODEL_SMART),
        ("chief-of-staff-agent",        MODEL_SMART),
        ("competitor-intelligence-agent",MODEL_FAST),
        ("seo-agent",                   MODEL_FAST),
        ("content-performance-agent",   MODEL_FAST),
        ("process-mining-agent",        MODEL_SMART),
        ("automation-agent",            MODEL_SMART),
        ("personal-brand-agent",        MODEL_FAST),
        ("executive-dashboard-agent",   MODEL_FAST),
    ]

    for agent_id, model in agent_configs:
        graph.add_node(agent_id, build_agent_node(agent_id, model))
        graph.add_edge(agent_id, "tools")

    # CEO Advisor como consolidador final
    graph.add_node("ceo-advisor-agent", ceo_advisor_node)
    graph.add_edge("ceo-advisor-agent", "tools")

    # Nó de ferramentas compartilhado
    graph.add_node("tools", tools_node)

    # Roteamento inicial
    graph.add_conditional_edges(START, route_by_agent)

    # Após tools, volta para o agente correto ou termina
    def route_after_tools(state: SmartOpsState) -> str:
        return state.get("agent_id", "ceo-advisor-agent")

    graph.add_conditional_edges("tools", route_after_tools)

    # Condição de término para cada agente
    for agent_id, _ in agent_configs:
        graph.add_conditional_edges(
            agent_id,
            should_continue,
            {"tools": "tools", "end": END},
        )
    graph.add_conditional_edges(
        "ceo-advisor-agent",
        should_continue,
        {"tools": "tools", "end": END},
    )

    return graph


# ── Execução com persistência ─────────────────────────────────────────────────

def run_agent(agent_id: str, trigger_type: str = "schedule", triggered_by: str = "schedule") -> dict:
    """Executa um agente específico com persistência no PostgreSQL."""
    import uuid

    graph    = build_smartops_graph()
    checkpointer = PostgresSaver.from_conn_string(DATABASE_URL)
    app      = graph.compile(checkpointer=checkpointer)

    session_id = f"{agent_id}-{datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:8]}"

    initial_state: SmartOpsState = {
        "messages":      [],
        "agent_id":      agent_id,
        "trigger_type":  trigger_type,
        "triggered_by":  triggered_by,
        "session_id":    session_id,
        "date":          datetime.now().strftime("%Y-%m-%d"),
        "observations":  [],
        "decisions":     [],
        "actions_taken": [],
        "alerts":        [],
        "kpis":          {},
        "reports":       {},
        "next_agents":   [],
        "priority":      "P2",
        "status":        "running",
        "error":         None,
    }

    config  = {"configurable": {"thread_id": session_id}}
    result  = app.invoke(initial_state, config)

    return {
        "session_id": session_id,
        "agent_id":   agent_id,
        "status":     result.get("status"),
        "kpis":       result.get("kpis"),
        "alerts":     result.get("alerts"),
    }


# ── Pipeline de ondas diárias ─────────────────────────────────────────────────

DAILY_WAVES = {
    "wave_1_5h":   ["ads-agent", "website-analytics-agent"],
    "wave_1_5h30": ["seo-agent", "process-mining-agent"],
    "wave_2_6h":   ["lead-scoring-agent", "cro-agent", "financial-intelligence-agent", "lean-agent", "six-sigma-agent"],
    "wave_2_6h30": ["competitor-intelligence-agent", "risk-agent"],
    "wave_3_7h":   ["copywriter-agent", "personal-brand-agent", "sales-intelligence-agent"],
    "wave_3_7h30": ["content-performance-agent", "executive-dashboard-agent"],
    "wave_4_8h":   ["proposal-agent", "offer-optimization-agent", "client-success-agent"],
    "wave_4_8h30": ["kaizen-agent", "chief-of-staff-agent", "strategic-planning-agent", "automation-agent"],
    "wave_5_9h":   ["revenue-agent"],
    "wave_5_9h30": ["ceo-advisor-agent"],
}


def run_wave(wave_name: str) -> list[dict]:
    """Executa todos os agentes de uma onda em paralelo."""
    import concurrent.futures

    agents = DAILY_WAVES.get(wave_name, [])
    results = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = {
            executor.submit(run_agent, agent_id, "schedule", wave_name): agent_id
            for agent_id in agents
        }
        for future in concurrent.futures.as_completed(futures):
            agent_id = futures[future]
            try:
                result = future.result()
                results.append(result)
                print(f"✓ {agent_id} — {result['status']}")
            except Exception as e:
                print(f"✗ {agent_id} — Erro: {e}")
                results.append({"agent_id": agent_id, "status": "failed", "error": str(e)})

    return results


# ── Orquestrador de evento — colaboração entre agentes ────────────────────────

class AgentOrchestrator:
    """
    Orquestrador de eventos que coordena a colaboração entre agentes.
    Baseado no protocolo de mensagens definido em 02_WORKFLOWS_COLABORACAO.md
    """

    def __init__(self):
        self.graph = build_smartops_graph()

    def handle_lead_quente(self, lead_data: dict) -> None:
        """SITUAÇÃO 1: Lead A+ entra — ativa cadeia de colaboração."""
        print(f"Lead A+ detectado: {lead_data.get('nome')}")
        # Lead Scoring já classificou → ativa Sales Intelligence
        run_agent("sales-intelligence-agent", "webhook", "lead-scoring-agent")
        # Notifica Chief of Staff para agendar reunião
        run_agent("chief-of-staff-agent", "webhook", "lead-scoring-agent")

    def handle_ctr_caindo(self, campaign_data: dict) -> None:
        """SITUAÇÃO 2: CTR cai > 15% — Ads aciona Copywriter."""
        print(f"CTR caindo em campanha: {campaign_data.get('campaign_id')}")
        run_agent("copywriter-agent", "webhook", "ads-agent")

    def handle_churn_risk(self, client_data: dict) -> None:
        """SITUAÇÃO 3: Risco de churn detectado — Risk aciona Client Success."""
        print(f"Risco de churn: {client_data.get('client_id')}")
        run_agent("client-success-agent", "webhook", "risk-agent")

    def handle_meta_em_risco(self, forecast_data: dict) -> None:
        """SITUAÇÃO 6: Meta mensal em risco — Revenue aciona CEO Advisor."""
        print(f"Meta em risco: {forecast_data.get('gap')}")
        run_agent("ceo-advisor-agent", "webhook", "revenue-agent")


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Uso: python 04_ARQUITETURA_LANGGRAPH.py <agent_id|wave_name>")
        print("Exemplos:")
        print("  python 04_ARQUITETURA_LANGGRAPH.py ads-agent")
        print("  python 04_ARQUITETURA_LANGGRAPH.py wave_1_5h")
        sys.exit(1)

    arg = sys.argv[1]

    if arg in DAILY_WAVES:
        print(f"\nExecutando onda: {arg}")
        results = run_wave(arg)
        print(f"\n✓ Onda concluída: {len([r for r in results if r['status']=='completed'])}/{len(results)} agentes OK")
    else:
        print(f"\nExecutando agente: {arg}")
        result = run_agent(arg)
        print(f"\nResultado: {json.dumps(result, ensure_ascii=False, indent=2)}")
