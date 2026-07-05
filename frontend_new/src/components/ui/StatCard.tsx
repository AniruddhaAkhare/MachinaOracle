interface Props {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  sub?: string;
}

export default function StatCard({ label, value, unit, color, sub }: Props) {
  return (
    <div className="panel" style={{ padding: "16px 20px" }}>
      <p className="section-label" style={{ marginBottom: 8 }}>{label}</p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span className="stat-num font-display" style={{ fontSize: 28, color: color || "var(--text-1)", fontWeight: 700 }}>
          {value}
        </span>
        {unit && <span className="font-mono text-2xs" style={{ color: "var(--text-3)" }}>{unit}</span>}
      </div>
      {sub && <p style={{ marginTop: 4, fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{sub}</p>}
    </div>
  );
}
