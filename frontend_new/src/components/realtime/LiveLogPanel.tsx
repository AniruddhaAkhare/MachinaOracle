"use client";
/**
 * LiveLogPanel.tsx
 * Terminal-style streaming log panel.
 * Colour-codes entries: green=NORMAL, yellow=WARNING, red=CRITICAL
 */
import { useEffect, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface LogEntry {
  id:           string;
  machine_name: string;
  machine_type: string;
  machine_id:   string;
  timestamp:    string;
  severity:     "NORMAL" | "WARNING" | "CRITICAL";
  failure_label:string;
  health_score: number;
  log_text:     string;
  sensor_data:  Record<string, number>;
}

interface Props { logs: LogEntry[]; maxVisible?: number; }

const SEV_COLOR: Record<string, string> = {
  CRITICAL: "#EF4444",
  WARNING:  "#F59E0B",
  NORMAL:   "#22C55E",
};
const SEV_BG: Record<string, string> = {
  CRITICAL: "rgba(239,68,68,0.06)",
  WARNING:  "rgba(245,158,11,0.05)",
  NORMAL:   "transparent",
};
const SEV_BORDER: Record<string, string> = {
  CRITICAL: "rgba(239,68,68,0.25)",
  WARNING:  "rgba(245,158,11,0.2)",
  NORMAL:   "transparent",
};

function fmtTs(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-GB", { hour12: false });
  } catch { return "--:--:--"; }
}

const LogRow = memo(({ entry }: { entry: LogEntry }) => {
  const col    = SEV_COLOR[entry.severity]  || "#64748B";
  const bg     = SEV_BG[entry.severity]    || "transparent";
  const border = SEV_BORDER[entry.severity]|| "transparent";
  const s      = entry.sensor_data || {};

  return (
    <motion.div
      initial={{ opacity: 0, x: -10, height: 0 }}
      animate={{ opacity: 1, x: 0,   height: "auto" }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      style={{
        padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)",
        background: bg,
        borderLeft: `3px solid ${border}`,
        fontFamily: "var(--f-mono)",
        overflow: "hidden",
      }}>

      {/* Top row: timestamp + machine + badge */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
        <span style={{ fontSize:11, color:"#475569", flexShrink:0 }}>{fmtTs(entry.timestamp)}</span>
        <span style={{ width:1, height:10, background:"rgba(255,255,255,0.1)", flexShrink:0 }}/>
        <span style={{ fontSize:10, color:col, fontWeight:600, letterSpacing:"0.12em", flexShrink:0 }}>
          {entry.severity}
        </span>
        <span style={{ width:1, height:10, background:"rgba(255,255,255,0.1)", flexShrink:0 }}/>
        <span style={{ fontSize:11, color:"#94A3B8", flexShrink:0, maxWidth:130,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {entry.machine_name}
        </span>
        <span style={{ fontSize:10, color:"#3A4A5C", flexShrink:0 }}>
          {entry.machine_id}
        </span>
        <span style={{ marginLeft:"auto", flexShrink:0 }}>
          <span style={{ fontSize:10, color: entry.health_score > 70 ? "#22C55E"
            : entry.health_score > 40 ? "#F59E0B" : "#EF4444",
            fontWeight:600 }}>H:{entry.health_score.toFixed(0)}%</span>
        </span>
      </div>

      {/* Log text */}
      <p style={{ fontSize:11.5, color: entry.severity==="CRITICAL"?"#FCA5A5"
        : entry.severity==="WARNING"?"#FCD34D":"#64748B",
        lineHeight:1.45, marginBottom:4 }}>
        {entry.log_text}
      </p>

      {/* Sensor mini-row */}
      <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
        {[
          ["T", s.temperature, "°C"],
          ["V", s.vibration,   "mm/s"],
          ["P", s.pressure,    "PSI"],
          ["RPM", s.rpm,       ""],
        ].map(([k, v, u]) => v !== undefined && (
          <span key={String(k)} style={{ fontSize:10, color:"#3A4A5C" }}>
            <span style={{ color:"#475569" }}>{k}:</span>
            <span style={{ color:"#64748B", marginLeft:2 }}>{Number(v).toFixed(1)}{u}</span>
          </span>
        ))}
        <span style={{ fontSize:10, color:"#3A4A5C", marginLeft:"auto" }}>
          {entry.failure_label.replace(/_/g," ")}
        </span>
      </div>
    </motion.div>
  );
});
LogRow.displayName = "LogRow";

export default function LiveLogPanel({ logs, maxVisible = 120 }: Props) {
  const bottomRef  = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoScroll = useRef(true);

  // Auto-scroll to bottom unless user has scrolled up
  useEffect(() => {
    if (!autoScroll.current) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    autoScroll.current = atBottom;
  };

  const visible = logs.slice(-maxVisible);
  const critCount = logs.filter(l => l.severity === "CRITICAL").length;
  const warnCount = logs.filter(l => l.severity === "WARNING").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%",
      background:"#080A0F", border:"1px solid rgba(255,255,255,0.07)", borderRadius:8 }}>

      {/* ── Header ── */}
      <div style={{ padding:"10px 14px", borderBottom:"1px solid rgba(255,255,255,0.07)",
        display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
        {/* Live dot */}
        <motion.div animate={{ scale:[1,1.3,1], opacity:[1,0.5,1] }}
          transition={{ duration:1.2, repeat:Infinity }}
          style={{ width:7, height:7, borderRadius:"50%", background:"#22C55E", flexShrink:0 }}/>
        <span style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"#94A3B8",
          letterSpacing:"0.14em" }}>LIVE MACHINE LOGS</span>
        <div style={{ marginLeft:"auto", display:"flex", gap:10 }}>
          {critCount > 0 && (
            <span style={{ fontFamily:"var(--f-mono)", fontSize:10, color:"#EF4444",
              background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)",
              padding:"2px 8px", borderRadius:3 }}>
              {critCount} CRIT
            </span>
          )}
          {warnCount > 0 && (
            <span style={{ fontFamily:"var(--f-mono)", fontSize:10, color:"#F59E0B",
              background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)",
              padding:"2px 8px", borderRadius:3 }}>
              {warnCount} WARN
            </span>
          )}
          <span style={{ fontFamily:"var(--f-mono)", fontSize:10, color:"#475569" }}>
            {logs.length} entries
          </span>
        </div>
      </div>

      {/* ── Log stream ── */}
      <div ref={containerRef} onScroll={handleScroll}
        style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>
        <AnimatePresence initial={false}>
          {visible.map(entry => (
            <LogRow key={entry.id} entry={entry} />
          ))}
        </AnimatePresence>
        <div ref={bottomRef} style={{ height:4 }}/>
      </div>

      {/* ── Footer ── */}
      <div style={{ padding:"7px 14px", borderTop:"1px solid rgba(255,255,255,0.05)",
        display:"flex", justifyContent:"space-between", flexShrink:0 }}>
        <span style={{ fontFamily:"var(--f-mono)", fontSize:10, color:"#3A4A5C" }}>
          Stream interval: 5s · Vector DB context: active
        </span>
        <button onClick={() => { autoScroll.current = true; bottomRef.current?.scrollIntoView({behavior:"smooth"}); }}
          style={{ fontFamily:"var(--f-mono)", fontSize:10, color:"#475569",
            background:"transparent", border:"none", cursor:"pointer" }}>
          ↓ Jump to latest
        </button>
      </div>
    </div>
  );
}
