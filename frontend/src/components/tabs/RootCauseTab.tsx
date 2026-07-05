"use client";
import AgentPanel from "@/components/ui/AgentPanel";
import { getRootCause } from "@/lib/api";

interface Props { sessionId: string; machineId: string; }

const IMPACT_COLORS: Record<string, string> = { HIGH: "#ff2d55", MEDIUM: "#ffd600", LOW: "#00ff88" };

export default function RootCauseTab({ sessionId, machineId }: Props) {
  return (
    <AgentPanel agentName="Root Cause Analysis Agent" fetchFn={() => getRootCause(sessionId, machineId)} cacheKey={`rca_${sessionId}_${machineId}`}>
      {(data) => (
        <div className="p-6 space-y-6">
          {/* Primary Root Cause */}
          <div className="glass-panel rounded-xl p-6 border-red-500/20 bg-red-500/3">
            <p className="text-xs font-mono text-red-400/70 mb-2 tracking-wider">ROOT CAUSE IDENTIFIED</p>
            <h3 className="font-display text-xl font-bold text-white mb-2">{data.primary_root_cause}</h3>
            <span className="text-xs font-mono bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-full">{data.cause_category?.toUpperCase()}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Contributing Factors */}
            {data.contributing_factors?.length > 0 && (
              <div className="glass-panel rounded-xl p-5">
                <p className="text-xs font-mono text-metal-300 mb-4 tracking-wider uppercase">Contributing Factors</p>
                <div className="space-y-3">
                  {data.contributing_factors.map((f: any, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-xs font-mono px-2 py-0.5 rounded flex-shrink-0 mt-0.5"
                        style={{ background: `${IMPACT_COLORS[f.impact]}20`, color: IMPACT_COLORS[f.impact], border: `1px solid ${IMPACT_COLORS[f.impact]}40` }}>
                        {f.impact}
                      </span>
                      <div>
                        <p className="text-sm text-white font-medium">{f.factor}</p>
                        <p className="text-xs text-metal-300/70 mt-0.5">{f.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Causal Chain */}
            {data.causal_chain?.length > 0 && (
              <div className="glass-panel rounded-xl p-5">
                <p className="text-xs font-mono text-metal-300 mb-4 tracking-wider uppercase">Causal Chain</p>
                <div className="space-y-2">
                  {data.causal_chain.map((c: any, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xs font-mono text-cyan-400 flex-shrink-0">{c.step}</div>
                        {i < data.causal_chain.length - 1 && <div className="w-px h-6 bg-cyan-500/20 mt-1"/>}
                      </div>
                      <div>
                        <p className="text-sm text-white">{c.event}</p>
                        {c.consequence && <p className="text-xs text-metal-300/70 mt-0.5">→ {c.consequence}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Corrective Actions */}
          {data.corrective_actions?.length > 0 && (
            <div className="glass-panel rounded-xl p-5">
              <p className="text-xs font-mono text-metal-300 mb-4 tracking-wider uppercase">Corrective Actions</p>
              <div className="space-y-2">
                {data.corrective_actions.map((a: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-forge-700/50">
                    <span className="text-xs font-mono px-2 py-0.5 rounded flex-shrink-0"
                      style={{ background: `${IMPACT_COLORS[a.priority] || "#00f5ff"}20`, color: IMPACT_COLORS[a.priority] || "#00f5ff", border: `1px solid ${IMPACT_COLORS[a.priority] || "#00f5ff"}30` }}>
                      {a.priority}
                    </span>
                    <span className="text-sm text-white flex-1">{a.action}</span>
                    <span className="text-xs text-metal-300 font-mono flex-shrink-0">{a.timeline}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RCA Narrative */}
          {data.rca_narrative && (
            <div className="glass-panel rounded-xl p-5 border-cyan-500/10">
              <p className="text-xs font-mono text-cyan-400/60 mb-3 tracking-wider uppercase">AI RCA Narrative</p>
              <p className="text-metal-100 text-sm leading-relaxed">{data.rca_narrative}</p>
            </div>
          )}
        </div>
      )}
    </AgentPanel>
  );
}