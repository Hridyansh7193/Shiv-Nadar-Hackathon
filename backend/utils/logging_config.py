import logging
import os
import sys


def get_logger(name: str) -> logging.Logger:
    """Create a configured logger instance.

    Uses LOG_LEVEL from environment (default: INFO).
    """
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    logger = logging.getLogger(name)

    if not logger.handlers:
        logger.setLevel(getattr(logging, log_level, logging.INFO))
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(getattr(logging, log_level, logging.INFO))
        formatter = logging.Formatter(
            "[%(asctime)s] %(levelname)s %(name)s: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger
