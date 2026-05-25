/// BrainSAIT Audit — HIPAA Compliance Logger
/// Central audit trail for all LINC agent operations
Class BrainSAIT.Audit.HIPAA Extends %RegisteredObject
{

ClassMethod LogAgentCall(pAgentCode As %String, pUsername As %String, pFocusRef As %String = "") As %Status
{
    Set tSC = $$$OK
    Set tNow = $ZDT($ZTS, 3, 1)
    
    Set tAudit = ##class(HS.FHIR.DTL.vR4.Model.Resource.AuditEvent).%New()
    Set tAudit.type = ##class(HS.FHIR.DTL.vR4.Datatype.Coding).%New()
    Set tAudit.type.code = "110114"
    Set tAudit.type.display = "Application Activity"
    Set tAudit.action = "E"
    Set tAudit.recorded = tNow
    Set tAudit.outcome = "0"
    
    Do tAudit.entity.GetAt(1).what.referenceSet(pFocusRef)
    Do tAudit.agent.GetAt(1).who.identifier.valueSet(pUsername)
    
    Set tAudit.source.observer.display = "BrainSAIT MASTERLINC"
    Set tAudit.source.type.GetAt(1).code = "4"
    
    Quit tSC
}

}
