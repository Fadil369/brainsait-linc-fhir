import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const TYPES = [
  "core", "orchestrator", "gateway", "mcp", "agent", "platform",
  "compliance", "router", "bridge", "admin",
];

export default function WorkerList({ workers }) {
  const [filterType, setFilterType] = useState(null);

  const filtered = filterType
    ? workers.filter((w) => w.type === filterType)
    : workers;

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">Cloudflare Workers Inventory</h2>
        <p className="text-xs text-gray-500">
          All {workers.length} healthcare/LINC workers discovered in your CF
          account.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <Badge
          variant="outline"
          className={`cursor-pointer px-3 py-1.5 text-[11px] ${
            filterType === null
              ? "border-cyan-500/30 bg-cyan-500/15 text-cyan-400"
              : "border-white/10 bg-white/[0.04] text-gray-500"
          }`}
          onClick={() => setFilterType(null)}
        >
          All
        </Badge>
        {TYPES.map((t) => (
          <Badge
            key={t}
            variant="outline"
            className={`cursor-pointer px-3 py-1.5 text-[11px] capitalize ${
              filterType === t
                ? "border-cyan-500/30 bg-cyan-500/15 text-cyan-400"
                : "border-white/10 bg-white/[0.04] text-gray-500"
            }`}
            onClick={() => setFilterType(t)}
          >
            {t}
          </Badge>
        ))}
      </div>

      {filtered.length === 0 && filterType ? (
        <div className="py-10 text-center text-sm text-gray-500">
          No workers found of type &quot;{filterType}&quot;
        </div>
      ) : (
        TYPES.map((type) => {
          const typeWorkers = workers.filter((w) => w.type === type);
          if (!typeWorkers.length || filterType) return null;
          return (
            <div key={type} className="mb-5">
              <p className="mb-2 pl-1 text-[11px] uppercase tracking-wider text-gray-500">
                {type} ({typeWorkers.length})
              </p>
              <div className="space-y-1.5">
                {typeWorkers.map((w) => (
                  <Card
                    key={w.name}
                    className="flex items-center gap-4 border-white/10 bg-white/5 p-3 backdrop-blur-sm"
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        w.status === "active" ? "bg-green-500" : "bg-red-500"
                      }`}
                      aria-label={`Status: ${w.status}`}
                    />
                    <code className="min-w-[250px] text-xs text-cyan-400">
                      {w.name}
                    </code>
                    <span className="text-xs text-gray-400">{w.role}</span>
                  </Card>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
