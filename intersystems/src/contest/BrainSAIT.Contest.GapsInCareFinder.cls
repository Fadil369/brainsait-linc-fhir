/// BrainSAIT Contest — Gaps-in-Care Finder
Class BrainSAIT.Contest.GapsInCareFinder Extends Ens.BusinessService
{

Parameter ADAPTER = "EnsLib.HTTP.InboundAdapter";

Method OnProcessInput(pInput As HS.FHIR.DTL.vR4.Model.Resource.Parameters, Output pOutput As %RegisteredObject) As %Status
{
    Set tSC = $$$OK
    Set tPatientRef = pInput.parameter.GetAt(1).valueString
    
    Set tHttpReq = ##class(EnsLib.HTTP.GenericMessage).%New()
    Set tHttpReq.HTTPMethod = "GET"
    Set tHttpReq.URL = "https://brainsait.io/api/contest/gaps-in-care?patient=" _ tPatientRef
    Set tSC = ..SendRequestSync("Contest.AI.Outbound", tHttpReq, .tResp)
    
    Set tBundle = ##class(HS.FHIR.DTL.vR4.Model.Resource.Bundle).%New()
    Set tSC = tBundle.%JSONImport(tResp.Content)
    Set pOutput = tBundle
    Quit tSC
}

}
