import logging
import sys

def setup_logging():
    """Configura el logger para la aplicación."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - [%(levelname)s] - %(name)s - (%(module)s.%(funcName)s:%(lineno)d) - %(message)s",
        stream=sys.stdout,
    )
    # Silenciar logs muy verbosos de librerías de terceros si es necesario
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)