from flask import Blueprint, request, jsonify

mitigation_bp = Blueprint("mitigation", __name__)

def mitigation_action(alert: dict) -> str:
    sev = str(alert.get("severity", "")).lower()
    proto = str(alert.get("protocol", "")).lower()

    if sev == "critical":
        return "Isolate IED VLAN & block GOOSE/MMS" if proto in {"iec61850","goose","mms"} \
               else "Quarantine node & block suspicious ports"
    if sev == "high":
        return "Throttle traffic, add IDS rule, notify SOC"
    if sev == "medium":
        return "Increase monitoring, create triage case"
    return "Log only"

@mitigation_bp.route("/mitigate", methods=["POST"])
def mitigate():
    alert = request.get_json(force=True) or {}
    return jsonify({"action": mitigation_action(alert)})

