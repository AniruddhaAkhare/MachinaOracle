"use client";
import AgentPanel from "@/components/ui/AgentPanel";
import { getStrategy } from "@/lib/api";

interface Props { sessionId: string; machineId: string; }

export default function StrategyTab({ sessionId, machineId }: Props) {
  return (
    <AgentPanel agentName="Strategy Optimizer Agent" fetchFn={() => getStrategy(sessionId, machineId)} cacheKey={`strat_${sessionId}_${machineId}`}>
      {(data) => (
        <div className="p-6 space-y-6">
          {/* Strategy Banner */}
          <div className="glass-panel rounded-xl p-6 border-purple-500/30 bg-purple-500/5">
            <p className="text-xs font-mono text-purple-400/70 mb-2">RECOMMENDED STRATEGY</p>
            <h3 className="font-display text-3xl font-bold text-white mb-2">{data.recommended_strategy}</h3>
            <p className="text-sm text-metal-300">{data.strategy_rationale}</p>
          </div>

          {/* Expected Outcomes */}
          {data.expected_outcomes && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Downtime Reduction", value: data.expected_outcomes.downtime_reduction, icon: "⬇️" },
                { label: "Annual Savings", value: data.expected_outcomes.cost_savings, icon: "💰" },
                { label: "Lifespan Extension", value: data.expected_outcomes.lifespan_extension, icon: "⏳" },
              ].map(({ label, value, icon }) => (
                <div key={label} className="glass-panel rounded-xl p-4 text-center">
                  <p className="text-2xl mb-1">{icon}</p>
                  <p className="font-display text-lg font-bold text-cyan-400">{value}</p>
                  <p className="text-xs font-mono text-metal-300 mt-1">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* KPIs */}
          {data.kpis?.length > 0 && (
            <div className="glass-panel rounded-xl p-5">
              <p className="text-xs font-mono text-metal-300 mb-4 tracking-wider uppercase">KPI Targets</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs font-mono text-metal-300 border-b border-metal-700">
                      {["KPI", "Current", "Target", "Improvement"].map(h => (
                        <th key={h} className="text-left py-2 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.kpis.map((k: any, i: number) => (
                      <tr key={i} className="border-b border-metal-700/30">
                        <td className="py-3 pr-4 text-white">{k.kpi}</td>
                        <td className="py-3 pr-4 text-metal-300">{k.current}</td>
                        <td className="py-3 pr-4 text-cyan-400 font-medium">{k.target}</td>
                        <td className="py-3 pr-4 text-green-400 font-mono">{k.improvement}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Roadmap */}
          {data.implementation_roadmap?.length > 0 && (
            <div className="glass-panel rounded-xl p-5">
              <p className="text-xs font-mono text-metal-300 mb-4 tracking-wider uppercase">Implementation Roadmap</p>
              <div className="space-y-3">
                {data.implementation_roadmap.map((phase: any, i: number) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xs font-mono text-cyan-400 flex-shrink-0">{i + 1}</div>
                    <div className="flex-1 p-3 rounded-lg bg-forge-700/50">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-white font-medium">{phase.phase}</p>
                        <div className="flex gap-3 text-xs text-metal-300">
                          <span>{phase.duration}</span>
                          <span className="text-green-400">${phase.investment?.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {phase.actions?.map((a: string, j: number) => (
                          <span key={j} className="text-xs text-metal-300 bg-forge-600/50 px-2 py-0.5 rounded">• {a}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tech Recommendations */}
          {data.technology_recommendations?.length > 0 && (
            <div className="glass-panel rounded-xl p-5">
              <p className="text-xs font-mono text-metal-300 mb-3 tracking-wider uppercase">Technology Stack Recommendations</p>
              <div className="flex flex-wrap gap-2">
                {[...(data.technology_recommendations || []), ...(data.iot_sensors_to_add || [])].map((t: string, i: number) => (
                  <span key={i} className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">⚡ {t}</span>
                ))}
              </div>
            </div>
          )}

          {data.strategy_narrative && (
            <div className="glass-panel rounded-xl p-5 border-purple-500/10">
              <p className="text-xs font-mono text-purple-400/60 mb-3">STRATEGY ANALYSIS</p>
              <p className="text-sm text-metal-100 leading-relaxed">{data.strategy_narrative}</p>
            </div>
          )}
        </div>
      )}
    </AgentPanel>
  );
}