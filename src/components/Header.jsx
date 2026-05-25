import { COLORS } from "../data/constants.js";

export default function Header({ workerCount, agentCount }) {
  return (
    <div
      dir="ltr"
      style={{
        background: "rgba(10,22,40,0.95)",
        borderBottom: "1px solid rgba(43,108,184,0.3)",
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(20px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            width: 44,
            height: 44,
            background: "linear-gradient(135deg, #2b6cb8, #0ea5e9)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
        >
          🧠
        </div>
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.3px",
            }}
          >
            BrainSAIT · LINC Agent Unification
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#0ea5e9",
              fontFamily: "monospace",
            }}
          >
            InterSystems FHIR R4 · NPHIES · Cloudflare Edge · OID 1.3.6.1.4.1.61026
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <span
          style={{
            background: "rgba(14,165,233,0.15)",
            border: "1px solid rgba(14,165,233,0.3)",
            borderRadius: 6,
            padding: "4px 10px",
            fontSize: 11,
            color: "#0ea5e9",
          }}
        >
          {workerCount} Workers Found
        </span>
        <span
          style={{
            background: "rgba(234,88,12,0.15)",
            border: "1px solid rgba(234,88,12,0.3)",
            borderRadius: 6,
            padding: "4px 10px",
            fontSize: 11,
            color: "#ea580c",
          }}
        >
          {agentCount} LINC Agents
        </span>
      </div>
    </div>
  );
}
