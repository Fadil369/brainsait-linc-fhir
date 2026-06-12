"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard, tierBadge, statusBadge, LivePulse } from "@/components/ui/brainsait";
import { Brain, ChevronDown, ChevronRight, ExternalLink, Activity, Server, Globe, ArrowUpRight } from "lucide-react";

interface Agent {
  id: string;
  label: string;
  arabic: string;
  icon: string;
  color: string;
  tier: string;
  fhirResources: string[];
  cfWorkers: string[];
  endpoints: string[];
  description: string;
  intersystems: string;
  health: string;
}

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: (agent: Agent) => void;
}

export default function AgentCard({ agent, isSelected, onSelect }: AgentCardProps) {
  const [loading, setLoading] = useState(false);

  const handleEndpointClick = useCallback(async (endpoint: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      console.log('Endpoint response:', endpoint, data);
    } catch (err) {
      console.error('Endpoint error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleWorkerClick = useCallback(async (worker: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Worker clicked:', worker);
  }, []);

  return (
    <GlassCard 
      className={`cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
        isSelected 
          ? 'border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)]' 
          : 'hover:border-white/20'
      }`}
      style={{
        borderColor: isSelected ? agent.color : undefined,
      }}
      onClick={() => onSelect(agent)}
      role="button"
      tabIndex={0}
      aria-expanded={isSelected}
    >
      {/* Top accent bar */}
      <div 
        className="h-1 transition-all duration-300" 
        style={{ 
          background: `linear-gradient(90deg, ${agent.color}88, ${agent.color}44)`,
          opacity: isSelected ? 1 : 0.5
        }} 
      />

      <div className="p-5">
        {/* Header Row */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Icon badge */}
            <div 
              className="flex h-12 w-12 items-center justify-center rounded-xl text-xl shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${agent.color}33, ${agent.color}11)`,
                boxShadow: `0 4px 12px ${agent.color}22`
              }}
            >
              <span>{agent.icon}</span>
            </div>
            
            {/* Label & Arabic */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{agent.label}</h3>
                <LivePulse live={agent.health === "operational"} size="sm" />
              </div>
              <div 
                className="text-sm" 
                style={{ color: agent.color, direction: "rtl" }}
              >
                {agent.arabic}
              </div>
            </div>
          </div>

          {/* Tier Badge */}
          <Badge 
            variant="outline" 
            className={`${tierBadge(agent.tier)} text-[10px] uppercase tracking-wider`}
          >
            {agent.tier}
          </Badge>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed text-gray-400">{agent.description}</p>

        {/* FHIR Resources */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          <span className="text-[10px] text-gray-600 py-1">FHIR:</span>
          {agent.fhirResources.slice(0, 4).map((r) => (
            <Badge
              key={r}
              variant="outline"
              className="border-cyan-500/20 bg-cyan-500/8 px-2 py-0 font-mono text-[10px] text-cyan-400/80"
            >
              {r}
            </Badge>
          ))}
          {agent.fhirResources.length > 4 && (
            <Badge variant="outline" className="border-gray-600/20 bg-gray-500/5 px-2 py-0 text-[10px] text-gray-500">
              +{agent.fhirResources.length - 4}
            </Badge>
          )}
        </div>

        {/* Expanded Details */}
        {isSelected && (
          <div className="space-y-4 border-t border-white/10 pt-4 mt-4">
            {/* CF Workers */}
            <div>
              <div className="mb-2 flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-wider">
                <Server className="h-3 w-3" />
                Cloudflare Workers
              </div>
              <div className="flex flex-wrap gap-1.5">
                {agent.cfWorkers.map((worker) => (
                  <Button
                    key={worker}
                    variant="ghost"
                    size="xs"
                    onClick={(e) => handleWorkerClick(worker, e)}
                    className="h-auto py-1 px-2 font-mono text-[11px] text-cyan-400 hover:text-cyan-300"
                  >
                    <ChevronRight className="mr-1 h-2.5 w-2.5" />
                    {worker}
                  </Button>
                ))}
              </div>
            </div>

            {/* API Endpoints */}
            <div>
              <div className="mb-2 flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-wider">
                <Activity className="h-3 w-3" />
                API Endpoints
              </div>
              <div className="flex flex-col gap-1.5">
                {agent.endpoints.map((endpoint) => (
                  <Button
                    key={endpoint}
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleEndpointClick(endpoint, e)}
                    className="justify-start h-auto py-1.5 px-3 font-mono text-xs text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    <ArrowUpRight className="mr-2 h-3 w-3 text-gray-600" />
                    {endpoint}
                  </Button>
                ))}
              </div>
            </div>

            {/* InterSystems IRIS */}
            <div>
              <div className="mb-2 flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-wider">
                <Globe className="h-3 w-3" />
                InterSystems IRIS
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <p className="font-mono text-[10px] text-orange-400 break-all leading-relaxed">
                  {agent.intersystems}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Expand indicator */}
        {!isSelected && (
          <div className="flex items-center justify-end text-gray-600">
            <span className="text-[10px]">Expand</span>
            <ChevronDown className="ml-1 h-3 w-3" />
          </div>
        )}
      </div>
    </GlassCard>
  );
}