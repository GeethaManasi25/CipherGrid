import React, { useState } from "react";
import { api } from "../api/client";

function Tag({ level }) {
  const v = String(level || "").toLowerCase();
  const cls =
    v === "high" ? "tag high" :
    v === "medium" ? "tag medium" :
    v === "critical" ? "tag critical" : "tag low";
  const label = v ? v[0].toUpperCase() + v.slice(1) : "Low";
  return <span className={cls}>{label}</span>;
}

export default function IngestPage() {
  const [payload, setPayload] = useState({
    event_id: "evt-demo-1",
    node: "SG-01",
    protocol: "iec61850",
  });

  const [score, setScore] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loadingScore, setLoadingScore] = useState(false);
  const [loadingMit, setLoadingMit] = useState(false);

  const safeSetPayload = (str) => {
    try {
      const obj = JSON.parse(str);
      setPayload(obj);
    } catch {
      // ignore until valid JSON
    }
  };

  const handleScore = async () => {
    setLoadingScore(true);
    setRecommendation(null);
    try {
      const r = await api.post("/api/score", payload);
      setScore(r.data);
    } finally {
      setLoadingScore(false);
    }
  };

  const handleMitigate = async () => {
    if (!score) return;
    setLoadingMit(true);
    try {
      const sev = String(score.severity || score.risk || "low").toLowerCase();
      const r = await api.post("/api/mitigate", { severity: sev, meta: score });
      setRecommendation(r.data);
    } finally {
      setLoadingMit(false);
    }
  };

  return (
    <div className="container">
      <h2 className="page-title" style={{ textTransform: "capitalize" }}>
        Ingest Test Event
      </h2>

      {/* Input & actions */}
      <section className="panel">
        <div className="panel-title">Send Event → Score</div>

        <textarea
          className="text-area"
          value={JSON.stringify(payload, null, 2)}
          onChange={(e) => safeSetPayload(e.target.value)}
          spellCheck="false"
        />

        <div className="btn-row" style={{ marginTop: 20, gap: "1.2rem" }}>
          <button className="btn" onClick={handleScore} disabled={loadingScore}>
            {loadingScore ? "Scoring…" : "Score Event"}
          </button>
          <button
            className="btn"
            onClick={handleMitigate}
            disabled={!score || loadingMit}
          >
            {loadingMit ? "Mitigating…" : "Mitigate"}
          </button>
        </div>
      </section>

      {/* Score Result */}
      {score && (
        <section className="panel">
          <div className="panel-title">
            Score Result <Tag level={score.severity || score.risk} />
          </div>

          <div className="result-box">
            <p><strong>Event ID:</strong> {score.event_id}</p>
            <p><strong>Node:</strong> {score.node}</p>
            <p><strong>Protocol:</strong> {score.protocol}</p>
            <p><strong>Reconstruction Error:</strong> {score.reconstruction_error}</p>
            <p><strong>Risk:</strong> <Tag level={score.risk} /></p>
            <p><strong>Severity:</strong> <Tag level={score.severity} /></p>
          </div>
        </section>
      )}

      {/* Recommended Action */}
      {recommendation && (
        <section className="panel">
          <div className="panel-title">Recommended Action</div>

          <div className="result-box">
            <p><strong>Action:</strong> {recommendation.recommended_action}</p>
            <p><strong>Severity:</strong> <Tag level={recommendation.severity} /></p>
          </div>
        </section>
      )}
    </div>
  );
}

