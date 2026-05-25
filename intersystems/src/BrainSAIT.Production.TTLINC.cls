/// BrainSAIT TTLINC — Arabic/English Translation & Terminology
/// Bilingual clinical translation, ICD-10 Arabic coding, terminology mapping
Class BrainSAIT.Production.TTLINC Extends Ens.BusinessService
{

Parameter ADAPTER = "EnsLib.HTTP.InboundAdapter";

Method OnProcessInput(pInput As HS.FHIR.DTL.vR4.Model.Resource.Parameters, Output pOutput As %RegisteredObject) As %Status
{
    Set tSC = $$$OK
    
    Set tSourceText = pInput.parameter.GetAt(1).valueString
    Set tSourceLang = pInput.parameter.GetAt(2).valueCode
    Set tTargetLang = pInput.parameter.GetAt(3).valueCode
    
    Set tTransReq = ##class(EnsLib.HTTP.GenericMessage).%New()
    Set tTransReq.HTTPMethod = "POST"
    Set tTransReq.URL = "https://translation.brainsait.io/v1/translate"
    Set tTransReq.Content = pInput.%JSONExportToString()
    
    Set tSC = ..SendRequestSync("Translation.Outbound", tTransReq, .tTransResp)
    If $$$ISERR(tSC) Quit tSC
    
    Set tResponse = ##class(HS.FHIR.DTL.vR4.Model.Resource.Parameters).%New()
    Set tSC = tResponse.%JSONImport(tTransResp.Content)
    
    Do ##class(BrainSAIT.Audit.Translation).Log(tSourceLang, tTargetLang, $Length(tSourceText))
    
    Set pOutput = tResponse
    Quit tSC
}

}
