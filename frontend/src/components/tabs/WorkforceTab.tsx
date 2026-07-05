"use client";
import AgentPanel from "@/components/ui/AgentPanel";
import { getWorkforce } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface Props { sessionId: string; machineId: string; }

export default function WorkforceTab({ sessionId, machineId }: Props) {
  return (
    <AgentPanel agentName="Workforce Planner Agent" fetchFn={() => getWorkforce(sessionId, machineId)} cacheKey={`wf_${sessionId}_${machineId}`}>
      {(data) => (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="glass-panel rounded-xl p-4 text-center">
              <p className="text-xs font-mono text-metal-300 mb-1">TOTAL MAN-HOURS</p>
              <p className="font-display text-2xl font-bold text-cyan-400">{data.total_man_hours}</p>
            </div>
            <div className="glass-panel rounded-xl p-4 text-center">
              <p className="text-xs font-mono text-metal-300 mb-1">LABOR COST</p>
              <p className="font-display text-2xl font-bold text-green-400">{formatCurrency(data.labor_cost_estimate)}</p>
            </div>
            <div className="glass-panel rounded-xl p-4 text-center">
              <p className="text-xs font-mono text-metal-300 mb-1">SAFETY OFFICER</p>
              <p className="font-display text-xl font-bold" style={{ color: data.safety_officer_required ? "#ff6b00" : "#00ff88" }}>
                {data.safety_officer_required ? "REQUIRED" : "NOT NEEDED"}
              </p>
            </div>
          </div>

          {data.team_required?.length > 0 && (
            <div className="glass-panel rounded-xl p-5">
              <p className="text-xs font-mono text-metal-300 mb-4 tracking-wider uppercase">Team Requirements</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs font-mono text-metal-300 border-b border-metal-700">
                      {["Role", "Count", "Skills", "Shift", "Hours"].map(h => (
                        <th key={h} className="text-left py-2 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.team_required.map((t: any, i: number) => (
                      <tr key={i} className="border-b border-metal-700/30">
                        <td className="py-3 pr-4 text-white font-medium">{t.role}</td>
                        <td className="py-3 pr-4 text-cyan-400 font-display font-bold">{t.count}</td>
                        <td className="py-3 pr-4 text-metal-300 text-xs">{t.skills?.join(", ")}</td>
                        <td className="py-3 pr-4 text-metal-100">{t.shift}</td>
                        <td className="py-3 pr-4 text-metal-100">{t.hours}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data.shift_schedule?.length > 0 && (
            <div className="glass-panel rounded-xl p-5">
              <p className="text-xs font-mono text-metal-300 mb-4 tracking-wider uppercase">Shift Schedule</p>
              <div className="space-y-3">
                {data.shift_schedule.map((s: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-forge-700/50 border border-cyan-500/10">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-cyan-400 font-mono">{s.shift}</p>
                      <span className="text-xs text-metal-300">{s.duration_hours}h</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {s.tasks?.map((task: string, j: number) => (
                        <span key={j} className="text-xs text-metal-300 bg-forge-600/50 px-2 py-0.5 rounded">• {task}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.workforce_narrative && (
            <div className="glass-panel rounded-xl p-5 border-cyan-500/10">
              <p className="text-xs font-mono text-cyan-400/60 mb-3">WORKFORCE ANALYSIS</p>
              <p className="text-sm text-metal-100 leading-relaxed">{data.workforce_narrative}</p>
            </div>
          )}
        </div>
      )}
    </AgentPanel>
  );
}