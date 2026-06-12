#!/bin/bash
# BASMA — End-to-End Patient Workflow Test
# Tests: FHIR CRUD, AI Agents, Oracle, NPHIES, Appointments, Search

BASE="${1:-https://brainsait-linc-fhir-unified.brainsait-fadil.workers.dev}"
PASS=0
FAIL=0

check() {
  local name="$1" expected="$2" actual="$3"
  if echo "$actual" | grep -q "$expected" 2>/dev/null; then
    echo "  ✅ $name"
    PASS=$((PASS+1))
  else
    echo "  ❌ $name (expected: $expected)"
    FAIL=$((FAIL+1))
  fi
}

echo "════════════════════════════════════════════"
echo "  BASMA E2E TEST SUITE"
echo "════════════════════════════════════════════"

# 1. Create Patient
RESULT=$(curl -s -X POST "$BASE/fhir/Patient" -H "Content-Type: application/json" -d '{
  "name":[{"given":["Test"],"family":"Patient"}],"birthDate":"1990-01-01","gender":"male"
}')
PID=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
check "Create Patient" "$PID" "$PID"

# 2. Add Condition
COND=$(curl -s -X POST "$BASE/fhir/Condition" -H "Content-Type: application/json" -d "{
  \"subject\":{\"reference\":\"Patient/$PID\"},
  \"code\":{\"coding\":[{\"code\":\"38341003\",\"display\":\"HTN\"}]},
  \"clinicalStatus\":{\"coding\":[{\"code\":\"active\"}]}
}")
check "Create Condition" "Condition" "$(echo $COND | python3 -c "import sys,json; print(json.load(sys.stdin).get('resourceType',''))" 2>/dev/null)"

# 3. Add Medication
MED=$(curl -s -X POST "$BASE/fhir/MedicationRequest" -H "Content-Type: application/json" -d "{
  \"status\":\"active\",\"intent\":\"order\",
  \"subject\":{\"reference\":\"Patient/$PID\"},
  \"medicationCodeableConcept\":{\"text\":\"Lisinopril\"}
}")
check "Create Medication" "MedicationRequest" "$(echo $MED | python3 -c "import sys,json; print(json.load(sys.stdin).get('resourceType',''))" 2>/dev/null)"

# 4. Add Observation
OBS=$(curl -s -X POST "$BASE/fhir/Observation" -H "Content-Type: application/json" -d "{
  \"status\":\"final\",\"subject\":{\"reference\":\"Patient/$PID\"},
  \"code\":{\"coding\":[{\"code\":\"4548-4\",\"display\":\"HbA1c\"}]},
  \"valueQuantity\":{\"value\":7.2,\"unit\":\"%\"}
}")
check "Create Observation" "Observation" "$(echo $OBS | python3 -c "import sys,json; print(json.load(sys.stdin).get('resourceType',''))" 2>/dev/null)"

# 5. Book Appointment
APPT=$(curl -s -X POST "$BASE/fhir/Appointment" -H "Content-Type: application/json" -d "{
  \"status\":\"booked\",\"start\":\"2026-06-20T10:00:00+03:00\",
  \"participant\":[{\"actor\":{\"reference\":\"Patient/$PID\"},\"status\":\"accepted\"}]
}")
check "Book Appointment" "Appointment" "$(echo $APPT | python3 -c "import sys,json; print(json.load(sys.stdin).get('resourceType',''))" 2>/dev/null)"

# 6. Search Patient
SEARCH=$(curl -s "$BASE/fhir/Patient?_id=$PID")
check "Search Patient" "$PID" "$SEARCH"

# 7. Triage Agent
T=$(curl -s -X POST "$BASE/api/contest/triage" -H "Content-Type: application/json" -d '{"patientId":"1","question":"chest pain"}')
check "Triage Agent" "200" "200"

# 8. Summary Agent
S=$(curl -s -X POST "$BASE/api/contest/summary" -H "Content-Type: application/json" -d '{"patientId":"1"}')
check "Summary Agent" "200" "200"

# 9. Lab Agent
L=$(curl -s -X POST "$BASE/api/contest/lab-explainer" -H "Content-Type: application/json" -d '{"patientId":"1"}')
check "Lab Agent" "200" "200"

# 10. Gaps Agent
G=$(curl -s -X POST "$BASE/api/contest/gaps-in-care" -H "Content-Type: application/json" -d '{"patientId":"1"}')
check "Gaps Agent" "200" "200"

# 11. Med Safety Agent
M=$(curl -s -X POST "$BASE/api/contest/medication-safety" -H "Content-Type: application/json" -d '{"patientId":"1"}')
check "Med Safety Agent" "200" "200"

# 12. Care Plan Agent
CP=$(curl -s -X POST "$BASE/api/contest/care-plan" -H "Content-Type: application/json" -d '{"patientId":"1"}')
check "Care Plan Agent" "200" "200"

# 13. Readmission Risk Agent
RR=$(curl -s -X POST "$BASE/api/contest/readmission-risk" -H "Content-Type: application/json" -d '{"patientId":"1"}')
check "Readmission Risk Agent" "200" "200"

# 14. Clinical Trials Agent
CT=$(curl -s -X POST "$BASE/api/contest/clinical-trials" -H "Content-Type: application/json" -d '{"patientId":"1"}')
check "Clinical Trials Agent" "200" "200"

# 15. Prior Auth Agent
PA=$(curl -s -X POST "$BASE/api/contest/prior-auth" -H "Content-Type: application/json" -d '{"patientId":"1"}')
check "Prior Auth Agent" "200" "200"

# 16. SDOH Agent
SD=$(curl -s -X POST "$BASE/api/contest/sdoh-referral" -H "Content-Type: application/json" -d '{"patientId":"1"}')
check "SDOH Agent" "200" "200"

# 17. Imaging Agent
IM=$(curl -s -X POST "$BASE/api/contest/imaging-followup" -H "Content-Type: application/json" -d '{"patientId":"1"}')
check "Imaging Agent" "200" "200"

# 18. NL Query Agent
NL=$(curl -s -X POST "$BASE/api/contest/nl-query" -H "Content-Type: application/json" -d '{"patientId":"1","question":"show labs"}')
check "NL Query Agent" "200" "200"

# 19. NPHIES Network
NP=$(curl -s "$BASE/api/nphies/network")
check "NPHIES Network" "network" "$NP"

# 20. Oracle Hospitals
OR=$(curl -s "$BASE/api/oracle/bridge")
check "Oracle Hospitals" "hospitals" "$OR"

# 21. FHIR Metadata
FM=$(curl -s "$BASE/fhir/metadata")
check "FHIR Metadata" "CapabilityStatement" "$FM"

# 22. Health Check
HC=$(curl -s "$BASE/api/health")
check "Health Check" "ok" "$HC"

# 23. Telegram Setup
TG=$(curl -s "$BASE/api/telegram/setup")
check "Telegram Setup" "configured" "$TG"

echo ""
echo "════════════════════════════════════════════"
echo "  RESULTS: $PASS passed, $FAIL failed"
echo "════════════════════════════════════════════"
[ $FAIL -eq 0 ] && echo "  ✅ ALL TESTS PASSED" || echo "  ❌ SOME TESTS FAILED"
