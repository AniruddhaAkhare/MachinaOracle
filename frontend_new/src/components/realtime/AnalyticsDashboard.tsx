"use client";
/**
 * AnalyticsDashboard.tsx
 * Right panel — all live-updating charts and KPIs driven by WebSocket data.
 */
import { memo } from "react";
import { motion } from "framer-motion";
import HealthGauge       from "./HealthGauge";
import { TempLineChart, VibLineChart, HealthTrendChart, RiskBarChart, RiskHeatmap, FailureIndexMeter } from "./Charts";
import KPIGrid           from "./KPIGrid";

interface Props {
  kpis:            any;
  trend:           any[];
  heatmap:         any[];
  riskBars:        any[];
  alerts:          any[];
  criticalMachines:any[];
}

function SectionLabel({ text, color="var(--blue)" }: { text:string; color?:string }) {
  return (
    <p style={{ fontFamily:"var(--f-mono)", fontSize:10, color:"#64748B",
      letterSpacing:"0.16em", textTransform:"uppercase", marginBottom:10,
      display:"flex", alignItems:"center", gap:7 }}>
      <span style={{ display:"inline-block", width:3, height:12,
        background:color, borderRadius:2 }}/>
      {text}
    </p>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background:"var(--bg-2)", border:"1px solid var(--bd-1)", borderRadius:8,
      padding:"14px 16px", ...style }}>
      {children}
    </div>
  );
}

const AnalyticsDashboard = memo(({
  kpis, trend, heatmap, riskBars, alerts, criticalMachines
}: Props) => {
  const fh = kpis?.fleet_health ?? 0;
  const fi = kpis?.failure_index ?? 0;
  const afp = kpis?.avg_fail_prob ?? 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, height:"100%", overflowY:"auto" }}>

      {/* ── KPI strip ── */}
      <KPIGrid kpis={kpis || {}} />

      {/* ── Gauges row ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
        <Card style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"14px 8px" }}>
          <SectionLabel text="Fleet Health"/>
          <HealthGauge value={fh} label="Fleet Health" sub="%" colorMode="health" size={120}/>
        </Card>
        <Card style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"14px 8px" }}>
          <SectionLabel text="Fail Probability"/>
          <HealthGauge value={afp} label="Fail Prob" sub="%" colorMode="risk" size={120}/>
        </Card>
        <Card style={{ padding:"14px 16px" }}>
          <SectionLabel text="Failure Index" color="#EF4444"/>
          <FailureIndexMeter value={fi}/>
          <div style={{ marginTop:16 }}>
            <SectionLabel text="Downtime Pred."/>
            <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
              <span style={{ fontFamily:"var(--f-cond)", fontSize:28, fontWeight:700,
                color:"#8B5CF6" }}>{(kpis?.downtime_hrs??0).toFixed(1)}</span>
              <span style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"#475569" }}>hrs</span>
            </div>
            <p style={{ fontFamily:"var(--f-mono)", fontSize:10, color:"#475569", marginTop:3 }}>
              Est. total downtime if unchecked
            </p>
          </div>
        </Card>
      </div>

      {/* ── Line charts ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <Card>
          <SectionLabel text="Temperature Trend (Fleet Avg)" color="#F97316"/>
          <TempLineChart data={trend}/>
        </Card>
        <Card>
          <SectionLabel text="Vibration Trend (Fleet Avg)" color="#8B5CF6"/>
          <VibLineChart data={trend}/>
        </Card>
      </div>

      {/* ── Health trend + risk bar ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <Card>
          <SectionLabel text="Fleet Health Over Time" color="#3B82F6"/>
          <HealthTrendChart data={trend}/>
        </Card>
        <Card>
          <SectionLabel text="Machine Risk Ranking" color="#EF4444"/>
          <RiskBarChart data={riskBars}/>
        </Card>
      </div>

      {/* ── Heatmap ── */}
      <Card>
        <SectionLabel text="Risk Heatmap — All Machines"/>
        <RiskHeatmap data={heatmap}/>
      </Card>

      {/* ── Active alerts + critical machines ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {/* Alerts */}
        <Card>
          <SectionLabel text={`Active Alerts (${alerts.length})`} color="#EF4444"/>
          {alerts.length === 0 ? (
            <p style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"#3A4A5C" }}>
              No active alerts — all systems nominal
            </p>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:6, maxHeight:160, overflowY:"auto" }}>
              {alerts.slice(0,6).map((a: any, i: number) => {
                const col = a.severity==="CRITICAL"?"#EF4444":a.severity==="WARNING"?"#F59E0B":"#22C55E";
                return (
                  <motion.div key={`${a.machine_id}-${i}`}
                    initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                    style={{ padding:"6px 10px", background:`${col}0e`,
                      border:`1px solid ${col}25`, borderLeft:`3px solid ${col}`,
                      borderRadius:5 }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontFamily:"var(--f-mono)", fontSize:10,
                        color:col, fontWeight:700 }}>{a.severity}</span>
                      <span style={{ fontFamily:"var(--f-mono)", fontSize:10,
                        color:"#475569" }}>H:{a.health?.toFixed(0)}%</span>
                    </div>
                    <p style={{ fontFamily:"var(--f-sans)", fontSize:12,
                      color:"#94A3B8", marginTop:2 }}>{a.machine_name}</p>
                    <p style={{ fontFamily:"var(--f-mono)", fontSize:10,
                      color:"#475569", marginTop:1 }}>
                      {a.label?.replace(/_/g," ")}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Critical machines */}
        <Card>
          <SectionLabel text="Critical Machines" color="#EF4444"/>
          {criticalMachines.length === 0 ? (
            <p style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"#3A4A5C" }}>
              No machines in critical state
            </p>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:6, maxHeight:160, overflowY:"auto" }}>
              {criticalMachines.map((m: any, i: number) => {
                const col = m.health_score < 35 ? "#EF4444" : "#F59E0B";
                return (
                  <div key={m.machine_id}
                    style={{ display:"flex", justifyContent:"space-between",
                      alignItems:"center", padding:"7px 10px",
                      background:"rgba(239,68,68,0.06)",
                      border:"1px solid rgba(239,68,68,0.15)", borderRadius:5 }}>
                    <div>
                      <p style={{ fontFamily:"var(--f-sans)", fontSize:12,
                        fontWeight:500, color:"#CBD5E1" }}>{m.machine_name}</p>
                      <p style={{ fontFamily:"var(--f-mono)", fontSize:10,
                        color:"#475569" }}>{m.machine_type}</p>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <p style={{ fontFamily:"var(--f-cond)", fontSize:16,
                        fontWeight:700, color:col }}>{m.health_score?.toFixed(0)}%</p>
                      <p style={{ fontFamily:"var(--f-mono)", fontSize:9,
                        color:col }}>{m.failure_label?.replace(/_/g," ")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
});

AnalyticsDashboard.displayName = "AnalyticsDashboard";
export default AnalyticsDashboard;
