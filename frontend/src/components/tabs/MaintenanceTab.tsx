"use client";
import AgentPanel from "@/components/ui/AgentPanel";
import { getMaintenance } from "@/lib/api";

interface Props { sessionId: string; machineId: string; }

const PRIORITY_COLORS: Record<string, string> = { HIGH: "#ff2d55", MED: "#ffd600", LOW: "#00ff88", MEDIUM: "#ffd600" };

export default function MaintenanceTab({ sessionId, machineId }: Props) {
  return (
    <AgentPanel agentName="Maintenance Planner Agent" fetchFn={() => getMaintenance(sessionId, machineId)} cacheKey={`maint_${sessionId}_${machineId}`}>
      {(data) => (
        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className={`glass-panel rounded-xl p-6 border-2 ${data.maintenance_urgency === "IMMEDIATE" ? "border-red-500/50" : data.maintenance_urgency === "SCHEDULED" ? "border-yellow-500/40" : "border-green-500/30"}`}>
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="text-xs font-mono text-metal-300 mb-1">URGENCY</p>
                <span className={`font-display text-2xl font-bold ${data.maintenance_urgency === "IMMEDIATE" ? "text-red-400" : data.maintenance_urgency === "SCHEDULED" ? "text-yellow-400" : "text-green-400"}`}>
                  {data.maintenance_urgency}
                </span>
              </div>
              <div className="h-8 w-px bg-metal-700" />
              <div>
                <p className="text-xs font-mono text-metal-300 mb-1">TYPE</p>
                <p className="text-sm text-white font-medium">{data.maintenance_type}</p>
              </div>
              <div className="h-8 w-px bg-metal-700" />
              <div>
                <p className="text-xs font-mono text-metal-300 mb-1">DOWNTIME</p>
                <p className="text-sm text-white font-medium">{data.estimated_downtime_hours}h {data.shutdown_required ? "· Shutdown Required" : ""}</p>
              </div>
              <div className="h-8 w-px bg-metal-700" />
              <div>
                <p className="text-xs font-mono text-metal-300 mb-1">WINDOW</p>
                <p className="text-sm text-white font-medium">{data.maintenance_window}</p>
              </div>
            </div>
          </div>

          {/* Tasks */}
          {data.tasks?.length > 0 && (
            <div className="glass-panel rounded-xl p-5">
              <p className="text-xs font-mono text-metal-300 mb-4 tracking-wider uppercase">Maintenance Tasks</p>
              <div className="space-y-3">
                {data.tasks.map((task: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg bg-forge-700/50 border border-cyan-500/5">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-mono text-cyan-400/60">{task.task_id}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm text-white font-medium">{task.description}</p>
                          <span className="text-xs font-mono px-2 py-0.5 rounded flex-shrink-0"
                            style={{ background: `${PRIORITY_COLORS[task.priority] || "#ccc"}15`, color: PRIORITY_COLORS[task.priority] || "#ccc", border: `1px solid ${PRIORITY_COLORS[task.priority] || "#ccc"}30` }}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-metal-300">
                          <span>⏱ {task.duration_hours}h</span>
                          <span>👤 {task.skill_required}</span>
                          {task.parts_needed?.length > 0 && <span>🔩 {task.parts_needed.join(", ")}</span>}
                        </div>
                        {task.procedure && <p className="text-xs text-metal-300/60 mt-2 font-mono">{task.procedure}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {data.inspection_checklist?.length > 0 && (
              <div className="glass-panel rounded-xl p-5">
                <p className="text-xs font-mono text-metal-300 mb-3 tracking-wider uppercase">Inspection Checklist</p>
                <ul className="space-y-2">
                  {data.inspection_checklist.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-metal-100">
                      <span className="text-cyan-400 mt-0.5 flex-shrink-0">☐</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.safety_precautions?.length > 0 && (
              <div className="glass-panel rounded-xl p-5 border-yellow-500/10">
                <p className="text-xs font-mono text-yellow-400/70 mb-3 tracking-wider uppercase">⚠ Safety Precautions</p>
                <ul className="space-y-2">
                  {data.safety_precautions.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-metal-100 flex items-start gap-2">
                      <span className="text-yellow-400">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {data.maintenance_narrative && (
            <div className="glass-panel rounded-xl p-5 border-cyan-500/10">
              <p className="text-xs font-mono text-cyan-400/60 mb-3">AI MAINTENANCE ANALYSIS</p>
              <p className="text-sm text-metal-100 leading-relaxed">{data.maintenance_narrative}</p>
            </div>
          )}
        </div>
      )}
    </AgentPanel>
  );
}