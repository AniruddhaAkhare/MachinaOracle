"use client";
import { cn } from "@/lib/utils";

interface Tab { id: string; label: string; icon: string; }
interface Props { tabs: Tab[]; activeTab: string; onTabChange: (id: string) => void; }

export default function TabNav({ tabs, activeTab, onTabChange }: Props) {
  return (
    <div className="tab-bar sticky top-12 z-40">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn("tab-item", activeTab === tab.id && "active")}
          title={tab.label}
        >
          <span style={{ fontSize: 11 }}>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
