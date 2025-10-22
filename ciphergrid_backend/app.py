# ciphergrid_backend/app.py
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from score_event import score_event

# Optional integrations (safe fallbacks)
try:
    from kafka_producer import send_alert_safe
except Exception:
    def send_alert_safe(*args, **kwargs):
        print("[WARN] Kafka producer unavailable; logging only.")

try:
    from mitigation_service import recommend_mitigation
except Exception:
    def recommend_mitigation(severity, context=None):
        return "Monitor anomaly; no action required."

load_dotenv()

# ---------------------- LIVE COUNTERS (in-memory) ----------------------
COUNTS = {
    "total_events": 0,
    "high_risk_alerts": 0,
}

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Health
    @app.get("/health")
    def health():
        return jsonify({"message": "Flask backend with DB is running", "ok": True})

    # Dashboard summary (now live values)
    @app.get("/api/alerts-summary")
    def alerts_summary():
        return jsonify(COUNTS)

    # Risk index trend (demo)
    @app.get("/api/graph2")
    def graph2():
        return jsonify([
            {"t": "2025-10-15T14:00:00Z", "value": 0.26},
            {"t": "2025-10-15T15:00:00Z", "value": 0.32},
            {"t": "2025-10-15T16:00:00Z", "value": 0.28},
            {"t": "2025-10-15T17:00:00Z", "value": 0.44},
            {"t": "2025-10-15T18:00:00Z", "value": 0.38},
        ])

    # Protocol distribution (demo)
    @app.get("/api/graph3")
    def graph3():
        return jsonify([
            {"label": "IEC61850", "count": 52},
            {"label": "Modbus",   "count": 34},
            {"label": "DNP3",     "count": 18},
        ])

    # Ingest (optional persistence hook)
    @app.post("/api/ingest")
    def ingest():
        payload = request.get_json(force=True) or {}
        # If you later add a DB: insert here.
        return jsonify({"ok": True})

    # ------------------ Score + update live counters -------------------
    @app.post("/api/score")
    def api_score():
        event = request.get_json(force=True) or {}
        result = score_event(event)

        # Update counters
        COUNTS["total_events"] += 1
        if str(result.get("risk", "")).lower() == "high":
            COUNTS["high_risk_alerts"] += 1

        # Send alert safely (or log)
        send_alert_safe(
            event_id=result["event_id"],
            risk_score=result["reconstruction_error"],
            classification=result["risk"],
        )
        return jsonify(result)

    # Mitigation
    @app.post("/api/mitigate")
    def api_mitigate():
        payload = request.get_json(force=True) or {}
        severity = str(payload.get("severity", "low")).lower()
        action = recommend_mitigation(severity, payload)
        return jsonify({"severity": severity.capitalize(), "recommended_action": action})

    # (Optional) dev-only endpoint to reset counters quickly
    @app.post("/api/dev/reset-counters")
    def reset_counters():
        COUNTS["total_events"] = 0
        COUNTS["high_risk_alerts"] = 0
        return jsonify(COUNTS)

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)












