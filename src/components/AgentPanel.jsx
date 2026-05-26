"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import AgentCard from "./AgentCard";

export default function AgentPanel({ agents }) {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = searchTerm
    ? agents.filter(
        (a) =>
          a.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.arabic.includes(searchTerm) ||
          a.id.includes(searchTerm.toLowerCase())
      )
    : agents;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            Unified LINC Agent Registry
          </h2>
          <p className="text-xs text-gray-500">
            All agents discovered across CF Workers, Notion, and production
            deployments — mapped to FHIR R4 resources.
          </p>
        </div>
        <Input
          type="text"
          placeholder="Search agents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search LINC agents"
          className="w-60 border-white/10 bg-white/5 text-sm text-gray-200 placeholder:text-gray-600"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-500">
          No agents match &quot;{searchTerm}&quot;
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isSelected={selectedAgent?.id === agent.id}
              onSelect={(a) =>
                setSelectedAgent(selectedAgent?.id === a.id ? null : a)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
