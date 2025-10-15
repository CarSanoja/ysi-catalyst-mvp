from __future__ import annotations

import logging
from typing import Dict, TypedDict

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph

from app.utils.LangGraph.models import (
    ResearchGraphState,
    ResearchReport,
    ResearchSummary,
)

logger = logging.getLogger(__name__)

ENFORCED_MODEL_ID = "pt-4.1-nano"
ENFORCED_TEMPERATURE = 0.0


class _NodeConfig(TypedDict, total=False):
    """Typed configuration to allow overriding defaults."""

    model: str
    temperature: float


def _default_llm_config() -> _NodeConfig:
    return _NodeConfig(model=ENFORCED_MODEL_ID, temperature=ENFORCED_TEMPERATURE)


def build_research_graph(
    llm: ChatOpenAI | None = None,
    *,
    config: _NodeConfig | None = None,
):
    """
    Construye y compila el grafo de investigación.

    Permite inyectar un LLM ya configurado o sobreescribir los parámetros
    por defecto del modelo para entornos de prueba.
    """
    _ = config  # Se ignora cualquier configuración externa para garantizar el modelo requerido.

    if llm is not None:
        provided_model = getattr(llm, "model", "desconocido")
        if provided_model != ENFORCED_MODEL_ID:
            logger.warning(
                "Se proporcionó un LLM con el modelo '%s'. Se reemplazará por el modelo requerido '%s'.",
                provided_model,
                ENFORCED_MODEL_ID,
            )

    node_config = _default_llm_config()
    llm = ChatOpenAI(model=node_config["model"], temperature=node_config["temperature"])
    logger.info("Configurando LangGraph con el modelo %s (temperature=%s).", node_config["model"], node_config["temperature"])

    research_llm = llm.with_structured_output(
        ResearchSummary,
        name="research_summary",
        strict=True,
    )
    report_llm = llm.with_structured_output(
        ResearchReport,
        name="research_report",
        strict=True,
    )

    def researcher_node(state: ResearchGraphState) -> Dict[str, object]:
        """Nodo que sintetiza hallazgos de investigación con salida tipada."""
        query = state["query"]
        logger.info("Ejecutando investigador para la consulta: %s", query)

        summary = research_llm.invoke(
            [
                SystemMessage(
                    content=(
                        "Eres un analista de investigación para la Iniciativa de Innovación Social Juvenil. "
                        "Devuelve hallazgos breves, accionables y referencias claras."
                    )
                ),
                HumanMessage(
                    content=(
                        "Genera un resumen breve y preciso de la siguiente pregunta de investigación:\n\n"
                        f"{query}"
                    )
                ),
            ]
        )

        summary.emit_log(logger, label="StructuredResearchSummary")

        return {
            "research_summary": summary,
            "messages": [
                f"Research summary generated with {len(summary.key_findings)} key findings."
            ],
        }

    def writer_node(state: ResearchGraphState) -> Dict[str, object]:
        """Nodo que genera un reporte final enriquecido utilizando la síntesis previa."""
        summary = state["research_summary"]
        logger.info("Redactando reporte final para la consulta: %s", state["query"])

        report = report_llm.invoke(
            [
                SystemMessage(
                    content=(
                        "Eres un experto en comunicación para líderes de la Iniciativa de Innovación "
                        "Social Juvenil. Sigue un tono claro, profesional y accionable."
                    )
                ),
                HumanMessage(
                    content=(
                        "Utiliza la siguiente síntesis de investigación para generar un reporte ejecutivo. "
                        "Incluye recomendaciones accionables y referencias.\n\n"
                        f"SÍNTESIS:\n{summary.model_dump_json(indent=2)}"
                    )
                ),
            ]
        )

        report.emit_log(logger, label="StructuredResearchReport")

        return {
            "final_report": report,
            "messages": [
                f"Final report generated with {len(report.recommendations)} recommendations."
            ],
        }

    workflow = StateGraph(ResearchGraphState)

    workflow.add_node("researcher", researcher_node)
    workflow.add_node("writer", writer_node)

    workflow.set_entry_point("researcher")
    workflow.add_edge("researcher", "writer")
    workflow.add_edge("writer", "__end__")

    memory = MemorySaver()
    return workflow.compile(checkpointer=memory)


# La variable 'graph' es la que el servicio buscará y cargará
graph = build_research_graph()
