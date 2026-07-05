"use client";
import { motion } from "framer-motion";
import { healthScoreColor } from "@/lib/utils";

interface Props {
  machines: any[];
  onSelect: (machine: any) => void;
}

const MACHINE_ICONS: Record<string, string> = {
  "pump": "🔄", "motor": "⚡", "turbine": "🌀", "conveyor": "➡️",
  "compressor": "💨", "generator": "⚡", "boiler": "🔥", "valve": "🎛️",
  "robot": "🤖", "cnc": "🔧", "default": "⚙️"
};

function getMachineIcon(type: string): string {
  const t = (type || "").toLowerCase();
  for (const [k, v] of Object.entries(MACHINE_ICONS)) {
    if (t.includes(k)) return v;
  }
  return MACHINE_ICONS.default;
}

export default function MachineSelector({ machines, onSelect }: Props) {
  return (
    <div className="min-h-screen px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        <div className="text-center mb-12">
          <p className="font-mono text-xs text-cyan-400/60 tracking-[0.3em] uppercase mb-3">
            SCAN COMPLETE — SELECT TARGET
          </p>
          <h2 className="font-display text-4xl font-bold text-white mb-3">
            {machines.length} Machine{machines.length !== 1 ? "s" : ""} Detected
          </h2>
          <p className="text-metal-300 text-sm">
            Select a machine to begin AI-powered analysis with all 14 agent modules
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map((machine, i) => {
            const sensors = machine.sensor_data || {};
            const healthScore = sensors.health_score || machine.health_score;
            const hColor = healthScore ? healthScoreColor(healthScore) : "#9ba3b8";
            
            return (
              <motion.div
                key={machine.machine_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => onSelect(machine)}
                className="glass-panel rounded-xl p-5 cursor-pointer group hover:border-cyan-400/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                style={{ "--hover-glow": hColor } as any}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{getMachineIcon(machine.machine_type || "")}</div>
                  {healthScore && (
                    <div className="text-right">
                      <div className="text-xs font-mono text-metal-300 mb-1">HEALTH</div>
                      <div className="font-display text-xl font-bold" style={{ color: hColor }}>
                        {Math.round(healthScore)}%
                      </div>
                    </div>
                  )}
                </div>
                
                <h3 className="font-display text-sm font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                  {machine.machine_name}
                </h3>
                <p className="text-xs text-metal-300 mb-4">{machine.machine_type || "Industrial Equipment"}</p>

                {/* Sensor chips */}
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(sensors).filter(([k]) => k !== "health_score").slice(0, 4).map(([k, v]) => (
                    <span key={k} className="text-xs font-mono bg-cyan-500/5 border border-cyan-500/10 text-cyan-400/70 px-2 py-0.5 rounded">
                      {k.replace("_", " ")}: {typeof v === "number" ? v.toFixed(1) : String(v)}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs font-mono text-cyan-400/60 group-hover:text-cyan-400 transition-colors">
                  <span>ANALYZE WITH 14 AGENTS</span>
                  <span>→</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}