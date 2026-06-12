CREATE TABLE IF NOT EXISTS fhir_resources (
  id TEXT PRIMARY KEY,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  patient_id TEXT,
  data TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_fhir_type ON fhir_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_fhir_type_id ON fhir_resources(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_fhir_patient ON fhir_resources(patient_id);
CREATE INDEX IF NOT EXISTS idx_fhir_type_patient ON fhir_resources(resource_type, patient_id);

CREATE TABLE IF NOT EXISTS agent_decisions (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  decision_text TEXT,
  confidence REAL,
  reasoning_steps TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_agent_decisions_patient ON agent_decisions(agent_id, patient_id);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  timestamp TEXT DEFAULT (datetime('now')),
  user_id TEXT,
  action TEXT,
  resource_type TEXT,
  resource_id TEXT,
  status TEXT,
  details TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
