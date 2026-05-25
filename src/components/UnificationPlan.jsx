import { COLORS } from "../data/constants.js";
import { statusColor, statusLabel } from "../utils/format.js";

export default function UnificationPlan({ plan, workerCount, agentCount }) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>
          Unification Roadmap
        </h2>
        <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
          4-phase plan to consolidate all scattered LINC agents into a unified
          InterSystems FHIR architecture.
        </p>
      </div>

      {plan.map((phase, i) => {
        const color = statusColor(phase.status);
        return (
          <div
            key={i}
            style={{
              background: COLORS.glassWhite,
              border: `1px solid ${COLORS.glassBorder}`,
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
              borderLeft: `3px solid ${color}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>
                  {phase.phase}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    marginTop: 2,
                  }}
                >
                  {phase.duration}
                </div>
              </div>
              <span
                style={{
                  background: `${color}22`,
                  border: `1px solid ${color}44`,
                  color,
                  borderRadius: 5,
                  padding: "3px 10px",
                  fontSize: 11,
                  textTransform: "uppercase",
                }}
              >
                {statusLabel(phase.status)}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {phase.tasks.map((task, j) => (
                <div
                  key={j}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      color: "#0ea5e9",
                      marginTop: 1,
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    {String(j + 1).padStart(2, "0")}.
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "#94a3b8",
                      lineHeight: 1.5,
                    }}
                  >
                    {task}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginTop: 8,
        }}
      >
        {[
          { label: "CF Workers Found", value: workerCount, color: "#0ea5e9" },
          { label: "LINC Agents", value: agentCount, color: "#2b6cb8" },
          { label: "FHIR Resources", value: "60+", color: "#ea580c" },
          {
            label: "NPHIES Flows",
            value: plan.filter((p) => p.status === "ready").length + 4,
            color: "#22c55e",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: COLORS.glassWhite,
              border: `1px solid ${COLORS.glassBorder}`,
              borderRadius: 10,
              padding: "14px 18px",
              textAlign: "center",
            }}
          >
            <div
              style={{ fontSize: 28, fontWeight: 800, color: s.color }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
