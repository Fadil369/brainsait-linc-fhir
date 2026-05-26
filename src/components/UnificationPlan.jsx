import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { statusBadge } from "@/components/ui/brainsait";

const statusLabel = {
  ready: "Ready",
  "in-progress": "In Progress",
  planned: "Planned",
};

export default function UnificationPlan({ plan, workerCount, agentCount }) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">Unification Roadmap</h2>
        <p className="text-xs text-gray-500">
          4-phase plan to consolidate all scattered LINC agents into a unified
          InterSystems FHIR architecture.
        </p>
      </div>

      {plan.map((phase, i) => (
        <Card
          key={i}
          className="mb-4 border-white/10 bg-white/5 p-5 backdrop-blur-sm"
          style={{
            borderLeft: `3px solid ${
              phase.status === "ready"
                ? "#22c55e"
                : phase.status === "in-progress"
                ? "#0ea5e9"
                : "#64748b"
            }`,
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">{phase.phase}</div>
              <div className="text-xs text-gray-500">{phase.duration}</div>
            </div>
            <Badge className={statusBadge(phase.status)} variant="outline">
              {statusLabel[phase.status]}
            </Badge>
          </div>
          <div className="space-y-2">
            {phase.tasks.map((task, j) => (
              <div key={j} className="flex items-start gap-2.5">
                <span className="shrink-0 text-xs text-cyan-400">
                  {String(j + 1).padStart(2, "0")}.
                </span>
                <span className="text-xs leading-relaxed text-gray-400">{task}</span>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "CF Workers Found", value: workerCount, color: "text-cyan-400" },
          { label: "LINC Agents", value: agentCount, color: "text-blue-400" },
          { label: "FHIR Resources", value: "60+", color: "text-orange-400" },
          { label: "NPHIES Flows", value: `${plan.filter((p) => p.status === "ready").length + 4}`, color: "text-green-400" },
        ].map((s) => (
          <Card
            key={s.label}
            className="border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm"
          >
            <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="mt-1 text-[11px] text-gray-500">{s.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
