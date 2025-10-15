from __future__ import annotations

import json
import logging
import operator
from typing import Annotated, List, TypedDict, Union

from pydantic import BaseModel, ConfigDict, Field

logger = logging.getLogger(__name__)

# --- Modelos de la API ---

class LoggableModel(BaseModel):
    """Mixin para exponer métodos de logging en los modelos Pydantic."""

    model_config = ConfigDict(extra="forbid")

    def emit_log(
        self,
        log: logging.Logger,
        *,
        level: int = logging.INFO,
        label: str | None = None,
    ) -> None:
        """Registra la representación JSON del modelo con el logger indicado."""
        prefix = f"{label}: " if label else ""
        log.log(level, "%s%s", prefix, self.to_log_payload())

    def to_log_payload(self) -> str:
        """Devuelve la representación JSON con formato para propósitos de logging."""
        return json.dumps(
            self.model_dump(mode="json"),
            ensure_ascii=False,
            sort_keys=True,
            indent=2,
        )


class GraphInput(LoggableModel):
    """Esquema para la entrada de una ejecución del grafo."""
    query: str = Field(description="La pregunta o instrucción principal para el grafo.")
    # Puedes agregar más campos según tus necesidades, como `session_id`, etc.


class GraphOutput(LoggableModel):
    """Esquema para la salida síncrona de una ejecución."""
    run_id: str = Field(description="Identificador único de la ejecución.")
    result: dict = Field(description="El resultado final del grafo.")
    metadata: dict | None = Field(
        default=None,
        description="Información adicional sobre la ejecución, como tiempos o métricas.",
    )


class StreamEvent(LoggableModel):
    """Esquema para un evento en el stream de ejecución."""
    run_id: str = Field(description="Identificador único de la ejecución.")
    event: str = Field(description="Tipo de evento (e.g., 'on_llm_start', 'on_tool_end').")
    node: str = Field(description="Nombre del nodo que generó el evento.")
    data: Union[dict, str] = Field(description="Datos asociados al evento.")


class ResearchSummary(LoggableModel):
    """Salida estructurada del paso de investigación."""

    key_findings: List[str] = Field(description="Lista de hallazgos concisos y accionables.")
    supporting_sources: List[str] = Field(
        description="Referencias breves a las fuentes o datos utilizados."
    )
    confidence: float = Field(
        description="Nivel de confianza (0-1) sobre la calidad de la síntesis.",
        ge=0.0,
        le=1.0,
    )
    synthesis: str = Field(
        description="Resumen narrativo de los hallazgos principales en un párrafo breve."
    )


class ResearchReport(LoggableModel):
    """Salida estructurada del paso de redacción final."""

    title: str = Field(description="Título del reporte generado.")
    executive_summary: str = Field(description="Resumen ejecutivo de máximo 4 oraciones.")
    highlights: List[str] = Field(description="Lista de puntos clave para compartir con stakeholders.")
    recommendations: List[str] = Field(
        description="Acciones sugeridas basadas en los hallazgos investigados."
    )
    references: List[str] = Field(
        description="Fuentes o enlaces relevantes a compartir con el equipo."
    )

# --- Estado del Grafo de Ejemplo ---

class ResearchGraphState(TypedDict):
    """
    Representa el estado del grafo de investigación.
    
    Attributes:
        query: La pregunta del usuario.
        research_summary: El resumen de la investigación.
        final_report: El reporte final generado.
        messages: La lista de mensajes acumulados, esencial para el funcionamiento.
    """
    query: str
    research_summary: ResearchSummary
    final_report: ResearchReport
    messages: Annotated[List[str], operator.add]
