/// BrainSAIT Audit — NPHIES Claim Logger
Class BrainSAIT.Audit.NPHIES Extends %RegisteredObject
{

ClassMethod LogClaim(pNphiesId As %String, pPatientRef As %String, pTotal As %Numeric, pStatus As %String) As %Status
{
    Set tSC = $$$OK
    Set tNow = $ZDT($ZTS, 3, 1)
    Set tSqlStmt = "INSERT INTO BrainSAIT_Audit.NPHIESClaims " _
        "(NphiesId, PatientRef, Total, Status, Recorded) VALUES (?, ?, ?, ?, ?)"
    Quit tSC
}

}
