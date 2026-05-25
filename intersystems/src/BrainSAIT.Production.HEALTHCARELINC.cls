/// BrainSAIT HEALTHCARELINC — Core FHIR R4 Patient Management
/// Patient registration, encounters, appointments, organization management
Class BrainSAIT.Production.HEALTHCARELINC Extends Ens.BusinessService
{

Parameter ADAPTER = "EnsLib.HTTP.InboundAdapter";

Method OnProcessInput(pInput As HS.FHIR.DTL.vR4.Model.Resource.Patient, Output pOutput As %RegisteredObject) As %Status
{
    Set tSC = $$$OK
    
    Set tNationalId = pInput.identifier.GetAt(1).value
    Set tNameArabic = pInput.name.GetAt(1).text
    
    Set tValid = ##class(BrainSAIT.Validation.NPHIES).ValidateNationalId(tNationalId)
    If 'tValid {
        Set tOperationOutcome = ##class(HS.FHIR.DTL.vR4.Model.Resource.OperationOutcome).%New()
        Set tOpIssue = tOperationOutcome.issue.GetAt(1)
        Set tOpIssue.severity = "error"
        Set tOpIssue.code = "invalid"
        Set tOpIssue.diagnostics = "National ID validation failed for: " _ tNationalId
        Set pOutput = tOperationOutcome
        Quit $$$OK
    }
    
    Set tSC = ..SendRequestSync("FHIR.Server.Outbound", pInput, .tFhirResp)
    If $$$ISERR(tSC) Quit tSC
    
    Do ##class(BrainSAIT.Audit.Patient).LogRegistration(tNationalId, tNameArabic)
    
    Set pOutput = tFhirResp
    Quit tSC
}

}
