// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import { api } from "../api/client"; // uses your existing axios client

export default function HomePage() {
  // live summary from Flask: { total_events, high_risk_alerts }
  const [summary, setSummary] = useState({ total_events: 0, high_risk_alerts: 0 });
  const [loading, setLoading] = useState(true);

  // simple in-app navigation (no react-router needed)
  const nav = (to) => (e) => {
    e.preventDefault();
    window.history.pushState({}, "", to);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const r = await api.get("/api/alerts-summary");
        if (mounted && r && r.data) {
          setSummary({
            total_events: Number(r.data.total_events ?? 0),
            high_risk_alerts: Number(r.data.high_risk_alerts ?? 0),
          });
        }
      } catch (err) {
        console.warn("Failed to load summary:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    // light polling so Home updates after scoring events
    const id = setInterval(load, 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="home-container">
      {/* Hero */}
      <div className="home-header">
        <h1 className="welcome-text">Welcome to CipherGrid</h1>
        <p className="tagline">
          <strong>
            AI-powered anomaly detection and mitigation for critical energy and smart-grid systems
          </strong>
        </p>

        <div className="hero-buttons">
          <a className="btn" href="/ingest" onClick={nav("/ingest")}>🚀 Try Ingest</a>
          <a className="btn" href="/insights" onClick={nav("/insights")}>📊 View Insights</a>
        </div>
      </div>

      {/* At a glance */}
      <div className="panel" style={{ marginTop: "2rem" }}>
        <h3 className="panel-title">At a glance</h3>
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-title">Total Events</div>
            <div className="stat-value">
              {loading ? "—" : summary.total_events}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-title">High-Risk Alerts</div>
            <div className="stat-value">
              {loading ? "—" : summary.high_risk_alerts}
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="features-section">
        <div className="feature-card">
          <div className="feature-icon">⚙️</div>
          <h4 className="feature-title">Real-time Scoring</h4>
          <p>Post events for instant reconstruction-error risk scoring with live feedback.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🧭</div>
          <h4 className="feature-title">Recommended Actions</h4>
          <p>Built-in playbooks suggest safe mitigations automatically based on severity.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🔌</div>
          <h4 className="feature-title">Protocol Awareness</h4>
          <p>Supports IEC 61850, Modbus, and DNP3 with DPI-friendly structured parsing.</p>
        </div>
      </div>
    </div>
  );
}

