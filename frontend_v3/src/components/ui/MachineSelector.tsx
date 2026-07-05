"use client";
import { motion } from "framer-motion";

interface Props { machines: any[]; onSelect: (m: any) => void; }

function hColor(s: number) {
  return s < 40 ? "var(--red)" : s < 65 ? "var(--orange)" : s < 80 ? "var(--amber)" : "var(--green)";
}
function hBadge(s: number) {
  return s < 40 ? "b-red" : s < 65 ? "b-orange" : s < 80 ? "b-amber" : "b-green";
}
function hLabel(s: number) {
  return s < 40 ? "Critical" : s < 65 ? "High Risk" : s < 80 ? "Moderate" : "Nominal";
}

export default function MachineSelector({ machines, onSelect }: Props) {
  return (
    <div style={{ minHeight:"calc(100vh - 58px)", padding:"44px 32px" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }} style={{ marginBottom:36 }}>
          <p className="slabel" style={{ marginBottom:10 }}>Scan Complete — {machines.length} Unit{machines.length !== 1 ? "s" : ""} Detected</p>
          <h2 style={{ fontFamily:"var(--f-cond)", fontSize:38, fontWeight:800, color:"var(--t1)", letterSpacing:"-0.01em", marginBottom:10 }}>Select Machine Unit</h2>
          <p style={{ fontSize:15, color:"var(--t3)", maxWidth:520 }}>Each unit runs independently through 14 AI agent modules. Click to open the full analysis dashboard.</p>
          <div className="hr-blue" style={{ marginTop:22 }} />
        </motion.div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:14 }}>
          {machines.map((m, i) => {
            const s = m.sensor_data || {};
            const hs = s.health_score ?? m.health_score ?? 75;
            const c = hColor(hs);
            return (
              <motion.div key={m.machine_id}
                initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:i * 0.07, duration:0.4, ease:[0.16,1,0.3,1] }}
                onClick={() => onSelect(m)} className="card"
                style={{ padding:24, cursor:"pointer", position:"relative", overflow:"hidden" }}
                whileHover={{ y:-2 }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--bd-3)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--bd-1)"}>
                {/* accent bar */}
                <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${c}90,transparent)` }} />
                <div style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"var(--t4)", marginBottom:18 }}>UNIT-{String(i+1).padStart(2,"0")} · {m.machine_id}</div>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:14, marginBottom:16 }}>
                  <div style={{ flex:1 }}>
                    <h3 style={{ fontFamily:"var(--f-sans)", fontSize:18, fontWeight:600, color:"var(--t1)", marginBottom:4, lineHeight:1.25 }}>{m.machine_name}</h3>
                    <p style={{ fontSize:13, color:"var(--t4)" }}>{m.machine_type || "Industrial Equipment"}</p>
                  </div>
                  <svg width="56" height="56" viewBox="0 0 56 56" style={{ flexShrink:0 }}>
                    <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4"/>
                    <circle cx="28" cy="28" r="22" fill="none" stroke={c} strokeWidth="4"
                      strokeDasharray={`${2*Math.PI*22*hs/100} ${2*Math.PI*22}`}
                      transform="rotate(-90 28 28)" style={{ transition:"stroke-dasharray 1s ease" }}/>
                    <text x="28" y="32" textAnchor="middle" fill={c} style={{ fontSize:13, fontFamily:"var(--f-cond)", fontWeight:700 }}>{Math.round(hs)}</text>
                  </svg>
                </div>
                <span className={`badge ${hBadge(hs)}`}>{hLabel(hs)}</span>
                <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
                  {Object.entries(s).filter(([k]) => k !== "health_score").slice(0, 4).map(([k, v]) => (
                    <div key={k} style={{ background:"rgba(255,255,255,0.03)", borderRadius:4, padding:"5px 8px" }}>
                      <div style={{ fontFamily:"var(--f-mono)", fontSize:10, color:"var(--t5)", marginBottom:1 }}>{k.replace(/_/g," ")}</div>
                      <div style={{ fontFamily:"var(--f-mono)", fontSize:13, color:"var(--t2)", fontWeight:500 }}>
                        {typeof v === "number" ? v.toFixed(1) : String(v)}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:16, paddingTop:13, borderTop:"1px solid var(--bd-1)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"var(--t4)" }}>OPEN ANALYSIS</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--blue-light)" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
