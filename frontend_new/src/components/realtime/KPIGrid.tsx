"use client";
/**
 * KPIGrid.tsx — Live KPI cards row
 */
import { motion } from "framer-motion";

interface KPICardProps {
  label:  string;
  value:  string | number;
  unit?:  string;
  color?: string;
  sub?:   string;
  pulse?: boolean;
}

function KPICard({ label, value, unit, color, sub, pulse }: KPICardProps) {
  const c = color || "var(--blue-light)";
  return (
    <div className="kpi" style={{ color: c, position:"relative" }}>
      {pulse && (
        <span style={{ position:"absolute", top:14, right:14 }}>
          <motion.div animate={{ scale:[1,1.4,1], opacity:[1,0.4,1] }}
            transition={{ duration:1.6, repeat:Infinity }}
            style={{ width:6, height:6, borderRadius:"50%", background:c }}/>
        </span>
      )}
      <p className="kpi-label">{label}</p>
      <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
        <span className="kpi-val" style={{ fontSize:28, color: c }}>{value}</span>
        {unit && <span style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"#475569" }}>{unit}</span>}
      </div>
      {sub && <p className="kpi-sub">{sub}</p>}
      <div className="kpi-bar"/>
    </div>
  );
}

interface KPIs {
  fleet_health:   number;
  failure_index:  number;
  avg_fail_prob:  number;
  critical_count: number;
  warning_count:  number;
  normal_count:   number;
  total_machines: number;
  downtime_hrs:   number;
  active_alerts:  number;
}

export default function KPIGrid({ kpis }: { kpis: KPIs }) {
  const fh   = kpis.fleet_health ?? 0;
  const fi   = kpis.failure_index ?? 0;
  const afp  = kpis.avg_fail_prob ?? 0;
  const cc   = kpis.critical_count ?? 0;
  const wc   = kpis.warning_count ?? 0;

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(130px,1fr))", gap:8 }}>
      <KPICard label="Fleet Health"    value={fh.toFixed(1)}  unit="%" color={fh>70?"#22C55E":fh>40?"#F59E0B":"#EF4444"} sub="All machines avg"/>
      <KPICard label="Failure Index"   value={fi.toFixed(1)}  unit="/100" color={fi<30?"#22C55E":fi<60?"#F59E0B":"#EF4444"} sub="Higher = more risk"/>
      <KPICard label="Fail Probability" value={afp.toFixed(1)} unit="%" color="#F97316" sub="Fleet average"/>
      <KPICard label="Critical"        value={cc} color="#EF4444" sub="Machines critical" pulse={cc>0}/>
      <KPICard label="Warnings"        value={wc} color="#F59E0B" sub="Machines warning"/>
      <KPICard label="Nominal"         value={kpis.normal_count??0} color="#22C55E" sub="Operating OK"/>
      <KPICard label="Active Alerts"   value={kpis.active_alerts??0} color={kpis.active_alerts>0?"#EF4444":"#22C55E"} sub="Open incidents" pulse={(kpis.active_alerts??0)>0}/>
      <KPICard label="Est. Downtime"   value={kpis.downtime_hrs?.toFixed(1)??0} unit="hrs" color="#8B5CF6" sub="If all fail now"/>
    </div>
  );
}
