"use client";
import { cn } from "@/lib/utils";
interface Tab { id: string; label: string; icon: string; }
interface Props { tabs: Tab[]; activeTab: string; onTabChange: (id: string) => void; }
export default function TabNav({ tabs, activeTab, onTabChange }: Props) {
  return (
    <div className="tab-bar">
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onTabChange(tab.id)} className={cn("tab-btn", activeTab === tab.id && "active")}>
          <span style={{ fontSize:14, opacity:0.75 }}>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
