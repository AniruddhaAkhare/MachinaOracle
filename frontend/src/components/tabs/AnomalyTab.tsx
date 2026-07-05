"use client";
import AgentPanel from "@/components/ui/AgentPanel";
import { getAnomaly } from "@/lib/api";

interface Props { sessionId: string; machineId: string; }

const SEV_COLORS: Record<string, string> = { CRITICAL: "#ff2d55", HIGH: "#ff6b00", MEDIUM: "#ffd600", LOW: "#00ff88" };

export default function AnomalyTab({ sessionId, machineId }: Props) {
  return (
    <AgentPanel agentName="Anomaly Detection Agent" fetchFn={() => getAnomaly(sessionId, machineId)} cacheKey={`anomaly_${sessionId}_${machineId}`}>
      {(data) => (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Anomaly Score", value: `${data.anomaly_score}/100`, color: data.anomaly_score > 70 ? "#ff2d55" : data.anomaly_score > 40 ? "#ff6b00" : "#00ff88" },
              { label: "Baseline Deviation", value: data.baseline_deviation, color: "#ffd600" },
              { label: "ML Confidence", value: `${data.ml_confidence}%`, color: "#00f5ff" },
              { label: "False Positive Risk", value: `${data.false_positive_probability}%`, color: "#9b59ff" },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-panel rounded-xl p-4 text-center">
                <p className="text-xs font-mono text-metal-300 mb-1">{label}</p>
                <p className="font-display text-xl font-bold" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          {data.anomalies_detected?.length > 0 && (
            <div className="glass-panel rounded-xl p-5">
              <p className="text-xs font-mono text-metal-300 mb-4 tracking-wider uppercase">Detected Anomalies</p>
              <div className="space-y-3">
                {data.anomalies_detected.map((a: any) => (
                  <div key={a.anomaly_id} className="p-4 rounded-lg border" style={{ borderColor: `${SEV_COLORS[a.severity]}30`, background: `${SEV_COLORS[a.severity]}08` }}>
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-mono flex-shrink-0" style={{ color: SEV_COLORS[a.severity] }}>{a.anomaly_id}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-sm text-white font-medium">{a.description}</p>
                          <span className="text-xs font-mono bg-forge-700/50 px-2 py-0.5 rounded text-metal-300">{a.type}</span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ color: SEV_COLORS[a.severity], border: `1px solid ${SEV_COLORS[a.severity]}40`, background: `${SEV_COLORS[a.severity]}10` }}>{a.severity}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-metal-300">
                          <span>Sensor: {a.sensor}</span>
                          <span>Value: <b className="text-white">{a.value_detected}</b></span>
                          <span>Expected: {a.expected_range}</span>
                          <span>Deviation: <b style={{ color: SEV_COLORS[a.severity] }}>{a.deviation_percentage}%</b></span>
                          <span>Pattern: {a.pattern}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.pattern_analysis && (
            <div className="glass-panel rounded-xl p-5">
              <p className="text-xs font-mono text-metal-300 mb-4 tracking-wider uppercase">Pattern Analysis</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Trend", value: data.pattern_analysis.trend },
                  { label: "Seasonality", value: data.pattern_analysis.seasonality },
                  { label: "Cycles", value: data.pattern_analysis.cycles },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-lg bg-forge-700/50">
                    <p className="text-xs font-mono text-metal-300 mb-1">{label}</p>
                    <p className="text-sm text-white capitalize">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.anomaly_narrative && (
            <div className="glass-panel rounded-xl p-5 border-cyan-500/10">
              <p className="text-xs font-mono text-cyan-400/60 mb-3">ANOMALY ANALYSIS</p>
              <p className="text-sm text-metal-100 leading-relaxed">{data.anomaly_narrative}</p>
            </div>
          )}
        </div>
      )}
    </AgentPanel>
  );
}