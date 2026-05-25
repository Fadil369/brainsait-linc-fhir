/// BrainSAIT Contest — Smart Patient Summary Generator
/// Generates role-tailored FHIR patient summaries (doctor, care manager, patient)
Class BrainSAIT.Contest.SummaryGenerator Extends Ens.BusinessService
{

Parameter ADAPTER = "EnsLib.HTTP.InboundAdapter";

Method OnProcessInput(pInput As HS.FHIR.DTL.vR4.Model.Resource.Parameters, Output pOutput As %RegisteredObject) As %Status
{
    Set tSC = $$$OK
    Set tPatientRef = pInput.parameter.GetAt(1).valueString
    Set tRole = pInput.parameter.GetAt(2).valueString
    If tRole = "" Set tRole = "doctor"
    
    Set tHttpReq = ##class(EnsLib.HTTP.GenericMessage).%New()
    Set tHttpReq.HTTPMethod = "GET"
    Set tHttpReq.URL = "https://brainsait.io/api/contest/summary?patient=" _ tPatientRef _ "&role=" _ tRole
    Set tSC = ..SendRequestSync("Contest.AI.Outbound", tHttpReq, .tResp)
    
    Set tDocRef = ##class(HS.FHIR.DTL.vR4.Model.Resource.DocumentReference).%New()
    Set tSC = tDocRef.%JSONImport(tResp.Content)
    Set pOutput = tDocRef
    Quit tSC
}

}
