"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import AgentPanel from "@/components/ui/AgentPanel";
import { predictFailure } from "@/lib/api";

const MachineViewer3D = dynamic(() => import("@/components/3d/MachineViewer3D"), { ssr: false, loading: () => (
  <div className="flex items-center justify-center h-64">
    <div className="loading-ring" />
  </div>
)});

interface Props { sessionId: string; machineId: string; machineName: string; }

export default function View3DTab({ sessionId, machineId, machineName }: Props) {
  return (
    <AgentPanel
      agentName="3D Visualization Engine"
      fetchFn={() => predictFailure(sessionId, machineId)}
      cacheKey={`failure_${sessionId}_${machineId}`}
    >
      {(failureData) => (
        <MachineViewer3D failureData={failureData} machineName={machineName} />
      )}
    </AgentPanel>
  );
}