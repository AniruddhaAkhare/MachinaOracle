"use client";
import AgentPanel from "@/components/ui/AgentPanel";
import { getAlerts } from "@/lib/api";

interface Props { sessionId: string; machineId: string; }

const SEV_COLORS: Record<string, string> = { CRITICAL: "#ff2d55", HIGH: "#ff6b00", MEDIUM: "#ffd600", LOW: "#00ff88", INFO: "#00f5ff" };
const SEV_BG: Record<string, string> = { CRITICAL: "bg-red-500/10 border-red-500/30", HIGH: "bg-orange-500/10 border-orange-500/30", MEDIUM: "bg-yellow-500/10 border-yellow-500/30", LOW: "bg-green-500/10 border-green-500/30", INFO: "bg-cyan-500/10 border-cyan-500/30" };

export default function AlertsTab({ sessionId, machineId }: Props) {
  return (
    <AgentPanel agentName="Smart Alert Agent" fetchFn={() => getAlerts(sessionId, machineId)} cacheKey={`alerts_${sessionId}_${machineId}`}>
      {(data) => (
        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div className={`glass-panel rounded-xl p-5 border-2 ${
            data.overall_status === "EMERGENCY" ? "border-red-500/60 animate-pulse" :
            data.overall_status === "WARNING" ? "border-orange-500/50" :
            data.overall_status === "CAUTION" ? "border-yellow-500/40" :
            "border-green-500/30"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-metal-300 mb-1">SYSTEM STATUS</p>
                <p className="font-display text-3xl font-bold" style={{ color: SEV_COLORS[data.overall_status] || "#00f5ff" }}>
                  {data.overall_status}
                </p>
              </div>
              {data.alert_summary && (
                <div className="flex gap-3">
                  {Object.entries(data.alert_summary).map(([k, v]) => (
                    <div key={k} className="text-center">
                      <p className="font-display text-xl font-bold" style={{ color: SEV_COLORS[k.toUpperCase()] || "#9ba3b8" }}>{String(v)}</p>
                      <p className="text-xs font-mono text-metal-300 capitalize">{k}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Alerts */}
          {data.active_alerts?.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-mono text-metal-300 tracking-wider uppercase">Active Alerts ({data.active_alerts.length})</p>
              {data.active_alerts.map((alert: any) => (
                <div key={alert.alert_id} className={`rounded-xl p-4 border ${SEV_BG[alert.severity] || "bg-metal-900 border-metal-700"}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded flex-shrink-0 mt-0.5"
                      style={{ background: `${SEV_COLORS[alert.severity]}20`, color: SEV_COLORS[alert.severity], border: `1px solid ${SEV_COLORS[alert.severity]}40` }}>
                      {alert.severity}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-white font-semibold">{alert.title}</p>
                        <span className="text-xs font-mono text-metal-300 flex-shrink-0">{alert.timestamp}</span>
                      </div>
                      <p className="text-xs text-metal-300 mt-1">{alert.message}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-metal-300">
                        <span>Component: {alert.component}</span>
                        <span>Triggered by: {alert.triggered_by}</span>
                        {alert.auto_escalate && <span className="text-red-400">⚡ Auto-escalate</span>}
                      </div>
                      {alert.action_required && (
                        <p className="text-xs text-cyan-400 mt-2">→ Action: {alert.action_required}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {data.sms_alert && (
              <div className="glass-panel rounded-xl p-4 border-yellow-500/10">
                <p className="text-xs font-mono text-yellow-400/70 mb-2">📱 SMS ALERT</p>
                <p className="text-sm font-mono text-white bg-forge-700/50 p-3 rounded">{data.sms_alert}</p>
              </div>
            )}
            {data.email_subject && (
              <div className="glass-panel rounded-xl p-4 border-cyan-500/10">
                <p className="text-xs font-mono text-cyan-400/60 mb-2">📧 EMAIL SUBJECT</p>
                <p className="text-sm font-mono text-white bg-forge-700/50 p-3 rounded">{data.email_subject}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </AgentPanel>
  );
}