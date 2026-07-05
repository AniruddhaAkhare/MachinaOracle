"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon: string;
  shortLabel?: string;
}

interface Props {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function TabNav({ tabs, activeTab, onTabChange }: Props) {
  return (
    <div className="sticky top-0 z-40 bg-forge-900/95 backdrop-blur-md border-b border-cyan-500/10">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-3 text-xs font-mono whitespace-nowrap transition-all duration-200 flex-shrink-0",
              activeTab === tab.id ? "tab-active" : "tab-inactive"
            )}
          >
            <span>{tab.icon}</span>
            <span className="hidden md:inline">{tab.label}</span>
            <span className="md:hidden">{tab.shortLabel || tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}