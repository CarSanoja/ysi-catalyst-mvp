from __future__ import annotations

import importlib
import logging
import uuid
from pathlib import Path
from types import ModuleType
from typing import Any, Dict, Generator, Iterable

from langgraph.graph import CompiledGraph

from app.utils.LangGraph.models import GraphInput, GraphOutput, StreamEvent
from app.utils.LangGraph.utils.logging_config import setup_logging

logger = logging.getLogger(__name__)


def _ensure_logging():
    """Garantiza que la configuración de logging se aplique una sola vez."""
    if not logging.getLogger().handlers:
        setup_logging()


def _serialize(value: Any) -> Any:
    """Convierte objetos de Pydantic y listas anidadas en estructuras serializables."""
    if hasattr(value, "model_dump"):
        return _serialize(value.model_dump())
    if isinstance(value, dict):
        return {k: _serialize(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_serialize(item) for item in value]
    return value


class LangGraphService:
    """Servicio que gestiona la carga y ejecución de grafos LangGraph."""

    def __init__(self, root_package: str = "app.utils.LangGraph") -> None:
        _ensure_logging()
        self.root_package = root_package

    def _load_module(self, graph_name: str) -> ModuleType:
        module_path = f"{self.root_package}.graphs.{graph_name}"
        logger.debug("Cargando módulo de grafo: %s", module_path)
        try:
            return importlib.import_module(module_path)
        except ModuleNotFoundError as exc:
            raise ValueError(f"No se encontró el grafo '{graph_name}'.") from exc

    def _load_graph(self, graph_name: str) -> CompiledGraph:
        module = self._load_module(graph_name)
        graph = getattr(module, "graph", None)
        if graph is None:
            raise ValueError(
                f"El módulo '{module.__name__}' no expone una variable 'graph' compilada."
            )
        if not isinstance(graph, CompiledGraph):
            raise TypeError(
                f"El atributo 'graph' de '{module.__name__}' no es una instancia de CompiledGraph."
            )
        return graph

    def run(self, graph_name: str, payload: GraphInput) -> GraphOutput:
        """Ejecuta un grafo de manera síncrona y devuelve el estado final."""
        graph = self._load_graph(graph_name)
        run_id = str(uuid.uuid4())
        logger.info("Ejecutando grafo '%s' con run_id=%s", graph_name, run_id)

        payload.emit_log(logger, level=logging.DEBUG, label=f"GraphInput[{graph_name}]")

        final_state = graph.invoke(
            payload.model_dump(),
            config={"configurable": {"run_id": run_id}},
        )

        result = _serialize(final_state)
        metadata = {
            "messages": result.get("messages", []),
            "graph": graph_name,
        }
        output = GraphOutput(run_id=run_id, result=result, metadata=metadata)
        output.emit_log(logger, level=logging.DEBUG, label=f"GraphOutput[{graph_name}]")

        return output

    def stream(
        self, graph_name: str, payload: GraphInput
    ) -> Generator[StreamEvent, None, None]:
        """Ejecuta un grafo y produce un stream de eventos estructurados."""
        graph = self._load_graph(graph_name)
        run_id = str(uuid.uuid4())
        logger.info("Iniciando stream del grafo '%s' con run_id=%s", graph_name, run_id)

        payload.emit_log(logger, level=logging.DEBUG, label=f"GraphInput[{graph_name}]")

        stream_iter = graph.stream(
            payload.model_dump(),
            config={"configurable": {"run_id": run_id}},
        )

        for event in stream_iter:
            # Cada evento es una tupla (path, update) donde path es una lista [scope, node]
            path, update = event
            node = path[-1] if path else "unknown"
            stream_event = StreamEvent(
                run_id=run_id,
                event="update",
                node=node,
                data=_serialize(update),
            )
            stream_event.emit_log(logger, level=logging.DEBUG, label=f"StreamEvent[{graph_name}]")
            yield stream_event

    def list_graphs(self) -> Iterable[str]:
        """Enumera los grafos disponibles dentro del paquete configurado."""
        package_path = Path(importlib.import_module(f"{self.root_package}.graphs").__file__).parent
        return (
            module.stem
            for module in package_path.glob("*.py")
            if module.stem not in {"__init__"} and module.is_file()
        )
