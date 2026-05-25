import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { statusBadge } from "@/components/ui/brainsait";

export default function AgentCard({ agent, isSelected, onSelect }) {
  return (
    <Card
      className={`cursor-pointer border bg-white/5 backdrop-blur-sm transition-all duration-200 hover:bg-white/[0.08] ${
        isSelected ? `shadow-lg` : "border-white/10"
      }`}
      style={{
        borderColor: isSelected ? agent.color : undefined,
        boxShadow: isSelected ? `0 0 20px ${agent.color}22` : undefined,
      }}
      onClick={() => onSelect(agent)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(agent);
      }}
      tabIndex={0}
      role="button"
      aria-expanded={isSelected}
    >
      <div className="p-5">
        <div className="mb-2.5 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{agent.icon}</span>
            <div>
              <div className="text-sm font-bold text-white">{agent.label}</div>
              <div className="text-xs" style={{ color: agent.color, direction: "rtl" }}>
                {agent.arabic}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                agent.health === "operational" ? "bg-green-500" : "bg-red-500"
              }`}
              aria-label={`Status: ${agent.health}`}
            />
            <Badge
              variant="outline"
              className="px-2 py-0 text-[10px] uppercase tracking-wider"
              style={{
                background: `${
                  agent.tier === "orchestrator" ? "#2b6cb8" : "#0ea5e9"
                }22`,
                borderColor: `${
                  agent.tier === "orchestrator" ? "#2b6cb8" : "#0ea5e9"
                }44`,
                color: agent.tier === "orchestrator" ? "#2b6cb8" : "#0ea5e9",
              }}
            >
              {agent.tier}
            </Badge>
          </div>
        </div>

        <p className="mb-3 text-xs leading-relaxed text-gray-400">{agent.description}</p>

        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {agent.fhirResources.map((r) => (
            <Badge
              key={r}
              variant="outline"
              className="border-cyan-500/20 bg-cyan-500/10 px-2 py-0 font-mono text-[10px] text-cyan-400"
            >
              {r}
            </Badge>
          ))}
        </div>

        {isSelected && (
          <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
            <div>
              <p className="mb-1 text-[11px] text-gray-500">CF Workers</p>
              {agent.cfWorkers.map((w) => (
                <p key={w} className="py-0.5 font-mono text-[11px] text-cyan-400">
                  ⚡ {w}
                </p>
              ))}
            </div>
            <div>
              <p className="mb-1 text-[11px] text-gray-500">API Endpoints</p>
              {agent.endpoints.map((e) => (
                <p key={e} className="py-0.5 font-mono text-[11px] text-gray-400">
                  {e}
                </p>
              ))}
            </div>
            <div>
              <p className="mb-1 text-[11px] text-gray-500">InterSystems IRIS</p>
              <p className="break-all font-mono text-[10px] text-orange-500">
                {agent.intersystems}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
