interface Props { label: string; value: string | number; unit?: string; color?: string; sub?: string; trend?: "up"|"down"|"flat"; }
export default function StatCard({ label, value, unit, color, sub, trend }: Props) {
  const tEl = trend === "up" ? "↑ Increasing" : trend === "down" ? "↓ Decreasing" : trend === "flat" ? "→ Stable" : null;
  const tCl = trend === "up" ? "trend-up" : trend === "down" ? "trend-down" : "trend-flat";
  return (
    <div className="kpi" style={{ color: color || "var(--blue-light)" }}>
      <p className="kpi-label">{label}</p>
      <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
        <span className="kpi-val" style={{ color: color || "var(--t1)" }}>{value}</span>
        {unit && <span style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"var(--t4)" }}>{unit}</span>}
      </div>
      {(sub || tEl) && (
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
          {sub && <p className="kpi-sub">{sub}</p>}
          {tEl && <span className={tCl}>{tEl}</span>}
        </div>
      )}
      <div className="kpi-bar" />
    </div>
  );
}
