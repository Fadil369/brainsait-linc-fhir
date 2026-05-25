import { useState } from "react";
import { COLORS } from "../data/constants.js";

const TYPES = [
  "core",
  "orchestrator",
  "gateway",
  "mcp",
  "agent",
  "platform",
  "compliance",
  "router",
  "bridge",
  "admin",
];

export default function WorkerList({ workers }) {
  const [filterType, setFilterType] = useState(null);

  const filtered = filterType
    ? workers.filter((w) => w.type === filterType)
    : workers;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>
          Cloudflare Workers Inventory
        </h2>
        <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
          All {workers.length} healthcare/LINC workers discovered in your CF
          account.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setFilterType(null)}
          style={{
            background:
              filterType === null
                ? "rgba(14,165,233,0.15)"
                : "rgba(255,255,255,0.04)",
            border: `1px solid ${
              filterType === null
                ? "rgba(14,165,233,0.3)"
                : "rgba(255,255,255,0.08)"
            }`,
            borderRadius: 6,
            padding: "4px 12px",
            fontSize: 11,
            color: filterType === null ? "#0ea5e9" : "#64748b",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          All
        </button>
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            style={{
              background:
                filterType === t
                  ? "rgba(14,165,233,0.15)"
                  : "rgba(255,255,255,0.04)",
              border: `1px solid ${
                filterType === t
                  ? "rgba(14,165,233,0.3)"
                  : "rgba(255,255,255,0.08)"
              }`,
              borderRadius: 6,
              padding: "4px 12px",
              fontSize: 11,
              color: filterType === t ? "#0ea5e9" : "#64748b",
              cursor: "pointer",
              fontFamily: "inherit",
              textTransform: "capitalize",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {TYPES.map((type) => {
        const typeWorkers = workers.filter((w) => w.type === type);
        if (!typeWorkers.length || filterType) return null;
        return (
          <div key={type} style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 11,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: 8,
                paddingLeft: 4,
              }}
            >
              {type} ({typeWorkers.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {typeWorkers.map((w) => (
                <div
                  key={w.name}
                  style={{
                    background: COLORS.glassWhite,
                    border: `1px solid ${COLORS.glassBorder}`,
                    borderRadius: 8,
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background:
                        w.status === "active" ? "#22c55e" : "#ef4444",
                      flexShrink: 0,
                    }}
                    aria-label={`Status: ${w.status}`}
                  />
                  <code
                    style={{
                      fontSize: 12,
                      color: "#0ea5e9",
                      minWidth: 260,
                    }}
                  >
                    {w.name}
                  </code>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>
                    {w.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && filterType && (
        <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
          No workers found of type &quot;{filterType}&quot;
        </div>
      )}
    </div>
  );
}
