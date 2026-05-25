/// BrainSAIT MASTERLINC — AI Agent Orchestrator
/// OID: 1.3.6.1.4.1.61026
/// Routes FHIR Task envelopes to specialist LINC Business Services
Class BrainSAIT.Production.MASTERLINC Extends Ens.BusinessService
{

Parameter ADAPTER = "EnsLib.HTTP.InboundAdapter";

Parameter SETTINGS = "TargetConfigNames:Routing";

Property TargetConfigNames As %String(MAXLEN = 1000) [ InitialExpression = "ClaimLinc,ClinicalLinc,ComplianceLinc,DocuLinc,RadioLinc,HealthcareLinc,TTLinc,ContextLinc" ];

Method OnProcessInput(pInput As %RegisteredObject, Output pOutput As %RegisteredObject) As %Status
{
    Set tSC = $$$OK
    Set tTask = ##class(HS.FHIR.DTL.vR4.Model.Resource.Task).%New()
    Set tSC = tTask.%JSONImport(pInput.Content)
    If $$$ISERR(tSC) Quit tSC
    
    Set tAgentCode = tTask.code.coding.GetAt(1).code
    Set tFocusRef = tTask.focus.reference
    
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
    } ElseIf tAgentCode = "patient-management" {
        Set tSC = ..SendRequestSync("HealthcareLinc", tTask, .tResponse)
    } ElseIf tAgentCode = "translation" {
        Set tSC = ..SendRequestSync("TTLinc", tTask, .tResponse)
    } ElseIf tAgentCode = "context-retrieval" {
        Set tSC = ..SendRequestSync("ContextLinc", tTask, .tResponse)
    } Else {
        Set tSC = ..SendRequestSync("ClaimLinc", tTask, .tResponse)
    }
    
    Do ##class(BrainSAIT.Audit.HIPAA).LogAgentCall(tAgentCode, $Username, tFocusRef)
    
    Set pOutput = tResponse
    Quit tSC
}

}
