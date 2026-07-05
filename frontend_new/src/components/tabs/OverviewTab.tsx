"use client";
import { getRiskClass, getRiskColor, healthScoreColor, formatCurrency } from "@/lib/utils";
import StatCard from "@/components/ui/StatCard";

export default function OverviewTab({ machine }: { machine: any }) {
  const sensors = machine.sensor_data || {};
  const hs = sensors.health_score || 75;
  const hColor = healthScoreColor(hs);
  
  return (
    <div className="p-6 space-y-6">
      {/* Machine Header */}
      <div className="glass-panel rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-cyan-400/60 tracking-wider mb-1">MACHINE PROFILE</p>
            <h2 className="font-display text-3xl font-bold text-white">{machine.machine_name}</h2>
            <p className="text-metal-300 mt-1">{machine.machine_type} · ID: {machine.machine_id}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-mono text-metal-300 mb-2">HEALTH INDEX</p>
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke={hColor}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40 * hs / 100} ${2 * Math.PI * 40}`}
                  style={{ filter: `drop-shadow(0 0 6px ${hColor})` }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-xl font-bold" style={{ color: hColor }}>{Math.round(hs)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Grid */}
      <div>
        <p className="text-xs font-mono text-metal-300 mb-3 tracking-wider uppercase">Live Sensor Readings</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { key: "temperature", label: "Temperature", unit: "°C", icon: "🌡️" },
            { key: "vibration", label: "Vibration", unit: "mm/s", icon: "📳" },
            { key: "pressure", label: "Pressure", unit: "PSI", icon: "💨" },
            { key: "rpm", label: "RPM", unit: "", icon: "🔄" },
            { key: "voltage", label: "Voltage", unit: "V", icon: "⚡" },
            { key: "current", label: "Current", unit: "A", icon: "🔌" },
          ].map(({ key, label, unit, icon }) => {
            const val = sensors[key];
            return (
              <StatCard
                key={key}
                label={label}
                value={val !== undefined ? val.toFixed(1) : "—"}
                unit={unit}
                icon={icon}
                color={val !== undefined ? "#00f5ff" : "#4a5568"}
              />
            );
          })}
        </div>
      </div>

      {/* Log Preview */}
      {machine.log_text && (
        <div className="glass-panel rounded-xl p-5">
          <p className="text-xs font-mono text-metal-300 mb-3 tracking-wider uppercase">Raw Log Data (Preview)</p>
          <pre className="text-xs text-metal-300/70 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
            {machine.log_text.slice(0, 800)}{machine.log_text.length > 800 ? "\n..." : ""}
          </pre>
        </div>
      )}

      <div className="glass-panel rounded-xl p-5 border-cyan-500/20">
        <p className="text-xs font-mono text-cyan-400/60 mb-3">ORACLE AI STATUS</p>
        <div className="flex flex-wrap gap-3">
          {["Failure Prediction","Root Cause Analysis","Maintenance Plan","Digital Twin","What-If Sim","Smart Alerts"].map(a => (
            <span key={a} className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              {a}
            </span>
          ))}
        </div>
        <p className="text-xs text-metal-300 mt-4">
          Select any tab above to activate the corresponding AI agent. Results are cached per session.
        </p>
      </div>
    </div>
  );
}