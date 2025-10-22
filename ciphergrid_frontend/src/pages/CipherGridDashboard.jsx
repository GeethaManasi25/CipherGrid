// src/pages/CipherGridDashboard.jsx
import React from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  TimeScale,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  TimeScale,
  Tooltip,
  Legend
);

/* ---------- Theme helpers (pull from CSS variables with fallbacks) ---------- */
function cssVar(name, fallback) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}
function hexToRgba(hex, alpha = 0.2) {
  const h = hex.replace("#", "");
  const bigint = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const theme = () => ({
  brand: cssVar("--brand", "#4f46e5"),
  ink: cssVar("--ink", "#0f172a"),
  inkSubtle: cssVar("--ink-subtle", "#334155"),
  grid: cssVar("--border", "#e5e7eb"),
});

/* --------------------------------- Cards ---------------------------------- */
export function NumberCard({ label, value }) {
  return (
    <div className="cg-card">
      <div className="cg-card-label">{label}</div>
      <div className="cg-card-value">{value}</div>
    </div>
  );
}

/* ---------------------------- Time series chart --------------------------- */
export function TimeSeriesChart({ data, height = 320 }) {
  const t = theme();
  const cfg = {
    labels: data.map(d => d.t),
    datasets: [
      {
        label: "Risk index",
        data: data.map(d => d.value),
        tension: 0.35,
        borderWidth: 2,
        borderColor: t.brand,
        backgroundColor: hexToRgba(t.brand, 0.18),
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: "#fff",
        pointBorderColor: t.brand,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        time: { unit: "hour" },
        ticks: { color: t.inkSubtle },
        grid: { color: t.grid },
      },
      y: {
        beginAtZero: true,
        ticks: { color: t.inkSubtle },
        grid: { color: t.grid },
      },
    },
    plugins: {
      legend: {
        labels: { color: t.ink, boxWidth: 16, usePointStyle: true, pointStyle: "circle" },
      },
      tooltip: {
        intersect: false,
        mode: "index",
      },
    },
  };

  return (
    <div style={{ height }}>
      <Line data={cfg} options={options} />
    </div>
  );
}

/* --------------------------- Category bar chart --------------------------- */
export function CategoryBar({ data, height = 320 }) {
  const t = theme();
  const cfg = {
    labels: data.map(d => d.label),
    datasets: [
      {
        label: "Count",
        data: data.map(d => d.count),
        borderWidth: 1,
        borderColor: t.brand,
        backgroundColor: hexToRgba(t.brand, 0.25),
        hoverBackgroundColor: hexToRgba(t.brand, 0.35),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: t.inkSubtle }, grid: { display: false } },
      y: { beginAtZero: true, ticks: { color: t.inkSubtle }, grid: { color: t.grid } },
    },
    plugins: {
      legend: { labels: { color: t.ink } },
      tooltip: { mode: "index", intersect: false },
    },
  };

  return (
    <div style={{ height }}>
      <Bar data={cfg} options={options} />
    </div>
  );
}
