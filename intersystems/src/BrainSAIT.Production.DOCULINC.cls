/// BrainSAIT DOCULINC — Clinical Documentation AI
/// ICD-10 coding assistance, note optimization, clinical composition generation
Class BrainSAIT.Production.DOCULINC Extends Ens.BusinessService
{

Parameter ADAPTER = "EnsLib.HTTP.InboundAdapter";

Method OnProcessInput(pInput As HS.FHIR.DTL.vR4.Model.Resource.Composition, Output pOutput As %RegisteredObject) As %Status
{
    Set tSC = $$$OK
    
    Set tDocType = pInput.type.coding.GetAt(1).code
    Set tPatientRef = pInput.subject.reference
    
    Set tLlmReq = ##class(EnsLib.HTTP.GenericMessage).%New()
    Set tLlmReq.HTTPMethod = "POST"
    Set tLlmReq.URL = "https://ai.brainsait.io/v1/generate"
    Set tLlmReq.Content = pInput.%JSONExportToString()
    
    Set tSC = ..SendRequestSync("LLM.Outbound", tLlmReq, .tLlmResp)
    If $$$ISERR(tSC) Quit tSC
    
    Set tReport = ##class(HS.FHIR.DTL.vR4.Model.Resource.DiagnosticReport).%New()
    Set tSC = tReport.%JSONImport(tLlmResp.Content)
    
    Do ##class(BrainSAIT.Audit.Documentation).LogGeneration(tDocType, tPatientRef)
    
    Set pOutput = tReport
    Quit tSC
}

}
