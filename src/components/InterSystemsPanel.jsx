import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function InterSystemsPanel({ arch }) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">
          InterSystems IRIS Production Architecture
        </h2>
        <p className="text-xs text-gray-500">
          Map BrainSAIT LINC agents to IRIS Production classes for AI Agents for
          FHIR pattern.
        </p>
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <Card className="border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <h3 className="mb-3 text-sm font-semibold text-cyan-400">
            IRIS Namespace &amp; FHIR Server
          </h3>
          <div className="space-y-1.5 font-mono text-[11px] text-gray-400">
            <p><span className="text-gray-500">Namespace:</span> <span className="text-white">{arch.namespace}</span></p>
            <p><span className="text-gray-500">FHIR Server:</span> <span className="text-cyan-400">{arch.fhirServer}</span></p>
            <p><span className="text-gray-500">OAuth2 Server:</span> <span className="text-cyan-400">{arch.oauthServer}</span></p>
            <p><span className="text-gray-500">CDA Adapter:</span> <span className="text-cyan-400">{arch.cdaAdapter}</span></p>
            <p><span className="text-gray-500">HL7 Adapter:</span> <span className="text-cyan-400">{arch.hl7Adapter}</span></p>
            <p>
              <span className="text-gray-500">IPM Module:</span>{" "}
              <span className="text-green-400">{arch.ipmModule}@{arch.ipmVersion}</span>
            </p>
          </div>
        </Card>

        <Card className="border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <h3 className="mb-3 text-sm font-semibold text-orange-400">
            SMART on FHIR Config
          </h3>
          <div className="space-y-1.5 font-mono text-[11px] text-gray-400">
            <p><span className="text-gray-500">Auth:</span> <span className="break-all text-blue-300">{arch.smartOnFhir.authEndpoint}</span></p>
            <p><span className="text-gray-500">Token:</span> <span className="break-all text-blue-300">{arch.smartOnFhir.tokenEndpoint}</span></p>
            <p><span className="text-gray-500">Scope:</span> <span className="break-all text-white">{arch.smartOnFhir.scope}</span></p>
          </div>
        </Card>
      </div>

      <Card className="mb-4 border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <h3 className="mb-3 text-sm font-semibold text-cyan-400">
          Production Classes (ObjectScript)
        </h3>
        <div className="space-y-1 font-mono text-[11px] text-gray-400">
          {arch.productionClasses.map((cls) => (
            <p key={cls} className="flex items-center gap-2">
              <span className="text-green-500">▸</span>
              <span className="text-white">{cls}</span>
            </p>
          ))}
        </div>
      </Card>

      <Card className="border-blue-900/30 bg-black/40 p-5">
        <h3 className="mb-3 text-sm font-semibold text-orange-400">
          Sample: MASTERLINC AI Agent Business Service (ObjectScript)
        </h3>
        <Separator className="mb-4 bg-blue-900/20" />
        <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed text-gray-400">
{`/// BrainSAIT MASTERLINC — AI Agent Orchestrator
/// OID: 1.3.6.1.4.1.61026
Class BrainSAIT.Production.MASTERLINC Extends Ens.BusinessService
{
Parameter ADAPTER = "EnsLib.HTTP.InboundAdapter";

Method OnProcessInput(pInput, Output pOutput) As %Status
{
    Set tSC = $$$OK
    Set tTask = ##class(HS.FHIR.DTL.vR4.Model.Resource.Task).%New()
    Set tSC = tTask.%JSONImport(pInput.Content)
    If $$$ISERR(tSC) Quit tSC

    Set tAgentCode = tTask.code.coding.GetAt(1).code

    If tAgentCode = "claim-processing" {
        Set tSC = ..SendRequestSync("ClaimLinc", tTask, .tResponse)
    } ElseIf tAgentCode = "clinical-decision" {
        Set tSC = ..SendRequestSync("ClinicalLinc", tTask, .tResponse)
    }

    Do ##class(BrainSAIT.Audit.HIPAA).LogAgentCall(tAgentCode, $Username)
    Set pOutput = tResponse
    Quit tSC
}
}`}
        </pre>
      </Card>
    </div>
  );
}
