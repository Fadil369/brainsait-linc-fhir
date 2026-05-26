import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LINC_AGENTS } from "@/data/agents";

export default function FhirFlows({ flows }) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">FHIR R4 Integration Flows</h2>
        <p className="text-xs text-gray-500">
          Clinical workflows mapped to FHIR resources, LINC agents, and NPHIES
          compliance.
        </p>
      </div>

      <div className="space-y-2.5">
        {flows.map((flow, i) => {
          const agents = flow.agents
            .map((a) => LINC_AGENTS.find((l) => l.id === a))
            .filter(Boolean);
          return (
            <Card
              key={i}
              className="flex items-center gap-4 border-white/10 bg-white/5 p-4 backdrop-blur-sm"
            >
              <div className="min-w-[170px] text-sm font-semibold text-white">
                {flow.flow}
              </div>
              <div className="flex flex-1 flex-wrap gap-1.5">
                {flow.resources.map((r) => (
                  <Badge
                    key={r}
                    variant="outline"
                    className="border-blue-800/30 bg-blue-900/15 px-2 py-0 font-mono text-[11px] text-blue-300"
                  >
                    {r}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-1 flex-wrap gap-1.5">
                {agents.map((ag) =>
                  ag ? (
                    <Badge
                      key={ag.id}
                      variant="outline"
                      className="border-cyan-500/20 bg-cyan-500/10 px-2 py-0 text-[11px] text-cyan-400"
                    >
                      {ag.icon} {ag.label}
                    </Badge>
                  ) : null
                )}
              </div>
              {flow.nphies ? (
                <Badge className="shrink-0 border-orange-500/30 bg-orange-500/15 text-[11px] text-orange-400">
                  🏥 NPHIES
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="shrink-0 border-gray-600/20 bg-gray-500/10 text-[11px] text-gray-400"
                >
                  Internal
                </Badge>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <h3 className="mb-4 text-sm font-semibold text-cyan-400">
          Unified FHIR Architecture
        </h3>
        <Separator className="mb-4 bg-white/10" />
        <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed text-gray-400">
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
        </pre>
      </Card>
    </div>
  );
}
