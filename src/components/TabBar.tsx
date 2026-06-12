"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  arabic: string;
  icon?: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  const [hoverTab, setHoverTab] = useState<string | null>(null);

  return (
    <div className="border-b border-white/6 bg-white/[0.02]">
      <Tabs value={activeTab} onValueChange={onTabChange} className="px-6">
        <TabsList className="h-auto w-full justify-start gap-0 border-b-0 bg-transparent p-0">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "relative flex flex-col items-start gap-0.5 rounded-none border-b-2 border-transparent px-5 py-4 text-sm font-medium transition-all duration-300",
                "data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-500 data-[state=active]:shadow-none",
                "text-gray-500 hover:text-gray-300 hover:bg-white/5",
                activeTab === tab.id 
                  ? "text-cyan-400" 
                  : "text-gray-500"
              )}
              onMouseEnter={() => setHoverTab(tab.id)}
              onMouseLeave={() => setHoverTab(null)}
            >
              {/* Active underline animation */}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
              )}
              
              {/* Hover glow effect */}
              {(hoverTab === tab.id || activeTab === tab.id) && (
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-50 transition-opacity" />
              )}
              
              <span className="relative z-10 flex items-center gap-2">
                {tab.icon && <span>{tab.icon}</span>}
                <span className="font-semibold">{tab.label}</span>
              </span>
              <span className="relative z-10 text-[11px] text-gray-500" dir="rtl">
                {tab.arabic}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}