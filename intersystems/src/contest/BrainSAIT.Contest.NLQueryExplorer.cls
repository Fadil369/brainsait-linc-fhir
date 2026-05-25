/// BrainSAIT Contest — Natural Language to FHIR Query Explorer
Class BrainSAIT.Contest.NLQueryExplorer Extends Ens.BusinessService
{

Parameter ADAPTER = "EnsLib.HTTP.InboundAdapter";

Method OnProcessInput(pInput As HS.FHIR.DTL.vR4.Model.Resource.Parameters, Output pOutput As %RegisteredObject) As %Status
{
    Set tSC = $$$OK
    Set tQuestion = pInput.parameter.GetAt(1).valueString
    
    Set tHttpReq = ##class(EnsLib.HTTP.GenericMessage).%New()
    Set tHttpReq.HTTPMethod = "GET"
    Set tHttpReq.URL = "https://brainsait.io/api/contest/nl-query?q=" _ $ZConvert(tQuestion, "URL")
    Set tSC = ..SendRequestSync("Contest.AI.Outbound", tHttpReq, .tResp)
    
    Set tParams = ##class(HS.FHIR.DTL.vR4.Model.Resource.Parameters).%New()
    Set tSC = tParams.%JSONImport(tResp.Content)
    Set pOutput = tParams
    Quit tSC
}

}
