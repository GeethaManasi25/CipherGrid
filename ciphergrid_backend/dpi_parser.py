import logging
log = logging.getLogger("dpi_parser")
if not log.handlers:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

try:
    from scapy.all import raw  # pip install scapy
    SCAPY_OK = True
except Exception as e:
    SCAPY_OK = False
    log.warning("Scapy not available: %s", e)

def validate_goose(pkt):
    """
    Placeholder validation for IEC 61850/GOOSE.
    Extend with real parsing later; safe to call even if scapy is missing.
    """
    if not SCAPY_OK:
        return {"ok": False, "reason": "scapy_not_installed"}
    try:
        b = raw(pkt)
        if len(b) < 60:
            return {"ok": False, "reason": "too_short"}
        return {"ok": True, "reason": "basic_len_ok"}
    except Exception as e:
        return {"ok": False, "reason": f"exception:{e}"}
