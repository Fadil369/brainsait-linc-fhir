import { useState } from "react";
import AgentCard from "./AgentCard.jsx";

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
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2
            style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}
          >
            Unified LINC Agent Registry
          </h2>
          <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
            All agents discovered across CF Workers, Notion, and production
            deployments — mapped to FHIR R4 resources.
          </p>
        </div>
        <input
          type="text"
          placeholder="Search agents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search LINC agents"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8,
            padding: "8px 14px",
            color: "#e2e8f0",
            fontSize: 13,
            fontFamily: "inherit",
            outline: "none",
            width: 240,
          }}
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 16,
        }}
      >
        {filtered.length === 0 && (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: 40,
              color: "#64748b",
              fontSize: 14,
            }}
          >
            No agents match &quot;{searchTerm}&quot;
          </div>
        )}
        {filtered.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isSelected={selectedAgent?.id === agent.id}
            onSelect={(a) =>
              setSelectedAgent(
                selectedAgent?.id === a.id ? null : a
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
