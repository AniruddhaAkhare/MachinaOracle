"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TabNav from "@/components/ui/TabNav";
import OverviewTab from "@/components/tabs/OverviewTab";
import FailureTab from "@/components/tabs/FailureTab";
import RootCauseTab from "@/components/tabs/RootCauseTab";
import MaintenanceTab from "@/components/tabs/MaintenanceTab";
import CostTab from "@/components/tabs/CostTab";
import SparePartsTab from "@/components/tabs/SparePartsTab";
import TimelineTab from "@/components/tabs/TimelineTab";
import AlertsTab from "@/components/tabs/AlertsTab";
import WorkforceTab from "@/components/tabs/WorkforceTab";
import StrategyTab from "@/components/tabs/StrategyTab";
import DigitalTwinTab from "@/components/tabs/DigitalTwinTab";
import WhatIfTab from "@/components/tabs/WhatIfTab";
import AnomalyTab from "@/components/tabs/AnomalyTab";
import ChatTab from "@/components/tabs/ChatTab";
import View3DTab from "@/components/tabs/View3DTab";

const TABS = [
  { id: "overview",     label: "Overview",          icon: "📊", shortLabel: "Info" },
  { id: "failure",      label: "Failure Prediction", icon: "⚠️", shortLabel: "Fail" },
  { id: "rootcause",    label: "Root Cause",         icon: "🔍", shortLabel: "RCA" },
  { id: "maintenance",  label: "Maintenance Plan",   icon: "🔧", shortLabel: "Maint" },
  { id: "cost",         label: "Cost Analysis",      icon: "💰", shortLabel: "Cost" },
  { id: "spareparts",   label: "Spare Parts",        icon: "🔩", shortLabel: "Parts" },
  { id: "timeline",     label: "Failure Timeline",   icon: "📅", shortLabel: "Time" },
  { id: "alerts",       label: "Smart Alerts",       icon: "🚨", shortLabel: "Alert" },
  { id: "anomaly",      label: "Anomaly Detection",  icon: "📡", shortLabel: "Anom" },
  { id: "workforce",    label: "Workforce Plan",     icon: "👥", shortLabel: "Staff" },
  { id: "strategy",     label: "Strategy",           icon: "🎯", shortLabel: "Strat" },
  { id: "digitaltwin",  label: "Digital Twin",       icon: "🧊", shortLabel: "Twin" },
  { id: "whatif",       label: "What-If Sim",        icon: "🔮", shortLabel: "If" },
  { id: "3dview",       label: "3D View",            icon: "🖥️", shortLabel: "3D" },
  { id: "chat",         label: "AI Chat",            icon: "💬", shortLabel: "Chat" },
];

interface Props {
  sessionId: string;
  machine: any;
  allMachines: any[];
  onChangeMachine: (m: any) => void;
}

export default function MainDashboard({ sessionId, machine, allMachines, onChangeMachine }: Props) {
  const [activeTab, setActiveTab] = useState("overview");

  const renderTab = () => {
    const s = sessionId;
    const m = machine.machine_id;
    const n = machine.machine_name;
    switch (activeTab) {
      case "overview":    return <OverviewTab machine={machine} />;
      case "failure":     return <FailureTab sessionId={s} machineId={m} />;
      case "rootcause":   return <RootCauseTab sessionId={s} machineId={m} />;
      case "maintenance": return <MaintenanceTab sessionId={s} machineId={m} />;
      case "cost":        return <CostTab sessionId={s} machineId={m} />;
      case "spareparts":  return <SparePartsTab sessionId={s} machineId={m} />;
      case "timeline":    return <TimelineTab sessionId={s} machineId={m} />;
      case "alerts":      return <AlertsTab sessionId={s} machineId={m} />;
      case "anomaly":     return <AnomalyTab sessionId={s} machineId={m} />;
      case "workforce":   return <WorkforceTab sessionId={s} machineId={m} />;
      case "strategy":    return <StrategyTab sessionId={s} machineId={m} />;
      case "digitaltwin": return <DigitalTwinTab sessionId={s} machineId={m} />;
      case "whatif":      return <WhatIfTab sessionId={s} machineId={m} />;
      case "3dview":      return <View3DTab sessionId={s} machineId={m} machineName={n} />;
      case "chat":        return <ChatTab sessionId={s} machineId={m} machineName={n} />;
      default:            return <OverviewTab machine={machine} />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Machine Switcher Bar */}
      {allMachines.length > 1 && (
        <div className="border-b border-orange-500/10 bg-forge-800/50 px-4 py-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-mono text-metal-300 flex-shrink-0">MACHINES:</span>
            {allMachines.map((m) => (
              <button
                key={m.machine_id}
                onClick={() => onChangeMachine(m)}
                className={`text-xs font-mono px-3 py-1 rounded flex-shrink-0 transition-all ${
                  m.machine_id === machine.machine_id
                    ? "bg-orange-500/20 border border-orange-500/40 text-orange-400"
                    : "text-metal-300 hover:text-white border border-transparent hover:border-metal-700/50"
                }`}
              >
                {m.machine_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Machine Header */}
      <div className="px-6 py-4 bg-forge-800/30 border-b border-cyan-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <div>
              <h2 className="font-display text-lg font-bold text-white">{machine.machine_name}</h2>
              <p className="text-xs text-metal-300 font-mono">
                {machine.machine_type} · ID: {machine.machine_id} · Session: {sessionId.slice(0,8)}...
              </p>
            </div>
          </div>
          <div className="text-xs font-mono text-cyan-400/50 hidden md:block">
            GEMINI 2.5 FLASH · {TABS.length - 1} AI AGENTS READY
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {renderTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}