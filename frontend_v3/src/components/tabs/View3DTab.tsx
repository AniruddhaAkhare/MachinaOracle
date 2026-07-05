"use client";
import dynamic from "next/dynamic";
import AgentPanel from "@/components/ui/AgentPanel";
import { predictFailure } from "@/lib/api";

const MachineViewer3D = dynamic(() => import("@/components/3d/MachineViewer3D"), {
  ssr: false,
  loading: () => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300 }}>
      <div className="spinner" />
    </div>
  ),
});

interface Props { sessionId: string; machineId: string; machineName: string; machineType?: string; }

export default function View3DTab({ sessionId, machineId, machineName, machineType }: Props) {
  return (
    <AgentPanel agentName="Failure Prediction Agent"
      fetchFn={() => predictFailure(sessionId, machineId)}
      cacheKey={`failure_${sessionId}_${machineId}`}>
      {(failureData) => (
        <MachineViewer3D
          failureData={failureData}
          machineName={machineName}
          machineType={machineType || failureData?.machine_type || machineName}
        />
      )}
    </AgentPanel>
  );
}
