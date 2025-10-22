import os
import sqlite3
from typing import List, Dict

DB_PATH = os.getenv("DATABASE", "./ciphergrid.db")

def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS attacks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts TEXT NOT NULL,          -- ISO-8601 Z
        node TEXT NOT NULL,        -- e.g. SG-01
        severity TEXT NOT NULL,    -- critical|high|medium|low
        type TEXT,                 -- modbus|iec61850|dnp3|opcua|dos|probe
        message TEXT,
        src_ip TEXT,
        dst_ip TEXT
    )
    """)
    conn.commit()
    conn.close()

def insert_attack(payload: dict) -> int:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
      INSERT INTO attacks (ts, node, severity, type, message, src_ip, dst_ip)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        payload.get("ts"),
        payload.get("node"),
        payload.get("severity"),
        payload.get("type"),
        payload.get("message"),
        payload.get("src_ip"),
        payload.get("dst_ip")
    ))
    conn.commit()
    rid = cur.lastrowid
    conn.close()
    return rid

def query_attacks(filters: Dict) -> List[Dict]:
    filters = filters or {}
    q = "SELECT * FROM attacks WHERE 1=1"
    params = []
    if filters.get("start"):
        q += " AND ts >= ?"; params.append(filters["start"])
    if filters.get("end"):
        q += " AND ts <= ?"; params.append(filters["end"])
    if filters.get("node"):
        q += " AND node = ?"; params.append(filters["node"])
    if filters.get("severity"):
        sev = filters["severity"]
        sevs = sev.split(",") if isinstance(sev, str) else list(sev)
        if sevs:
            q += " AND severity IN (%s)" % ",".join("?" for _ in sevs)
            params.extend(sevs)
    q += " ORDER BY ts DESC"
    conn = get_conn()
    rows = [dict(r) for r in conn.execute(q, params).fetchall()]
    conn.close()
    return rows

def summary_counts() -> Dict:
    conn = get_conn()
    cur = conn.cursor()
    out = {}
    out["totalEvents"] = cur.execute("SELECT COUNT(*) c FROM attacks").fetchone()["c"]
    for sev in ("critical", "high", "medium", "low"):
        out[sev] = cur.execute(
            "SELECT COUNT(*) c FROM attacks WHERE severity = ?", (sev,)
        ).fetchone()["c"]
    conn.close()
    return out

def series_by_bucket(bucket="hour", start=None, end=None) -> List[Dict]:
    if bucket == "minute":
        grp = "strftime('%Y-%m-%dT%H:%M:00', ts)"
    elif bucket == "day":
        grp = "strftime('%Y-%m-%dT00:00:00', ts)"
    else:
        grp = "strftime('%Y-%m-%dT%H:00:00', ts)"  # hour
    q = f"SELECT {grp} as ts, COUNT(*) as count FROM attacks WHERE 1=1"
    params = []
    if start:
        q += " AND ts >= ?"; params.append(start)
    if end:
        q += " AND ts <= ?"; params.append(end)
    q += f" GROUP BY {grp} ORDER BY ts ASC"
    conn = get_conn()
    rows = [dict(r) for r in conn.execute(q, params).fetchall()]
    conn.close()
    return rows

