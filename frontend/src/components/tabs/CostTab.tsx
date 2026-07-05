"use client";
import AgentPanel from "@/components/ui/AgentPanel";
import StatCard from "@/components/ui/StatCard";
import { getCostAnalysis } from "@/lib/api";
import { formatCurrency, getRiskColor } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Props { sessionId: string; machineId: string; }

export default function CostTab({ sessionId, machineId }: Props) {
  return (
    <AgentPanel agentName="Cost Analysis Agent" fetchFn={() => getCostAnalysis(sessionId, machineId)} cacheKey={`cost_${sessionId}_${machineId}`}>
      {(data) => (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Repair Now" value={formatCurrency(data.immediate_repair_cost)} icon="🔧" color="#00ff88" />
            <StatCard label="Failure Cost" value={formatCurrency(data.failure_replacement_cost)} icon="💥" color="#ff2d55" />
            <StatCard label="Downtime/hr" value={formatCurrency(data.downtime_cost_per_hour)} icon="⏱️" color="#ff6b00" />
            <StatCard label="ROI (Preventive)" value={data.roi_of_preventive_maintenance} icon="📈" color="#00f5ff" />
          </div>

          {/* Cost Comparison */}
          <div className="glass-panel rounded-xl p-5">
            <p className="text-xs font-mono text-metal-300 mb-4 tracking-wider uppercase">Act Now vs. Wait Analysis</p>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              {[
                { label: "Fix Now", amount: data.cost_comparison?.fix_now, color: "#00ff88" },
                { label: "Fix Later", amount: data.cost_comparison?.fix_later, color: "#ff2d55" },
                { label: "Savings", amount: data.cost_comparison?.savings_by_acting_now, color: "#00f5ff" },
              ].map(({ label, amount, color }) => (
                <div key={label} className="text-center p-4 rounded-lg bg-forge-700/50">
                  <p className="text-xs font-mono text-metal-300 mb-1">{label}</p>
                  <p className="font-display text-2xl font-bold" style={{ color }}>{amount ? formatCurrency(amount) : "—"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Breakdown Chart */}
          {data.cost_breakdown?.length > 0 && (
            <div className="glass-panel rounded-xl p-5">
              <p className="text-xs font-mono text-metal-300 mb-4 tracking-wider uppercase">Cost Breakdown</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.cost_breakdown} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <XAxis dataKey="category" tick={{ fill: "#9ba3b8", fontSize: 10, fontFamily: "Share Tech Mono" }} />
                  <YAxis tick={{ fill: "#9ba3b8", fontSize: 10 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "#0a0f1e", border: "1px solid rgba(0,245,255,0.2)", borderRadius: "8px", color: "#e8eaf0" }}
                    formatter={(v: any) => [formatCurrency(v), "Cost"]}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {data.cost_breakdown.map((_: any, i: number) => (
                      <Cell key={i} fill={["#00f5ff", "#ff6b00", "#ff2d55", "#ffd600", "#9b59ff"][i % 5]} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Monthly Trend */}
          {data.cost_trend?.length > 0 && (
            <div className="glass-panel rounded-xl p-5">
              <p className="text-xs font-mono text-metal-300 mb-4 tracking-wider uppercase">12-Month Cost Projection</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.cost_trend}>
                  <XAxis dataKey="month" tick={{ fill: "#9ba3b8", fontSize: 10, fontFamily: "Share Tech Mono" }} />
                  <YAxis tick={{ fill: "#9ba3b8", fontSize: 10 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: "#0a0f1e", border: "1px solid rgba(0,245,255,0.2)", borderRadius: "8px", color: "#e8eaf0" }} formatter={(v: any) => [formatCurrency(v), "Projected Cost"]} />
                  <Bar dataKey="predicted_cost" fill="#00f5ff" fillOpacity={0.7} radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {data.cost_narrative && (
            <div className="glass-panel rounded-xl p-5 border-cyan-500/10">
              <p className="text-xs font-mono text-cyan-400/60 mb-3">FINANCIAL ANALYSIS</p>
              <p className="text-sm text-metal-100 leading-relaxed">{data.cost_narrative}</p>
            </div>
          )}
        </div>
      )}
    </AgentPanel>
  );
}