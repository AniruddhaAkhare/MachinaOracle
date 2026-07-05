"use client";
import AgentPanel from "@/components/ui/AgentPanel";
import { getSpareParts } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface Props { sessionId: string; machineId: string; }

const URGENCY_COLORS: Record<string,string> = { IMMEDIATE: "#ff2d55", SOON: "#ff6b00", PLANNED: "#ffd600" };

export default function SparePartsTab({ sessionId, machineId }: Props) {
  return (
    <AgentPanel agentName="Spare Parts Agent" fetchFn={() => getSpareParts(sessionId, machineId)} cacheKey={`parts_${sessionId}_${machineId}`}>
      {(data) => (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-2">
            <div className="glass-panel rounded-xl p-4 text-center">
              <p className="text-xs font-mono text-metal-300 mb-1">TOTAL PARTS COST</p>
              <p className="font-display text-2xl font-bold text-cyan-400">{formatCurrency(data.total_parts_cost)}</p>
            </div>
            <div className="glass-panel rounded-xl p-4 text-center">
              <p className="text-xs font-mono text-metal-300 mb-1">PROCUREMENT</p>
              <p className="text-sm text-white font-medium mt-1">{data.procurement_timeline}</p>
            </div>
            <div className="glass-panel rounded-xl p-4 text-center">
              <p className="text-xs font-mono text-metal-300 mb-1">ACTION</p>
              <p className="text-sm text-yellow-400 font-mono mt-1">{data.inventory_action}</p>
            </div>
          </div>

          {/* Critical Parts */}
          {data.critical_parts?.length > 0 && (
            <div className="glass-panel rounded-xl p-5">
              <p className="text-xs font-mono text-metal-300 mb-4 tracking-wider uppercase">Critical Parts Required</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs font-mono text-metal-300 border-b border-metal-700">
                      {["Part", "Part No.", "Qty", "Cost", "Lead Time", "Urgency"].map(h => (
                        <th key={h} className="text-left py-2 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.critical_parts.map((p: any, i: number) => (
                      <tr key={i} className="border-b border-metal-700/30">
                        <td className="py-3 pr-4 text-white font-medium">{p.part_name}</td>
                        <td className="py-3 pr-4 font-mono text-cyan-400/70 text-xs">{p.part_number}</td>
                        <td className="py-3 pr-4 text-metal-100">{p.quantity_needed}</td>
                        <td className="py-3 pr-4 text-green-400">{formatCurrency(p.estimated_cost)}</td>
                        <td className="py-3 pr-4 text-metal-300">{p.lead_time_days}d</td>
                        <td className="py-3 pr-4">
                          <span className="text-xs font-mono px-2 py-0.5 rounded"
                            style={{ background: `${URGENCY_COLORS[p.urgency] || "#ccc"}20`, color: URGENCY_COLORS[p.urgency] || "#ccc", border: `1px solid ${URGENCY_COLORS[p.urgency] || "#ccc"}40` }}>
                            {p.urgency}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data.parts_narrative && (
            <div className="glass-panel rounded-xl p-5 border-cyan-500/10">
              <p className="text-xs font-mono text-cyan-400/60 mb-3">PARTS ANALYSIS</p>
              <p className="text-sm text-metal-100 leading-relaxed">{data.parts_narrative}</p>
            </div>
          )}
        </div>
      )}
    </AgentPanel>
  );
}