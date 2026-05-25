import { COLORS } from "../data/constants.js";

export default function InterSystemsPanel({ arch }) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>
          InterSystems IRIS Production Architecture
        </h2>
        <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
          Map BrainSAIT LINC agents to IRIS Production classes for AI Agents for
          FHIR pattern.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            background: COLORS.glassWhite,
            border: `1px solid ${COLORS.glassBorder}`,
            borderRadius: 12,
            padding: 20,
          }}
        >
          <h3
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#0ea5e9",
              marginBottom: 12,
            }}
          >
            IRIS Namespace &amp; FHIR Server
          </h3>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "#94a3b8",
              lineHeight: 2,
            }}
          >
            <div>
              <span style={{ color: "#64748b" }}>Namespace:</span>{" "}
              <span style={{ color: "#fff" }}>{arch.namespace}</span>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>FHIR Server:</span>{" "}
              <span style={{ color: "#0ea5e9" }}>{arch.fhirServer}</span>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>OAuth2 Server:</span>{" "}
              <span style={{ color: "#0ea5e9" }}>{arch.oauthServer}</span>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>CDA Adapter:</span>{" "}
              <span style={{ color: "#0ea5e9" }}>{arch.cdaAdapter}</span>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>HL7 Adapter:</span>{" "}
              <span style={{ color: "#0ea5e9" }}>{arch.hl7Adapter}</span>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>IPM Module:</span>{" "}
              <span style={{ color: "#22c55e" }}>
                {arch.ipmModule}@{arch.ipmVersion}
              </span>
            </div>
          </div>
        </div>
        <div
          style={{
            background: COLORS.glassWhite,
            border: `1px solid ${COLORS.glassBorder}`,
            borderRadius: 12,
            padding: 20,
          }}
        >
          <h3
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#ea580c",
              marginBottom: 12,
            }}
          >
            SMART on FHIR Config
          </h3>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "#94a3b8",
              lineHeight: 2,
            }}
          >
            <div>
              <span style={{ color: "#64748b" }}>Auth:</span>{" "}
              <span style={{ color: "#7fb3f5", wordBreak: "break-all" }}>
                {arch.smartOnFhir.authEndpoint}
              </span>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>Token:</span>{" "}
              <span style={{ color: "#7fb3f5", wordBreak: "break-all" }}>
                {arch.smartOnFhir.tokenEndpoint}
              </span>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>Scope:</span>{" "}
              <span style={{ color: "#fff", wordBreak: "break-all" }}>
                {arch.smartOnFhir.scope}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          background: COLORS.glassWhite,
          border: `1px solid ${COLORS.glassBorder}`,
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <h3
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#0ea5e9",
            marginBottom: 12,
          }}
        >
          Production Classes (ObjectScript)
        </h3>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "#94a3b8",
            lineHeight: 2,
          }}
        >
          {arch.productionClasses.map((cls) => (
            <div
              key={cls}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <span style={{ color: "#22c55e" }}>▸</span>
              <span style={{ color: "#fff" }}>{cls}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(43,108,184,0.3)",
          borderRadius: 12,
          padding: 20,
        }}
      >
        <h3
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#ea580c",
            marginBottom: 12,
          }}
        >
          Sample: MASTERLINC AI Agent Business Service (ObjectScript)
        </h3>
        <pre
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "#94a3b8",
            margin: 0,
            overflowX: "auto",
            lineHeight: 1.8,
          }}
        >
{`/// BrainSAIT MASTERLINC — AI Agent Orchestrator
/// OID: 1.3.6.1.4.1.61026
Class BrainSAIT.Production.MASTERLINC Extends Ens.BusinessService
{

Parameter ADAPTER = "EnsLib.HTTP.InboundAdapter";

Method OnProcessInput(pInput As %RegisteredObject,
  Output pOutput As %RegisteredObject) As %Status
{
    Set tSC = $$$OK

    // Parse FHIR Task (inter-agent message envelope)
    Set tTask = ##class(HS.FHIR.DTL.vR4.Model.Resource.Task).%New()
    Set tSC = tTask.%JSONImport(pInput.Content)
    If $$$ISERR(tSC) Quit tSC

    // Route to specialist LINC agent based on Task.code
    Set tAgentCode = tTask.code.coding.GetAt(1).code

    If tAgentCode = "claim-processing" {
        Set tSC = ..SendRequestSync("ClaimLinc", tTask, .tResponse)
    } ElseIf tAgentCode = "clinical-decision" {
        Set tSC = ..SendRequestSync("ClinicalLinc", tTask, .tResponse)
    } ElseIf tAgentCode = "compliance-audit" {
        Set tSC = ..SendRequestSync("ComplianceLinc", tTask, .tResponse)
    } ElseIf tAgentCode = "document-generation" {
        Set tSC = ..SendRequestSync("DocuLinc", tTask, .tResponse)
    } ElseIf tAgentCode = "imaging-analysis" {
        Set tSC = ..SendRequestSync("RadioLinc", tTask, .tResponse)
    }

    // Audit log via ComplianceLinc
    Do ##class(BrainSAIT.Audit.HIPAA).LogAgentCall(tAgentCode, $Username)

    Set pOutput = tResponse
    Quit tSC
}

}`}
        </pre>
      </div>
    </div>
  );
}
