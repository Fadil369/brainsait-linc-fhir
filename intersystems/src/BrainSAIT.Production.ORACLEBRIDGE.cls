/// BrainSAIT ORACLEBRIDGE — Legacy Hospital EHR Bridge
/// Connects to Oracle DB / legacy hospital EHR systems via JDBC
Class BrainSAIT.Production.ORACLEBRIDGE Extends Ens.BusinessService
{

Parameter ADAPTER = "EnsLib.HTTP.InboundAdapter";

Method OnProcessInput(pInput As HS.FHIR.DTL.vR4.Model.Resource.Parameters, Output pOutput As %RegisteredObject) As %Status
{
    Set tSC = $$$OK
    
    Set tQuery = pInput.parameter.GetAt(1).valueString
    Set tParams = pInput.parameter.GetAt(2).valueString
    
    Set tSC = ..SendRequestSync("Oracle.SQL.Outbound", pInput, .tSqlResp)
    If $$$ISERR(tSC) Quit tSC
    
    Set tResponse = ##class(HS.FHIR.DTL.vR4.Model.Resource.Bundle).%New()
    Set tSC = tResponse.%JSONImport(tSqlResp.Content)
    
    Do ##class(BrainSAIT.Audit.Bridge).LogQuery(tQuery, tResponse.total)
    
    Set pOutput = tResponse
    Quit tSC
}

}
