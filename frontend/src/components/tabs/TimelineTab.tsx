"use client";
import AgentPanel from "@/components/ui/AgentPanel";
import { getTimeline } from "@/lib/api";
import { getRiskColor } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface Props { sessionId: string; machineId: string; }

export default function TimelineTab({ sessionId, machineId }: Props) {
  return (
    <AgentPanel agentName="Timeline Agent" fetchFn={() => getTimeline(sessionId, machineId)} cacheKey={`timeline_${sessionId}_${machineId}`}>
      {(data) => (
        <div className="p-6 space-y-6">
          {/* Failure Window */}
          {data.failure_window && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Earliest Failure", days: data.failure_window.earliest, color: "#ff2d55" },
                { label: "Most Likely", days: data.failure_window.most_likely, color: "#ff6b00" },
                { label: "Latest Estimate", days: data.failure_window.latest, color: "#ffd600" },
              ].map(({ label, days, color }) => (
                <div key={label} className="glass-panel rounded-xl p-4 text-center">
                  <p className="text-xs font-mono text-metal-300 mb-1">{label}</p>
                  <p className="font-display text-3xl font-bold" style={{ color }}>{days}</p>
                  <p className="text-xs text-metal-300 mt-1">days</p>
                </div>
              ))}
            </div>
          )}

          {/* Degradation Curve */}
          {data.degradation_curve?.length > 0 && (
            <div className="glass-panel rounded-xl p-5">
              <p className="text-xs font-mono text-metal-300 mb-4 tracking-wider uppercase">Health & Failure Probability Curve</p>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.degradation_curve}>
                  <XAxis dataKey="day" tick={{ fill: "#9ba3b8", fontSize: 10, fontFamily: "Share Tech Mono" }} label={{ value: "Days", fill: "#9ba3b8", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#9ba3b8", fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: "#0a0f1e", border: "1px solid rgba(0,245,255,0.2)", borderRadius: "8px", color: "#e8eaf0" }} />
                  {data.critical_threshold_day && (
                    <ReferenceLine x={data.critical_threshold_day} stroke="#ff2d55" strokeDasharray="4 4" label={{ value: "Critical", fill: "#ff2d55", fontSize: 10 }} />
                  )}
                  <Line type="monotone" dataKey="health_score" stroke="#00f5ff" strokeWidth={2} dot={false} name="Health Score" />
                  <Line type="monotone" dataKey="failure_probability" stroke="#ff2d55" strokeWidth={2} dot={false} name="Failure Prob %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Timeline Events */}
          {data.timeline_events?.length > 0 && (
            <div className="glass-panel rounded-xl p-5">
              <p className="text-xs font-mono text-metal-300 mb-4 tracking-wider uppercase">Predicted Event Timeline</p>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-cyan-500/20" />
                <div className="space-y-4 pl-10">
                  {data.timeline_events.map((e: any, i: number) => {
                    const sc = e.severity === "CRITICAL" ? "#ff2d55" : e.severity === "WARNING" ? "#ffd600" : "#00f5ff";
                    return (
                      <div key={i} className="relative">
                        <div className="absolute -left-6 w-3 h-3 rounded-full border-2 mt-1" style={{ borderColor: sc, background: `${sc}30` }} />
                        <div className="p-3 rounded-lg bg-forge-700/50 border border-metal-700/30">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs" style={{ color: sc }}>DAY {e.day}</span>
                            <span className="text-xs font-mono px-1.5 py-0.5 rounded text-xs" style={{ background: `${sc}15`, color: sc, border: `1px solid ${sc}30` }}>{e.severity}</span>
                          </div>
                          <p className="text-sm text-white">{e.event}</p>
                          <div className="flex gap-3 mt-1 text-xs text-metal-300">
                            <span>Component: {e.component}</span>
                            <span>Probability: {e.probability}%</span>
                          </div>
                          {e.recommended_action && <p className="text-xs text-cyan-400/70 mt-1">→ {e.recommended_action}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {data.timeline_narrative && (
            <div className="glass-panel rounded-xl p-5 border-cyan-500/10">
              <p className="text-xs font-mono text-cyan-400/60 mb-3">TIMELINE ANALYSIS</p>
              <p className="text-sm text-metal-100 leading-relaxed">{data.timeline_narrative}</p>
            </div>
          )}
        </div>
      )}
    </AgentPanel>
  );
}