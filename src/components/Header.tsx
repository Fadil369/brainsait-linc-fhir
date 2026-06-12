"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/brainsait";
import { Brain, Cloud, Activity, Globe, Server, Shield, ChevronRight, ExternalLink, Menu, Settings, Bell, Search } from "lucide-react";

interface HeaderProps {
  workerCount: number;
  agentCount: number;
}

export default function Header({ workerCount, agentCount }: HeaderProps) {
  const handleApiHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      console.log('API Health:', data);
    } catch (e) {
      console.error('API error:', e);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060d18]/90 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-600/25 ring-1 ring-white/10">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              BrainSAIT
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-cyan-400/80">
              <span className="font-mono">FHIR R4</span>
              <span className="text-white/20">•</span>
              <span className="font-mono">NPHIES</span>
              <span className="text-white/20">•</span>
              <span className="font-mono">Cloudflare</span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleApiHealth}>
            <Server className="mr-1.5 h-3.5 w-3.5" />
            API
          </Button>
          <Button variant="ghost" size="sm">
            <Shield className="mr-1.5 h-3.5 w-3.5" />
            Compliance
          </Button>
          <Button variant="ghost" size="sm">
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            Ecosystems
          </Button>
        </nav>

        {/* Status Badges */}
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className="h-7 border-cyan-500/20 bg-cyan-500/10 px-2.5 text-[11px] text-cyan-400 backdrop-blur-sm"
          >
            <Cloud className="mr-1.5 h-3 w-3" />
            {workerCount} Workers
          </Badge>
          <Badge 
            variant="outline" 
            className="h-7 border-orange-500/20 bg-orange-500/10 px-2.5 text-[11px] text-orange-400 backdrop-blur-sm"
          >
            <Activity className="mr-1.5 h-3 w-3" />
            {agentCount} Agents
          </Badge>
          <Badge 
            variant="outline" 
            className="h-7 border-emerald-500/20 bg-emerald-500/10 px-2.5 text-[11px] text-emerald-400 backdrop-blur-sm"
          >
            <span className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Live
          </Badge>
          
          {/* Tools */}
          <div className="flex items-center gap-1 ml-2 border-l border-white/10 pl-2">
            <Button variant="ghost" size="icon-xs" className="text-gray-500 hover:text-white">
              <Search className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon-xs" className="text-gray-500 hover:text-white">
              <Bell className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon-xs" className="text-gray-500 hover:text-white">
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}