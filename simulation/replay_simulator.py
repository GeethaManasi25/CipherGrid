import os
from datetime import datetime

try:
    from scapy.all import rdpcap
except Exception:
    rdpcap = None

from ciphergrid_backend.mitigation_service import mitigation_action
from ciphergrid_backend.kafka_producer import send_alert
from ciphergrid_backend.score_event import score_event

