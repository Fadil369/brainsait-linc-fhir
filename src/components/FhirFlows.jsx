import { COLORS } from "../data/constants.js";
import { LINC_AGENTS } from "../data/agents.js";

export default function FhirFlows({ flows }) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>
          FHIR R4 Integration Flows
        </h2>
        <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
          Clinical workflows mapped to FHIR resources, LINC agents, and NPHIES
          compliance.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {flows.map((flow, i) => (
          <div
            key={i}
            style={{
              background: COLORS.glassWhite,
              border: `1px solid ${COLORS.glassBorder}`,
              borderRadius: 12,
              padding: "14px 20px",
              display: "grid",
              gridTemplateColumns: "200px 1fr 1fr auto",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 13, color: "#fff" }}>
              {flow.flow}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {flow.resources.map((r) => (
                <span
                  key={r}
                  style={{
                    background: "rgba(43,108,184,0.15)",
                    border: "1px solid rgba(43,108,184,0.3)",
                    borderRadius: 4,
                    padding: "2px 8px",
                    fontSize: 11,
                    color: "#7fb3f5",
                    fontFamily: "monospace",
                  }}
                >
                  {r}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {flow.agents.map((a) => {
                const ag = LINC_AGENTS.find((l) => l.id === a);
                return ag ? (
                  <span
                    key={a}
                    style={{
                      background: "rgba(14,165,233,0.1)",
                      border: "1px solid rgba(14,165,233,0.2)",
                      borderRadius: 4,
                      padding: "2px 8px",
                      fontSize: 11,
                      color: "#0ea5e9",
                    }}
                  >
                    {ag.icon} {ag.label}
                  </span>
                ) : null;
              })}
            </div>
            {flow.nphies ? (
              <span
                style={{
                  background: "rgba(234,88,12,0.15)",
                  border: "1px solid rgba(234,88,12,0.3)",
                  borderRadius: 5,
                  padding: "3px 10px",
                  fontSize: 11,
                  color: "#ea580c",
                  whiteSpace: "nowrap",
                }}
              >
                🏥 NPHIES
              </span>
            ) : (
              <span
                style={{
                  background: "rgba(100,116,139,0.1)",
                  border: "1px solid rgba(100,116,139,0.2)",
                  borderRadius: 5,
                  padding: "3px 10px",
                  fontSize: 11,
                  color: "#64748b",
                  whiteSpace: "nowrap",
                }}
              >
                Internal
              </span>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 24,
          background: COLORS.glassWhite,
          border: `1px solid ${COLORS.glassBorder}`,
          borderRadius: 12,
          padding: 20,
        }}
      >
        <h3
          style={{
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 16,
            color: "#0ea5e9",
          }}
        >
          Unified FHIR Architecture
        </h3>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "#94a3b8",
            lineHeight: 2,
            whiteSpace: "pre",
            overflowX: "auto",
          }}
        >
{`  Client / BSMA Web App
       │  SMART on FHIR OAuth2 (brainsait.io/auth/oauth2)
       ▼
  brainsait-api-gateway  ──► rate-limit · CORS · JWT validation
       │
       ├── /api/fhir/*   ──► givc-api-router → givc-healthcare-api → FHIR R4 Server (IRIS / HAPI)
       │                                       └─ Patient, Encounter, Coverage, Appointment …
       │
       ├── /api/claimlinc/* ─► claim-chat-agent + rcm-validation-api → NPHIES Gateway
       │                        └─ Claim, ClaimResponse, ExplanationOfBenefit, Coverage
       │
       ├── /api/agents/*  ──► healthlinc-unified /api/agents → Cloudflare AI
       │                        └─ DocuLinc, RecordLinc, DataLinc, TeleLinc …
       │
       ├── /api/mcp/*     ──► healthlinc-mcp MCP Server
       │                        └─ authlinc, claimlinc, recordlinc, notifylinc, doculinc …
       │
       └── /api/compliance/* ► givc-compliance + givc-compliance-monitor
                               └─ AuditEvent, Consent → R2 (encrypted) + KV`}
        </div>
      </div>
    </div>
  );
}
