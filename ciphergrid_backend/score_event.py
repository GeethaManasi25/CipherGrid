import time
import math
import random

def score_event(event: dict) -> dict:
    # Example anomaly score
    err = round(abs(math.sin(time.time())) * 0.8 + random.uniform(0, 0.3), 3)

    if err >= 0.7:
        risk, severity = "high", "High"
        # you can add playbook id or tags here
    elif err >= 0.4:
        risk, severity = "medium", "Medium"
    else:
        risk, severity = "low", "Low"

    return {
        "event_id": event.get("event_id", f"evt-{int(time.time())}"),
        "node": event.get("node", "SG-01"),
        "protocol": event.get("protocol", "iec61850"),
        "reconstruction_error": err,
        "risk": risk,
        "severity": severity,
    }
