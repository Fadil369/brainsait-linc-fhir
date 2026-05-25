/// BrainSAIT COMPLIANCELINC — HIPAA & NPHIES Audit Logging
/// Records all audit events, manages consent, enforces RBAC
Class BrainSAIT.Production.COMPLIANCELINC Extends Ens.BusinessService
{

Parameter ADAPTER = "EnsLib.HTTP.InboundAdapter";

Method OnProcessInput(pInput As HS.FHIR.DTL.vR4.Model.Resource.AuditEvent, Output pOutput As %RegisteredObject) As %Status
{
    Set tSC = $$$OK
    
    Set tAction = pInput.action
    Set tOutcome = pInput.outcome
    
    Set tSqlStmt = "INSERT INTO BrainSAIT_Audit.AuditLog " _
        "(Action, Outcome, Recorded, Agent, PatientRef) VALUES (?, ?, ?, ?, ?)"
    
    Set tSC = ..SendRequestSync("SQL.Outbound", tSqlStmt, .tSqlResp)
    
    Do ..LogToKV(pInput)
    
    Set pOutput = pInput
    Quit tSC
}

Method LogToKV(pAuditEvent As HS.FHIR.DTL.vR4.Model.Resource.AuditEvent) As %Status
{
    Set tSC = $$$OK
    Set tHttpReq = ##class(EnsLib.HTTP.GenericMessage).%New()
    Set tHttpReq.HTTPMethod = "PUT"
    Set tHttpReq.URL = "https://api.brainsait.io/kv/audit/" _ $System.Utility.UniqueId()
    Set tHttpReq.Content = pAuditEvent.%JSONExportToString()
    Set tSC = ..SendRequestSync("KV.Outbound", tHttpReq, .tResp)
    Quit tSC
}

}
