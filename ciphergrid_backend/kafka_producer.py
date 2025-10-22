import json
import logging
import os
from typing import Optional

log = logging.getLogger("kafka_producer")
if not log.handlers:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

KAFKA_BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP", "localhost:9092")
KAFKA_TOPIC = os.getenv("KAFKA_ALERTS_TOPIC", "ciphergrid-alerts")

_PRODUCER = None
_IMPORT_ERROR = None

def _get_producer():
    """Lazily create a KafkaProducer; return None if unavailable."""
    global _PRODUCER, _IMPORT_ERROR
    if _PRODUCER is not None:
        return _PRODUCER
    if _IMPORT_ERROR is not None:
        return None
    try:
        from kafka import KafkaProducer  # pip install kafka-python
        _PRODUCER = KafkaProducer(
            bootstrap_servers=KAFKA_BOOTSTRAP,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            retries=2,
            linger_ms=20,
        )
        log.info("KafkaProducer ready -> %s (topic=%s)", KAFKA_BOOTSTRAP, KAFKA_TOPIC)
        return _PRODUCER
    except Exception as e:
        _IMPORT_ERROR = e
        log.warning("Kafka unavailable (%s). Alerts will be logged only.", e)
        return None

def send_alert(
    event_id: str,
    risk_score: float,
    classification: str,
    severity: Optional[str] = None,
    extra: Optional[dict] = None,
) -> bool:
    """
    Send alert to Kafka. Returns True if enqueued; False otherwise.
    Never raises if Kafka is down.
    """
    sev = severity
    if sev is None:
        sev = "Critical" if risk_score >= 0.05 else "High" if risk_score >= 0.02 else "Low"

    payload = {
        "event_id": str(event_id),
        "risk_score": float(risk_score),
        "classification": str(classification),
        "severity": sev,
    }
    if isinstance(extra, dict):
        payload.update(extra)

    producer = _get_producer()
    if producer is None:
        log.warning("[NO-KAFKA] Would send: %s", payload)
        return False

    try:
        producer.send(KAFKA_TOPIC, payload)  # fire-and-forget
        return True
    except Exception as e:
        log.error("Kafka send failed: %s", e)
        return False

if __name__ == "__main__":
    ok = send_alert(
        event_id="selftest-001",
        risk_score=0.031,
        classification="high",
        extra={"node": "SG-01", "protocol": "iec61850"},
    )
    print("Sent to Kafka?", ok)
