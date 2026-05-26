/// BrainSAIT CLINICALLINC — Clinical Decision Support
/// CDS Hooks v2, care plan generation, drug interaction checks
Class BrainSAIT.Production.CLINICALLINC Extends Ens.BusinessService
{

Parameter ADAPTER = "EnsLib.HTTP.InboundAdapter";

Method OnProcessInput(pInput As HS.FHIR.DTL.vR4.Model.Resource.MedicationRequest, Output pOutput As %RegisteredObject) As %Status
{
    Set tSC = $$$OK
    
    Set tMedication = pInput.medicationCodeableConcept.coding.GetAt(1).code
    Set tPatientRef = pInput.subject.reference
    
    Set tCdsReq = ##class(EnsLib.HTTP.GenericMessage).%New()
    Set tCdsReq.Content = pInput.%JSONExportToString()
    Set tCdsReq.URL = "https://cds.brainsait.io/v2/cds-services/drug-interaction-check"
    Set tCdsReq.HTTPMethod = "POST"
    
    Set tSC = ..SendRequestSync("CDS.Hooks.Outbound", tCdsReq, .tCdsResp)
    If $$$ISERR(tSC) Quit tSC
    
    Set tResponse = ##class(HS.FHIR.DTL.vR4.Model.Resource.CarePlan).%New()
    Set tSC = tResponse.%JSONImport(tCdsResp.Content)
    
    Do ##class(BrainSAIT.Audit.Clinical).LogDecision(tMedication, tPatientRef, tResponse.status)
    
    Set pOutput = tResponse
    Quit tSC
}

}
