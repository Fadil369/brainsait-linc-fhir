/// BrainSAIT Validation — NPHIES Saudi National ID Validator
Class BrainSAIT.Validation.NPHIES Extends %RegisteredObject
{

ClassMethod ValidateNationalId(pNationalId As %String) As %Boolean
{
    If $Length(pNationalId) '= 10 Quit 0
    If pNationalId '? 10N Quit 0
    
    Set tFirstChar = $Extract(pNationalId, 1, 1)
    If (tFirstChar '= "1") && (tFirstChar '= "2") Quit 0
    
    Set tSum = 0
    For i = 1:1:10 {
        Set tDigit = +$Extract(pNationalId, i, i)
        If i # 2 = 1 {
            Set tProduct = tDigit * 2
            Set tSum = tSum + (tProduct \ 10) + (tProduct # 10)
        } Else {
            Set tSum = tSum + tDigit
        }
    }
    
    Quit (tSum # 10 = 0)
}

ClassMethod ValidateName(arabic As %String, english As %String) As %Status
{
    Set tSC = $$$OK
    If arabic = "" Set tSC = $$$ERROR($$$GeneralError, "Arabic name required") Quit tSC
    If english = "" Set tSC = $$$ERROR($$$GeneralError, "English name required") Quit tSC
    Quit tSC
}

}
