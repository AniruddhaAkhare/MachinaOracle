"use client";
/**
 * ImpactPanel.tsx — Side panel for cascade simulation results
 * Shows: root failure, step-by-step propagation, total impact, containment
 */
import { motion, AnimatePresence } from "framer-motion";

interface PropStep {
  step: number; machine: string; machine_type: string; depth: number;
  impact_score: number; propagation_prob: number;
  estimated_downtime_hours: number; impact: string;
  machine_id?: string;
}
interface TotalImpact {
  affected_units: number; downtime: string; total_downtime_hours: number;
  cost: string; severity: string; critical_units: string[];
  cascade_depth: number;
}
interface Props {
  rootFailure: string;
  rootType: string;
  rootHealth: number;
  propagationSteps: PropStep[];
  totalImpact: TotalImpact;
  containment: string[];
  narrative: string;
  activeStep: number;
  isAnimating: boolean;
}

function SeverityBadge({ severity }: { severity: string }) {
  const cfg: Record<string, { bg: string; text: string; border: string }> = {
    CATASTROPHIC: { bg:"rgba(239,68,68,0.15)",  text:"#FCA5A5", border:"rgba(239,68,68,0.35)" },
    CRITICAL:     { bg:"rgba(239,68,68,0.10)",  text:"#F87171", border:"rgba(239,68,68,0.25)" },
    HIGH:         { bg:"rgba(249,115,22,0.12)", text:"#FDBA74", border:"rgba(249,115,22,0.3)" },
    MODERATE:     { bg:"rgba(245,158,11,0.12)", text:"#FCD34D", border:"rgba(245,158,11,0.3)" },
  };
  const c = cfg[severity] || cfg.MODERATE;
  return (
    <span style={{ fontFamily:"var(--f-mono)", fontSize:10, fontWeight:600,
      letterSpacing:"0.14em", padding:"3px 9px", borderRadius:3,
      background:c.bg, color:c.text, border:`1px solid ${c.border}` }}>
      {severity}
    </span>
  );
}

function ImpactScore({ score }: { score: number }) {
  const col = score > 70 ? "#EF4444" : score > 45 ? "#F97316" : "#F59E0B";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
      <div style={{ flex:1, height:3, background:"rgba(255,255,255,0.07)", borderRadius:2, overflow:"hidden" }}>
        <motion.div style={{ height:"100%", background:col, borderRadius:2 }}
          initial={{ width:0 }} animate={{ width:`${score}%` }}
          transition={{ duration:0.8, ease:[0.16,1,0.3,1] }}/>
      </div>
      <span style={{ fontFamily:"var(--f-mono)", fontSize:11, color:col, minWidth:32 }}>{score}%</span>
    </div>
  );
}

export default function ImpactPanel({
  rootFailure, rootType, rootHealth,
  propagationSteps, totalImpact, containment,
  narrative, activeStep, isAnimating,
}: Props) {

  const visibleSteps = activeStep === -1
    ? propagationSteps
    : propagationSteps.slice(0, activeStep);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0, height:"100%", overflowY:"auto" }}>

      {/* ── Root failure header ── */}
      <div style={{ padding:"20px 22px", background:"rgba(239,68,68,0.06)",
        borderBottom:"1px solid rgba(239,68,68,0.18)", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:10 }}>
          <motion.div
            animate={{ scale:[1,1.15,1], opacity:[1,0.7,1] }}
            transition={{ duration:1.6, repeat:Infinity, ease:"easeInOut" }}
            style={{ width:9, height:9, borderRadius:"50%", background:"#EF4444",
              boxShadow:"0 0 0 4px rgba(239,68,68,0.2)", flexShrink:0 }}/>
          <span style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"#EF4444",
            letterSpacing:"0.16em" }}>ROOT FAILURE ORIGIN</span>
        </div>
        <h3 style={{ fontFamily:"var(--f-cond)", fontSize:22, fontWeight:800,
          color:"#FCA5A5", marginBottom:6, lineHeight:1.25 }}>{rootFailure}</h3>
        <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
          <span style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"#64748B" }}>
            Type: <span style={{ color:"#94A3B8" }}>{rootType}</span>
          </span>
          <span style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"#64748B" }}>
            Health: <span style={{ color:rootHealth>60?"#22C55E":rootHealth>35?"#F59E0B":"#EF4444" }}>
              {rootHealth.toFixed(0)}/100
            </span>
          </span>
        </div>
      </div>

      {/* ── Total impact KPIs ── */}
      <div style={{ padding:"18px 22px", borderBottom:"1px solid var(--bd-1)", flexShrink:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <p style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"#64748B",
            letterSpacing:"0.14em", display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ display:"inline-block", width:3, height:13,
              background:"var(--blue)", borderRadius:2 }}/>
            TOTAL IMPACT
          </p>
          <SeverityBadge severity={totalImpact.severity}/>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:2 }}>
          {[
            ["Affected Units", String(totalImpact.affected_units), "#F1F5F9"],
            ["Downtime",       totalImpact.downtime,               "#F59E0B"],
            ["Est. Cost",      totalImpact.cost,                   "#EF4444"],
            ["Cascade Depth",  `${totalImpact.cascade_depth} hops`,"#94A3B8"],
          ].map(([l,v,c])=>(
            <div key={l as string} style={{ background:"var(--bg-3)",
              border:"1px solid var(--bd-1)", borderRadius:6, padding:"12px 14px" }}>
              <p style={{ fontFamily:"var(--f-mono)", fontSize:10, color:"#475569",
                letterSpacing:"0.12em", marginBottom:6 }}>{l}</p>
              <span style={{ fontFamily:"var(--f-cond)", fontSize:20,
                fontWeight:700, color:c as string }}>{v}</span>
            </div>
          ))}
        </div>
        {totalImpact.critical_units?.length > 0 && (
          <div style={{ marginTop:10, padding:"9px 12px", background:"rgba(239,68,68,0.07)",
            border:"1px solid rgba(239,68,68,0.15)", borderRadius:5 }}>
            <p style={{ fontFamily:"var(--f-mono)", fontSize:10, color:"#EF4444",
              letterSpacing:"0.12em", marginBottom:5 }}>CRITICAL UNITS</p>
            <p style={{ fontFamily:"var(--f-sans)", fontSize:13, color:"#FCA5A5" }}>
              {totalImpact.critical_units.join(" · ")}
            </p>
          </div>
        )}
      </div>

      {/* ── Propagation steps ── */}
      <div style={{ padding:"18px 22px", borderBottom:"1px solid var(--bd-1)", flex:1 }}>
        <p style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"#64748B",
          letterSpacing:"0.14em", marginBottom:14, display:"flex", alignItems:"center", gap:7 }}>
          <span style={{ display:"inline-block", width:3, height:13,
            background:"var(--blue)", borderRadius:2 }}/>
          PROPAGATION CHAIN
        </p>

        {propagationSteps.length === 0 && (
          <p style={{ fontFamily:"var(--f-mono)", fontSize:12, color:"#3A4A5C", textAlign:"center", paddingTop:12 }}>
            No cascade propagation detected.<br/>Machine may be isolated.
          </p>
        )}

        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          <AnimatePresence>
            {visibleSteps.map((s, i) => {
              const col = s.impact_score > 70 ? "#EF4444" : s.impact_score > 45 ? "#F97316" : "#F59E0B";
              return (
                <motion.div key={s.machine_id || s.machine || i}
                  initial={{ opacity:0, x:-12, height:0 }}
                  animate={{ opacity:1, x:0, height:"auto" }}
                  exit={{ opacity:0, height:0 }}
                  transition={{ duration:0.35, ease:[0.16,1,0.3,1], delay: i*0.04 }}
                  style={{ overflow:"hidden" }}>
                  <div style={{ display:"flex", gap:12, padding:"10px 0",
                    borderBottom:"1px solid rgba(255,255,255,0.04)", alignItems:"flex-start" }}>
                    {/* Step connector line + number */}
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
                      flexShrink:0, paddingTop:2 }}>
                      <div style={{ width:22, height:22,
                        background:`${col}22`, border:`1px solid ${col}60`,
                        borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center",
                        fontFamily:"var(--f-mono)", fontSize:10, fontWeight:700, color:col }}>
                        {s.step}
                      </div>
                      {i < visibleSteps.length - 1 && (
                        <div style={{ width:1, height:16, background:`${col}30`, marginTop:2 }}/>
                      )}
                    </div>

                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", justifyContent:"space-between",
                        alignItems:"flex-start", marginBottom:4, gap:6 }}>
                        <span style={{ fontFamily:"var(--f-sans)", fontSize:13,
                          fontWeight:600, color:"#CBD5E1", lineHeight:1.3 }}>{s.machine}</span>
                        <span style={{ fontFamily:"var(--f-mono)", fontSize:10,
                          color:"#64748B", flexShrink:0 }}>~{s.estimated_downtime_hours}h</span>
                      </div>
                      <ImpactScore score={s.impact_score}/>
                      <p style={{ fontFamily:"var(--f-mono)", fontSize:10, color:"#475569",
                        marginTop:4, lineHeight:1.5 }}>
                        Hop {s.depth} · Prob {s.propagation_prob}% · {s.machine_type}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Containment ── */}
      {containment?.length > 0 && (
        <div style={{ padding:"18px 22px", borderBottom:"1px solid var(--bd-1)", flexShrink:0 }}>
          <p style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"#64748B",
            letterSpacing:"0.14em", marginBottom:12, display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ display:"inline-block", width:3, height:13,
              background:"#22C55E", borderRadius:2 }}/>
            CONTAINMENT PLAN
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {containment.map((action, i) => (
              <motion.div key={i}
                initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                transition={{ delay:0.05*i, duration:0.35 }}
                style={{ display:"flex", gap:10, alignItems:"flex-start",
                  padding:"9px 12px", background:"rgba(34,197,94,0.05)",
                  border:"1px solid rgba(34,197,94,0.12)", borderRadius:6 }}>
                <div style={{ width:18, height:18, background:"rgba(34,197,94,0.15)",
                  border:"1px solid rgba(34,197,94,0.3)", borderRadius:4, flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"var(--f-mono)", fontSize:9, fontWeight:700, color:"#22C55E" }}>
                  {i+1}
                </div>
                <p style={{ fontFamily:"var(--f-sans)", fontSize:13, color:"#94A3B8",
                  lineHeight:1.55 }}>{action}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── AI Narrative ── */}
      {narrative && (
        <div style={{ padding:"18px 22px", flexShrink:0 }}>
          <p style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"#64748B",
            letterSpacing:"0.14em", marginBottom:10, display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ display:"inline-block", width:3, height:13,
              background:"var(--blue)", borderRadius:2 }}/>
            AI ANALYSIS
          </p>
          <p style={{ fontFamily:"var(--f-sans)", fontSize:14, color:"#94A3B8",
            lineHeight:1.75 }}>{narrative}</p>
        </div>
      )}
    </div>
  );
}
