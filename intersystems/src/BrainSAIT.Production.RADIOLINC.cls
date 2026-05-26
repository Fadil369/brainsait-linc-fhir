/// BrainSAIT RADIOLINC — DICOM & Lab Result Processing
/// Integrates with PACS/VNA and laboratory information systems
Class BrainSAIT.Production.RADIOLINC Extends Ens.BusinessService
{

Parameter ADAPTER = "EnsLib.HTTP.InboundAdapter";

Method OnProcessInput(pInput As HS.FHIR.DTL.vR4.Model.Resource.ImagingStudy, Output pOutput As %RegisteredObject) As %Status
{
    Set tSC = $$$OK
    
    Set tStudyUid = pInput.identifier.GetAt(1).value
    Set tModality = pInput.modality.GetAt(1).code
    
    Set tDicomReq = ##class(EnsLib.HTTP.GenericMessage).%New()
    Set tDicomReq.HTTPMethod = "POST"
    Set tDicomReq.URL = "https://dicom.brainsait.io/v1/analyze"
    Set tDicomReq.Content = pInput.%JSONExportToString()
    
    Set tSC = ..SendRequestSync("DICOM.Analysis.Outbound", tDicomReq, .tDicomResp)
    If $$$ISERR(tSC) Quit tSC
    
    Set tReport = ##class(HS.FHIR.DTL.vR4.Model.Resource.DiagnosticReport).%New()
    Set tSC = tReport.%JSONImport(tDicomResp.Content)
    
    Do ##class(BrainSAIT.Audit.Radiology).LogStudy(tStudyUid, tModality, tReport.status)
    
    Set pOutput = tReport
    Quit tSC
}

}
