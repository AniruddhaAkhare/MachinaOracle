"use client";
import { useState } from "react";
import AgentPanel from "@/components/ui/AgentPanel";
import { getWhatIf } from "@/lib/api";

interface Props { sessionId: string; machineId: string; }

const PRESETS = [
  { label: "Increase Load 20%", scenario: { load_increase: "20%", description: "Increase operating load by 20% for 30 days" } },
  { label: "Skip Maintenance", scenario: { skip_maintenance: true, description: "Skip next scheduled maintenance cycle" } },
  { label: "Max Temperature", scenario: { temperature_increase: "15°C", description: "Operate at 15°C above normal temperature" } },
  { label: "Night-Only Operation", scenario: { shift: "night_only", description: "Restrict operation to night shift only" } },
  { label: "Reduce RPM 30%", scenario: { rpm_reduction: "30%", description: "Reduce RPM by 30% for energy savings" } },
];

export default function WhatIfTab({ sessionId, machineId }: Props) {
  const [selected, setSelected] = useState(0);
  const [runKey, setRunKey] = useState(0);
  const [custom, setCustom] = useState("");

  const scenario = custom ? { description: custom } : PRESETS[selected].scenario;

  return (
    <div className="p-6 space-y-4">
      <div className="glass-panel rounded-xl p-5">
        <p className="text-xs font-mono text-metal-300 mb-3 tracking-wider uppercase">Select Scenario</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESETS.map((p, i) => (
            <button key={i} onClick={() => { setSelected(i); setCustom(""); }}
              className={`text-xs font-mono px-3 py-2 rounded border transition-all ${selected === i && !custom ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" : "bg-forge-700/50 border-metal-700/50 text-metal-300 hover:text-white"}`}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <input
            value={custom}
            onChange={e => setCustom(e.target.value)}
            placeholder="Or type a custom scenario..."
            className="flex-1 bg-forge-700/50 border border-metal-700/50 text-metal-100 text-sm px-3 py-2 rounded font-mono placeholder-metal-500 focus:outline-none focus:border-cyan-500/50"
          />
          <button onClick={() => setRunKey(k => k + 1)}
            className="px-5 py-2 bg-orange-500/10 border border-orange-500/40 text-orange-400 font-mono text-sm rounded hover:bg-orange-500/20 transition-all">
            ▶ SIMULATE
          </button>
        </div>
      </div>

      <AgentPanel
        key={`wi_${runKey}_${selected}`}
        agentName="What-If Simulation Agent"
        fetchFn={() => getWhatIf(sessionId, machineId, scenario)}
        cacheKey={`whatif_${sessionId}_${machineId}_${selected}_${runKey}`}
      >
        {(data) => (
          <div className="space-y-6">
            {/* Baseline vs Scenarios */}
            <div className="glass-panel rounded-xl p-5">
              <p className="text-xs font-mono text-metal-300 mb-4 tracking-wider uppercase">Scenario Comparison</p>
              {data.baseline_state && (
                <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 mb-3">
                  <p className="text-xs font-mono text-cyan-400/70 mb-1">BASELINE (CURRENT)</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-metal-100">Health: <b className="text-cyan-400">{data.baseline_state.health_score}%</b></span>
                    <span className="text-metal-100">Failure Prob: <b className="text-orange-400">{data.baseline_state.failure_probability}%</b></span>
                    <span className="text-metal-100">Days to Failure: <b className="text-yellow-400">{data.baseline_state.days_to_failure}</b></span>
                  </div>
                </div>
              )}
              {data.scenario_outcomes?.map((so: any, i: number) => (
                <div key={i} className={`p-3 rounded-lg mb-2 border ${so.risk_change === "increased" ? "bg-red-500/5 border-red-500/20" : so.risk_change === "decreased" ? "bg-green-500/5 border-green-500/20" : "bg-metal-900 border-metal-700/30"}`}>
                  <p className="text-xs font-mono text-metal-300 mb-1">{so.scenario_name}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="text-metal-100">Health: <b style={{ color: so.new_health_score > 60 ? "#00ff88" : "#ff6b00" }}>{so.new_health_score}%</b></span>
                    <span className="text-metal-100">Failure: <b className="text-red-400">{so.new_failure_probability}%</b></span>
                    <span className="text-metal-100">Days: <b className="text-yellow-400">{so.new_days_to_failure}</b></span>
                    <span className="text-metal-100">Cost Impact: <b className="text-orange-400">${so.cost_impact?.toLocaleString()}</b></span>
                  </div>
                  <p className="text-xs mt-1.5 font-mono" style={{ color: so.risk_change === "increased" ? "#ff2d55" : "#00ff88" }}>
                    Risk {so.risk_change} → {so.recommendation}
                  </p>
                </div>
              ))}
            </div>

            {/* Sensitivity Analysis */}
            {data.sensitivity_analysis?.length > 0 && (
              <div className="glass-panel rounded-xl p-5">
                <p className="text-xs font-mono text-metal-300 mb-4 tracking-wider uppercase">Sensitivity Analysis</p>
                <div className="space-y-2">
                  {data.sensitivity_analysis.map((sa: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded bg-forge-700/30">
                      <span className="text-xs font-mono px-2 py-0.5 rounded flex-shrink-0"
                        style={{ background: sa.impact_level === "HIGH" ? "#ff2d5520" : sa.impact_level === "MED" ? "#ffd60020" : "#00ff8820", color: sa.impact_level === "HIGH" ? "#ff2d55" : sa.impact_level === "MED" ? "#ffd600" : "#00ff88", border: `1px solid ${sa.impact_level === "HIGH" ? "#ff2d55" : sa.impact_level === "MED" ? "#ffd600" : "#00ff88"}40` }}>
                        {sa.impact_level}
                      </span>
                      <span className="text-sm text-white font-medium">{sa.parameter}</span>
                      <span className="text-xs text-metal-300 flex-1">{sa.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.whatif_narrative && (
              <div className="glass-panel rounded-xl p-5 border-orange-500/10">
                <p className="text-xs font-mono text-orange-400/60 mb-3">WHAT-IF ANALYSIS</p>
                <p className="text-sm text-metal-100 leading-relaxed">{data.whatif_narrative}</p>
              </div>
            )}
          </div>
        )}
      </AgentPanel>
    </div>
  );
}