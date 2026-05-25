import { COLORS, TIER_COLORS } from "../data/constants.js";
import { statusColor } from "../utils/format.js";

export default function AgentCard({ agent, isSelected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(agent)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(agent);
      }}
      aria-expanded={isSelected}
      style={{
        background: COLORS.glassWhite,
        border: `1px solid ${
          isSelected ? agent.color : COLORS.glassBorder
        }`,
        borderRadius: 12,
        padding: "18px 20px",
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: isSelected ? `0 0 20px ${agent.color}22` : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>{agent.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>
              {agent.label}
            </div>
            <div
              style={{
                fontSize: 11,
                color: agent.color,
                direction: "rtl",
              }}
            >
              {agent.arabic}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: statusColor(agent.health),
              flexShrink: 0,
            }}
            aria-label={`Status: ${agent.health}`}
          />
          <span
            style={{
              background: `${TIER_COLORS[agent.tier]}22`,
              border: `1px solid ${TIER_COLORS[agent.tier]}44`,
              borderRadius: 5,
              padding: "2px 8px",
              fontSize: 10,
              color: TIER_COLORS[agent.tier],
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {agent.tier}
          </span>
        </div>
      </div>
      <p
        style={{
          fontSize: 12,
          color: "#94a3b8",
          margin: "0 0 12px",
          lineHeight: 1.5,
        }}
      >
        {agent.description}
      </p>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}
      >
        {agent.fhirResources.map((r) => (
          <span
            key={r}
            style={{
              background: "rgba(14,165,233,0.1)",
              border: "1px solid rgba(14,165,233,0.2)",
              borderRadius: 4,
              padding: "1px 7px",
              fontSize: 10,
              color: "#0ea5e9",
              fontFamily: "monospace",
            }}
          >
            {r}
          </span>
        ))}
      </div>
      {isSelected && (
        <div
          style={{
            marginTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 12,
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                fontSize: 11,
                color: "#64748b",
                marginBottom: 4,
              }}
            >
              CF Workers
            </div>
            {agent.cfWorkers.map((w) => (
              <div
                key={w}
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#0ea5e9",
                  padding: "2px 0",
                }}
              >
                ⚡ {w}
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                fontSize: 11,
                color: "#64748b",
                marginBottom: 4,
              }}
            >
              API Endpoints
            </div>
            {agent.endpoints.map((e) => (
              <div
                key={e}
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#94a3b8",
                  padding: "2px 0",
                }}
              >
                {e}
              </div>
            ))}
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                color: "#64748b",
                marginBottom: 4,
              }}
            >
              InterSystems IRIS
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                color: "#ea580c",
                wordBreak: "break-all",
              }}
            >
              {agent.intersystems}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
