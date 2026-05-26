import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SEVERITY_COLORS = {
  error: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", icon: "🔴" },
  warning: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", icon: "🟡" },
  info: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", icon: "🔵" },
};

export default function FhirLintPanel() {
  const [input, setInput] = useState(`{
  "resourceType": "Patient",
  "id": "example-1",
  "active": true,
  "name": [{
    "use": "official",
    "family": "Al-Fadil",
    "given": ["Mohammed"]
  }],
  "gender": "male",
  "birthDate": "1990-01-15"
}`);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("single"); // single | batch
  const [rules, setRules] = useState(null);

  const API = "https://brainsait-linc-fhir-unified.brainsait-fadil.workers.dev";

  const validate = useCallback(async () => {
    setLoading(true);
    setResult(null);
    try {
      const body = mode === "single"
        ? JSON.parse(input)
        : { resources: JSON.parse(input) };

      const endpoint = mode === "single" ? "/fhir/validate" : "/fhir/validate/batch";
      const resp = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  }, [input, mode]);

  const loadRules = useCallback(async () => {
    try {
      const resp = await fetch(`${API}/fhir/lint/rules`);
      const data = await resp.json();
      setRules(data);
    } catch { /* ignore */ }
  }, []);

  return (
    <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            ✅ FHIR Lint Validator
            <Badge className="bg-emerald-500/20 text-emerald-400 text-xs border-emerald-500/30">
              fhirlint v1.1.0
            </Badge>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Validate FHIR R4 resources — 28 rules, NPHIES-aware
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode("single")}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              mode === "single" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-slate-400 border border-white/10"
            }`}
          >
            Single
          </button>
          <button
            onClick={() => setMode("batch")}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              mode === "batch" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-slate-400 border border-white/10"
            }`}
          >
            Batch
          </button>
          <button
            onClick={loadRules}
            className="px-3 py-1 text-xs rounded-full bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 transition-colors"
          >
            📋 Rules
          </button>
        </div>
      </div>

      {/* Input area */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full h-48 bg-black/40 border border-white/10 rounded-lg p-3 text-sm font-mono text-emerald-300 placeholder-slate-600 resize-none focus:outline-none focus:border-emerald-500/50"
        placeholder={mode === "single"
          ? "Paste a FHIR resource JSON..."
          : "Paste an array of FHIR resources: [{...}, {...}]"
        }
        spellCheck="false"
      />

      {/* Quick-load examples */}
      <div className="flex gap-2 mt-2 flex-wrap">
        {[
          { label: "Patient", json: '{"resourceType":"Patient","id":"p1","name":[{"family":"Al-Fadil","given":["Dr.Mohammed"]}],"gender":"male","birthDate":"1990-01-15"}' },
          { label: "Observation", json: '{"resourceType":"Observation","id":"obs1","status":"final","code":{"coding":[{"system":"http://loinc.org","code":"15074-8","display":"Glucose"}]},"subject":{"reference":"Patient/p1"},"valueQuantity":{"value":6.3,"unit":"mmol/L"}}' },
          { label: "Claim", json: '{"resourceType":"Claim","id":"clm1","status":"active","type":{"coding":[{"system":"http://hl7.org/fhir/claim-type","code":"institutional"}]},"patient":{"reference":"Patient/p1"},"insurer":{"reference":"Organization/nphies"}}' },
          { label: "Invalid (test)", json: '{"resourceType":"Observation","id":"bad1"}' },
        ].map((ex) => (
          <button
            key={ex.label}
            onClick={() => setInput(JSON.stringify(JSON.parse(ex.json), null, 2))}
            className="px-2 py-0.5 text-xs rounded bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Validate button */}
      <button
        onClick={validate}
        disabled={loading}
        className="mt-3 w-full py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium text-sm hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
      >
        {loading ? "⏳ Validating..." : "🚀 Validate"}
      </button>

      {/* Results */}
      {result && !result.error && (
        <div className="mt-4 space-y-3">
          {/* Summary bar */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-white/10">
            <span className={`text-2xl font-bold ${result.valid ? "text-emerald-400" : "text-red-400"}`}>
              {result.valid ? "✅ VALID" : "❌ INVALID"}
            </span>
            <div className="flex gap-3 ml-auto text-xs">
              {result.summary && (
                <>
                  <span className="text-red-400">🔴 {result.summary.errors ?? 0} errors</span>
                  <span className="text-yellow-400">🟡 {result.summary.warnings ?? 0} warnings</span>
                  <span className="text-blue-400">🔵 {result.summary.info ?? 0} info</span>
                </>
              )}
            </div>
          </div>

          {/* Resource type badge */}
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-500/20 text-purple-300 text-xs border-purple-500/30">
              {result.resourceType || "Batch"}
            </Badge>
            {result.resourceId && (
              <span className="text-xs text-slate-500 font-mono">ID: {result.resourceId}</span>
            )}
            <span className="text-xs text-slate-600 ml-auto">
              {result.validator}
            </span>
          </div>

          {/* Issue list */}
          {result.issues?.map((issue, i) => {
            const sev = SEVERITY_COLORS[issue.severity] || SEVERITY_COLORS.info;
            return (
              <div key={i} className={`flex items-start gap-2 p-2 rounded border ${sev.bg} ${sev.border}`}>
                <span className="text-sm">{sev.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-bold ${sev.text}`}>{issue.ruleId}</span>
                    <span className="text-xs text-slate-500">{issue.path}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">{issue.message}</p>
                </div>
              </div>
            );
          })}

          {/* Batch results */}
          {result.results?.map((r, i) => (
            <div key={i} className="border border-white/10 rounded-lg p-3 bg-black/20">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-bold ${r.valid ? "text-emerald-400" : "text-red-400"}`}>
                  {r.valid ? "✅" : "❌"} {r.resourceType}/{r.resourceId}
                </span>
                <span className="text-xs text-slate-500">{r.errorCount}E / {r.warningCount}W</span>
              </div>
              {r.issues?.slice(0, 3).map((issue, j) => {
                const sev = SEVERITY_COLORS[issue.severity] || SEVERITY_COLORS.info;
                return (
                  <div key={j} className="text-xs text-slate-400 ml-4 mb-1">
                    {sev.icon} <span className={`font-mono ${sev.text}`}>{issue.ruleId}</span>: {issue.message}
                  </div>
                );
              })}
              {r.issues?.length > 3 && (
                <div className="text-xs text-slate-600 ml-4">+{r.issues.length - 3} more</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rules display */}
      {rules && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white">📋 Validation Rules ({rules.total})</span>
            <div className="flex gap-2 text-xs">
              <span className="text-red-400">{rules.bySeverity.error} errors</span>
              <span className="text-yellow-400">{rules.bySeverity.warning} warnings</span>
              <span className="text-blue-400">{rules.bySeverity.info} info</span>
            </div>
          </div>
          {rules.rules.map((rule) => {
            const sev = SEVERITY_COLORS[rule.severity] || SEVERITY_COLORS.info;
            return (
              <div key={rule.id} className="flex items-start gap-2 p-2 rounded bg-black/20 border border-white/5">
                <span className="text-xs">{sev.icon}</span>
                <div>
                  <span className={`text-xs font-mono font-bold ${sev.text}`}>{rule.id}</span>
                  <p className="text-xs text-slate-400">{rule.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Error */}
      {result?.error && (
        <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          ❌ {result.error}
        </div>
      )}
    </Card>
  );
}
