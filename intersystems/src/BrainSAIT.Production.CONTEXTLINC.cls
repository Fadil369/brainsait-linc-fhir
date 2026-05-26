/// BrainSAIT CONTEXTLINC — RAG Document Context & OCR Pipeline
/// Clinical note ingestion, FHIR DocumentReference management, OCR processing
Class BrainSAIT.Production.CONTEXTLINC Extends Ens.BusinessService
{

Parameter ADAPTER = "EnsLib.File.InboundAdapter";

Parameter SETTINGS = "ArchivePath,FileSpec";

Property ArchivePath As %String(MAXLEN = 256) [ InitialExpression = "/data/brainsait/archive/" ];

Property FileSpec As %String(MAXLEN = 256) [ InitialExpression = "*.pdf;*.txt;*.xml" ];

Method OnProcessInput(pInput As %Stream.Object, Output pOutput As %RegisteredObject) As %Status
{
    Set tSC = $$$OK
    
    Set tFileName = pInput.Attributes("Filename")
    Set tContent = ##class(%GlobalBinaryStream).%New()
    Do tContent.CopyFrom(pInput)
    
    Set tOcrReq = ##class(EnsLib.HTTP.GenericMessage).%New()
    Set tOcrReq.HTTPMethod = "POST"
    Set tOcrReq.URL = "https://ocr.brainsait.io/v1/process"
    Set tOcrReq.Content = tContent
    Do tOcrReq.Headers.SetAt("application/octet-stream", "Content-Type")
    
    Set tSC = ..SendRequestSync("OCR.Outbound", tOcrReq, .tOcrResp)
    If $$$ISERR(tSC) Quit tSC
    
    Set tDocRef = ##class(HS.FHIR.DTL.vR4.Model.Resource.DocumentReference).%New()
    Set tSC = tDocRef.%JSONImport(tOcrResp.Content)
    
    Set tHttpReq = ##class(EnsLib.HTTP.GenericMessage).%New()
    Set tHttpReq.HTTPMethod = "PUT"
    Set tHttpReq.URL = "https://api.brainsait.io/kv/context/" _ tFileName
    Set tHttpReq.Content = tOcrResp.Content
    Set tSC = ..SendRequestSync("KV.Outbound", tHttpReq, .tKvResp)
    
    Do ##class(BrainSAIT.Audit.Document).LogIngestion(tFileName, $Length(tContent))
    
    Set pOutput = tDocRef
    Quit tSC
}

}
