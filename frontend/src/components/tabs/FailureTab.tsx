"use client";
import AgentPanel from "@/components/ui/AgentPanel";
import StatCard from "@/components/ui/StatCard";
import { getRiskColor, getRiskClass } from "@/lib/utils";
import { predictFailure } from "@/lib/api";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

interface Props { sessionId: string; machineId: string; }

export default function FailureTab({ sessionId, machineId }: Props) {
  return (
    <AgentPanel
      agentName="Failure Prediction Agent"
      fetchFn={() => predictFailure(sessionId, machineId)}
      cacheKey={`failure_${sessionId}_${machineId}`}
    >
      {(data) => (
        <div className="p-6 space-y-6">
          {/* Main Risk Banner */}
          <div className={`glass-panel rounded-xl p-6 border-2 ${
            data.failure_risk_level === "CRITICAL" ? "border-red-500/50 bg-red-500/5" :
            data.failure_risk_level === "HIGH" ? "border-orange-500/50 bg-orange-500/5" :
            data.failure_risk_level === "MEDIUM" ? "border-yellow-500/50 bg-yellow-500/5" :
            "border-green-500/30 bg-green-500/5"
          }`}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="text-center">
                <p className="text-xs font-mono text-metal-300 mb-2 tracking-wider">FAILURE PROBABILITY</p>
                <div className="font-display text-6xl font-black" style={{ color: getRiskColor(data.failure_risk_level) }}>
                  {data.failure_probability}%
                </div>
                <div className={`font-mono text-sm mt-1 ${getRiskClass(data.failure_risk_level)}`}>
                  {data.failure_risk_level} RISK
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-3">
                <StatCard label="Days to Failure" value={data.estimated_days_to_failure ?? "N/A"} unit="days" icon="📅" color={getRiskColor(data.failure_risk_level)} />
                <StatCard label="Confidence" value={data.confidence_score} unit="%" icon="🎯" color="#00f5ff" />
                <StatCard label="Health Score" value={data.health_score} unit="/100" icon="❤️" color={getRiskColor(data.failure_risk_level)} />
                <StatCard label="Primary Mode" value={data.primary_failure_mode?.slice(0, 20) + "..."} icon="⚠️" color="#ffd600" />
              </div>
            </div>
          </div>

          {/* Component Risks */}
          {data.component_risks?.length > 0 && (
            <div className="glass-panel rounded-xl p-5">
              <p className="text-xs font-mono text-metal-300 mb-4 tracking-wider uppercase">Component Risk Assessment</p>
              <div className="space-y-3">
                {data.component_risks.map((cr: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-metal-100">{cr.component}</span>
                      <span style={{ color: getRiskColor(cr.risk_score > 70 ? "HIGH" : cr.risk_score > 40 ? "MEDIUM" : "LOW") }}>
                        {cr.risk_score}%
                      </span>
                    </div>
                    <div className="h-2 bg-forge-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${cr.risk_score}%`,
                          background: getRiskColor(cr.risk_score > 70 ? "HIGH" : cr.risk_score > 40 ? "MEDIUM" : "LOW"),
                          boxShadow: `0 0 8px ${getRiskColor(cr.risk_score > 70 ? "HIGH" : "MEDIUM")}`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-metal-300/60 mt-0.5">{cr.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sensor Anomalies */}
          {data.sensor_anomalies?.length > 0 && (
            <div className="glass-panel rounded-xl p-5">
              <p className="text-xs font-mono text-metal-300 mb-4 tracking-wider uppercase">Sensor Status</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {data.sensor_anomalies.map((sa: any, i: number) => (
                  <div key={i} className={`rounded-lg p-3 border ${
                    sa.status === "critical" ? "border-red-500/30 bg-red-500/5" :
                    sa.status === "warning" ? "border-yellow-500/30 bg-yellow-500/5" :
                    "border-green-500/20 bg-green-500/5"
                  }`}>
                    <p className="text-xs font-mono text-metal-300 mb-1">{sa.sensor}</p>
                    <p className="font-display text-lg font-bold" style={{
                      color: sa.status === "critical" ? "#ff2d55" : sa.status === "warning" ? "#ffd600" : "#00ff88"
                    }}>{sa.current_value}</p>
                    <p className="text-xs text-metal-300/60">Threshold: {sa.threshold}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Explanation */}
          <div className="glass-panel rounded-xl p-5 border-cyan-500/10">
            <p className="text-xs font-mono text-cyan-400/60 mb-3 tracking-wider uppercase">AI Analysis Narrative</p>
            <p className="text-metal-100 text-sm leading-relaxed">{data.ai_explanation}</p>
            {data.failure_indicators?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-mono text-metal-300 mb-2">Key Indicators:</p>
                <div className="flex flex-wrap gap-2">
                  {data.failure_indicators.map((ind: string, i: number) => (
                    <span key={i} className="text-xs font-mono text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded">
                      ⚠ {ind}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AgentPanel>
  );
}