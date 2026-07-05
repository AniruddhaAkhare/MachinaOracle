"use client";
import { useState } from "react";
import AgentPanel from "@/components/ui/AgentPanel";
import { getDigitalTwin } from "@/lib/api";
import { healthScoreColor } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface Props { sessionId: string; machineId: string; }

export default function DigitalTwinTab({ sessionId, machineId }: Props) {
  const [days, setDays] = useState(30);
  const [key, setKey] = useState(0);

  const run = () => setKey(k => k + 1);

  return (
    <div className="p-6 space-y-4">
      {/* Controls */}
      <div className="glass-panel rounded-xl p-4 flex items-center gap-4 flex-wrap">
        <div>
          <p className="text-xs font-mono text-metal-300 mb-1">SIMULATION DAYS</p>
          <input
            type="range" min={7} max={90} value={days} onChange={e => setDays(Number(e.target.value))}
            className="w-40 accent-cyan-400"
          />
          <span className="ml-3 text-sm font-mono text-cyan-400">{days} days</span>
        </div>
        <button onClick={run} className="ml-auto px-5 py-2 bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 font-mono text-sm rounded hover:bg-cyan-500/20 transition-all">
          ▶ RUN SIMULATION
        </button>
      </div>

      <AgentPanel
        key={`dt_${key}_${days}`}
        agentName="Digital Twin Agent"
        fetchFn={() => getDigitalTwin(sessionId, machineId, days)}
        cacheKey={`dt_${sessionId}_${machineId}_${days}_${key}`}
      >
        {(data) => {
          const summary = data.simulation_summary || {};
          return (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Final Health", value: `${summary.final_health_score || "—"}%`, color: healthScoreColor(summary.final_health_score || 0) },
                  { label: "Failure Occurred", value: summary.failure_occurred ? "YES" : "NO", color: summary.failure_occurred ? "#ff2d55" : "#00ff88" },
                  { label: "Failure Day", value: summary.failure_day ?? "None", color: summary.failure_day ? "#ff6b00" : "#9ba3b8" },
                  { label: "Critical Events", value: summary.critical_events_count ?? 0, color: "#ffd600" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="glass-panel rounded-xl p-4 text-center">
                    <p className="text-xs font-mono text-metal-300 mb-1">{label}</p>
                    <p className="font-display text-xl font-bold" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Daily Simulation Chart */}
              {data.daily_simulation?.length > 0 && (
                <div className="glass-panel rounded-xl p-5">
                  <p className="text-xs font-mono text-metal-300 mb-4 tracking-wider uppercase">Digital Twin Health Simulation</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={data.daily_simulation}>
                      <XAxis dataKey="day" tick={{ fill: "#9ba3b8", fontSize: 10 }} />
                      <YAxis tick={{ fill: "#9ba3b8", fontSize: 10 }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: "#0a0f1e", border: "1px solid rgba(0,245,255,0.2)", borderRadius: "8px", color: "#e8eaf0" }} />
                      {summary.failure_day && <ReferenceLine x={summary.failure_day} stroke="#ff2d55" strokeDasharray="4 4" label={{ value: "Failure", fill: "#ff2d55", fontSize: 10 }} />}
                      <Line type="monotone" dataKey="health_score" stroke="#00f5ff" strokeWidth={2.5} dot={false} name="Health Score" />
                      <Line type="monotone" dataKey="temperature" stroke="#ff6b00" strokeWidth={1.5} dot={false} name="Temperature" strokeDasharray="4 2" />
                      <Line type="monotone" dataKey="vibration" stroke="#ffd600" strokeWidth={1.5} dot={false} name="Vibration" strokeDasharray="4 2" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Component Wear */}
              {data.component_wear?.length > 0 && (
                <div className="glass-panel rounded-xl p-5">
                  <p className="text-xs font-mono text-metal-300 mb-4 tracking-wider uppercase">Component Wear Simulation</p>
                  <div className="space-y-3">
                    {data.component_wear.map((cw: any, i: number) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-metal-100">{cw.component}</span>
                          <div className="flex gap-4">
                            <span className="text-orange-400">{cw.wear_percentage}% worn</span>
                            <span className="text-cyan-400">{cw.remaining_life_days}d remaining</span>
                          </div>
                        </div>
                        <div className="h-2 bg-forge-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{
                            width: `${cw.wear_percentage}%`,
                            background: cw.wear_percentage > 75 ? "#ff2d55" : cw.wear_percentage > 50 ? "#ff6b00" : "#ffd600",
                            boxShadow: `0 0 6px ${cw.wear_percentage > 75 ? "#ff2d55" : "#ff6b00"}`,
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Intervention Points */}
              {data.intervention_points?.length > 0 && (
                <div className="glass-panel rounded-xl p-5">
                  <p className="text-xs font-mono text-metal-300 mb-4 tracking-wider uppercase">Recommended Intervention Points</p>
                  <div className="space-y-2">
                    {data.intervention_points.map((ip: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-forge-700/50">
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded flex-shrink-0">Day {ip.day}</span>
                        <div>
                          <p className="text-sm text-white">{ip.intervention}</p>
                          <p className="text-xs text-green-400/70 mt-0.5">Prevents: {ip.impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.twin_narrative && (
                <div className="glass-panel rounded-xl p-5 border-cyan-500/10">
                  <p className="text-xs font-mono text-cyan-400/60 mb-3">DIGITAL TWIN NARRATIVE</p>
                  <p className="text-sm text-metal-100 leading-relaxed">{data.twin_narrative}</p>
                </div>
              )}
            </div>
          );
        }}
      </AgentPanel>
    </div>
  );
}