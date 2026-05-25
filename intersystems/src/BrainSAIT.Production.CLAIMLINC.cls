/// BrainSAIT CLAIMLINC — NPHIES Claims Processing
/// Handles claim submission, eligibility verification, batch processing
Class BrainSAIT.Production.CLAIMLINC Extends Ens.BusinessService
{

Parameter ADAPTER = "EnsLib.HTTP.InboundAdapter";

Method OnProcessInput(pInput As HS.FHIR.DTL.vR4.Model.Resource.Claim, Output pOutput As %RegisteredObject) As %Status
{
    Set tSC = $$$OK
    
    Set tNphiesId = pInput.identifier.GetAt(1).value
    Set tPatientRef = pInput.patient.reference
    Set tTotal = pInput.total.value
    
    Set tHttpReq = ##class(EnsLib.HTTP.GenericMessage).%New()
    Set tHttpReq.HTTPMethod = "POST"
    Set tHttpReq.URL = "https://nphies.sa/gateway/v1/claims"
    Set tHttpReq.Content = pInput.%JSONExportToString()
    
    Set tSC = ..SendRequestSync("NPHIES.Gateway.Outbound", tHttpReq, .tHttpResp)
    If $$$ISERR(tSC) Quit tSC
    
    Set tResponse = ##class(HS.FHIR.DTL.vR4.Model.Resource.ClaimResponse).%New()
    Set tSC = tResponse.%JSONImport(tHttpResp.Content)
    
    Do ##class(BrainSAIT.Audit.NPHIES).LogClaim(tNphiesId, tPatientRef, tTotal, tResponse.status)
    
    Set pOutput = tResponse
    Quit tSC
}

}
