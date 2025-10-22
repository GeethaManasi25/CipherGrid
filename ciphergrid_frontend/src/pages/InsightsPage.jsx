import React, { useEffect, useState, useRef } from "react";
import { api } from "../api/client";
import { NumberCard, TimeSeriesChart, CategoryBar } from "./CipherGridDashboard";

export default function InsightsPage() {
  const [summary, setSummary] = useState({ total_events: 0, high_risk_alerts: 0 });
  const [trend, setTrend] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const timerRef = useRef(null);

  const fetchSummary = async () => {
    const r = await api.get("/api/alerts-summary");
    setSummary(r.data);
  };
  const fetchCharts = async () => {
    const t = await api.get("/api/graph2");
    const p = await api.get("/api/graph3");
    setTrend(t.data);
    setProtocols(p.data);
  };

  useEffect(() => {
    // initial load
    fetchSummary();
    fetchCharts();

    // poll every 5 seconds for live counter updates
    timerRef.current = setInterval(fetchSummary, 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="container">
      <h2 className="page-title" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        Operational insights
        <button className="btn" onClick={() => { fetchSummary(); }}>
          Refresh
        </button>
      </h2>

      <div className="stats-row">
        <NumberCard label="Total Events" value={summary.total_events} />
        <NumberCard label="High-Risk Alerts" value={summary.high_risk_alerts} />
      </div>

      <section className="panel">
        <div className="panel-title">Risk Index Over Time</div>
        <TimeSeriesChart data={trend} />
      </section>

      <section className="panel">
        <div className="panel-title">Protocol Distribution</div>
        <CategoryBar data={protocols} />
      </section>
    </div>
  );
}
