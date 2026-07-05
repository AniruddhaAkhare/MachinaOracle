interface Props {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  icon?: string;
  sub?: string;
}

export default function StatCard({ label, value, unit, color, icon, sub }: Props) {
  return (
    <div className="glass-panel rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-mono text-metal-300 uppercase tracking-wider">{label}</p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="flex items-end gap-1">
        <span className="font-display text-2xl font-bold" style={{ color: color || "#00f5ff" }}>
          {value}
        </span>
        {unit && <span className="text-xs text-metal-300 mb-1">{unit}</span>}
      </div>
      {sub && <p className="text-xs text-metal-300 mt-1">{sub}</p>}
    </div>
  );
}