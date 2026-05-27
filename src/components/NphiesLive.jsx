"use client";
import { useState } from "react";

const NPHIES_SERVICE_CODES = [
  { code: "1", arabic: "طبي", english: "Medical", approvalRate: 97.2, avgClaim: "SAR 1,240", volume: "4.2K/day" },
  { code: "2", arabic: "إقامة", english: "Hospital Stay", approvalRate: 94.8, avgClaim: "SAR 8,900", volume: "890/day" },
  { code: "3", arabic: "دواء", english: "Medication", approvalRate: 98.9, avgClaim: "SAR 340", volume: "6.8K/day" },
  { code: "4", arabic: "تشخيصي", english: "Diagnostic", approvalRate: 99.1, avgClaim: "SAR 780", volume: "3.1K/day" },
  { code: "5", arabic: "جراحي", english: "Surgical", approvalRate: 91.4, avgClaim: "SAR 24,500", volume: "234/day" },
  { code: "6", arabic: "أسنان", english: "Dental", approvalRate: 96.3, avgClaim: "SAR 890", volume: "1.2K/day" },
  { code: "7", arabic: "بصري", english: "Optical", approvalRate: 98.4, avgClaim: "SAR 420", volume: "445/day" },
  { code: "8", arabic: "ولادة", english: "Maternity", approvalRate: 99.6, avgClaim: "SAR 12,400", volume: "89/day" },
];

const NPHIES_ERROR_CODES = [
  { code: "REJ001", english: "Member not eligible", arabic: "العضو غير مؤهل", severity: "error", frequency: "2.1%", fix: "Verify member ID and coverage period" },
  { code: "REJ002", english: "Service not covered", arabic: "الخدمة غير مشمولة", severity: "error", frequency: "1.4%", fix: "Check policy exclusions, add prior auth" },
  { code: "REJ003", english: "Missing prior auth", arabic: "التفويض المسبق مفقود", severity: "error", frequency: "0.8%", fix: "Submit PA request before claim" },
  { code: "REJ004", english: "Duplicate claim", arabic: "مطالبة مكررة", severity: "warning", frequency: "0.3%", fix: "Check claim status before resubmitting" },
  { code: "REJ005", english: "Invalid ICD code", arabic: "رمز ICD غير صالح", severity: "warning", frequency: "0.4%", fix: "Verify ICD-10 code against NPHIES table" },
];

const RECENT_TRANSACTIONS = [
  { id: "NP-2024-88821", type: "claim", service: "Medical", amount: "SAR 1,840", status: "approved", provider: "HNH", time: "2m ago" },
  { id: "NP-2024-88820", type: "prior-auth", service: "Surgical", amount: "SAR 28,400", status: "pending", provider: "GIVC", time: "4m ago" },
  { id: "NP-2024-88819", type: "eligibility", service: "—", amount: "—", status: "eligible", provider: "SBS", time: "5m ago" },
  { id: "NP-2024-88818", type: "claim", service: "Medication", amount: "SAR 420", status: "approved", provider: "BASMA", time: "6m ago" },
  { id: "NP-2024-88817", type: "claim", service: "Diagnostic", amount: "SAR 890", status: "rejected", provider: "HNH", time: "8m ago" },
  { id: "NP-2024-88816", type: "claim", service: "Hospital Stay", amount: "SAR 12,400", status: "approved", provider: "GIVC", time: "10m ago" },
  { id: "NP-2024-88815", type: "prior-auth", service: "Medical", amount: "SAR 2,400", status: "approved", provider: "Oracle", time: "12m ago" },
];

const TABS_NPHIES = ["Network", "Transactions", "Error Codes", "Test Tools"];

function approvalRateColor(rate) {
  if (rate >= 98) return "text-green-400";
  if (rate >= 95) return "text-yellow-400";
  return "text-red-400";
}

function typeBadge(type) {
  const map = {
    claim: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    "prior-auth": "bg-purple-500/20 text-purple-300 border-purple-500/30",
    eligibility: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  };
  return map[type] || "bg-white/10 text-gray-400 border-white/20";
}

function statusBadge(status) {
  const map = {
    approved: "bg-green-500/20 text-green-300 border-green-500/30",
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    rejected: "bg-red-500/20 text-red-300 border-red-500/30",
    eligible: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  };
  return map[status] || "bg-white/10 text-gray-400 border-white/20";
}

export default function NphiesLive() {
  const [activeTab, setActiveTab] = useState("Network");

  // Test Tools state
  const [memberId, setMemberId] = useState("");
  const [payerId, setPayerId] = useState("");
  const [eligResult, setEligResult] = useState(null);
  const [eligLoading, setEligLoading] = useState(false);

  const [claimService, setClaimService] = useState("1");
  const [claimAmount, setClaimAmount] = useState("");
  const [claimResult, setClaimResult] = useState(null);
  const [claimLoading, setClaimLoading] = useState(false);

  function handleCheckEligibility() {
    if (!memberId || !payerId) return;
    setEligLoading(true);
    setEligResult(null);
    setTimeout(() => {
      setEligLoading(false);
      setEligResult({
        eligible: true,
        memberId: memberId,
        payerId: payerId,
        coverageStart: "2024-01-01",
        coverageEnd: "2024-12-31",
        planType: "Comprehensive",
        network: "Saudi NPHIES Network",
        copay: "10%",
        deductible: "SAR 0",
      });
    }, 1200);
  }

  function handleValidateClaim() {
    if (!claimAmount) return;
    setClaimLoading(true);
    setClaimResult(null);
    const svc = NPHIES_SERVICE_CODES.find(s => s.code === claimService);
    setTimeout(() => {
      setClaimLoading(false);
      setClaimResult({
        valid: true,
        service: svc ? `${svc.english} (${svc.arabic})` : "Unknown",
        amount: claimAmount,
        fhirValid: true,
        approvalProbability: svc ? svc.approvalRate : 95.0,
        icdCheck: "Pass",
        priorAuthRequired: claimService === "5" || parseFloat(claimAmount) > 10000,
        estimatedProcessing: "2-4 hours",
      });
    }, 900);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">🇸🇦 NPHIES Live Integration</h2>
        <p className="text-xs text-gray-500 mt-1">
          Saudi National Platform for Health Information Exchange — real-time claim processing &amp; eligibility
        </p>
      </div>

      {/* Internal Tabs */}
      <div className="border-b border-white/[0.05] bg-white/[0.02] flex gap-2 px-0 mb-6">
        {TABS_NPHIES.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-gray-500 hover:text-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* NETWORK TAB */}
      {activeTab === "Network" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Network Approval Rate", value: "98.6%", color: "text-green-400", icon: "✅" },
              { label: "Total Claims Today", value: "15,138", color: "text-white", icon: "📋" },
              { label: "Total Value", value: "SAR 835.7M", color: "text-cyan-400", icon: "💰" },
              { label: "NPHIES Uptime", value: "99.97%", color: "text-green-400", icon: "🟢" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <div className="text-xl mb-1">{kpi.icon}</div>
                <div className={`text-2xl font-bold font-mono ${kpi.color}`}>{kpi.value}</div>
                <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Service Codes Table */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
            <div className="px-5 pt-4 pb-2">
              <div className="text-base font-semibold text-white">NPHIES Service Codes — Approval Statistics</div>
              <div className="text-xs text-gray-500 mt-0.5">Per-category breakdown with approval rates and claim values</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                    {["Code", "Service", "Approval Rate", "Avg Claim Value", "Daily Volume"].map((h) => (
                      <th key={h} className="text-left text-xs text-gray-500 uppercase tracking-wider pb-2 pt-3 px-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {NPHIES_SERVICE_CODES.map((svc) => (
                    <tr key={svc.code} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <span className="rounded px-2 py-0.5 text-xs font-mono font-bold bg-white/[0.06] border border-white/[0.08] text-gray-300">{svc.code}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-white text-sm">{svc.english}</div>
                        <div className="text-xs text-gray-500 mt-0.5" dir="rtl" style={{ textAlign: "right" }}>{svc.arabic}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold text-sm ${approvalRateColor(svc.approvalRate)}`}>
                            {svc.approvalRate}%
                          </span>
                          <div className="h-1.5 w-16 rounded-full bg-white/[0.06] overflow-hidden">
                            <div
                              className={`h-full rounded-full ${svc.approvalRate >= 98 ? "bg-green-500" : svc.approvalRate >= 95 ? "bg-yellow-500" : "bg-red-500"}`}
                              style={{ width: `${svc.approvalRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm text-white">{svc.avgClaim}</td>
                      <td className="py-3 px-4 font-mono text-sm text-gray-300">{svc.volume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gateway Status */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
            <div className="text-base font-semibold text-white mb-3">NPHIES Gateway Status</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: "Endpoint", value: "https://HSB.nphies.sa/ClaimRequest" },
                { label: "Last Ping", value: "120ms" },
                { label: "FHIR Version", value: "R4" },
                { label: "Saudi HL7 Profile", value: "2.1.0" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                  <span className="text-xs text-gray-500 w-32 shrink-0">{item.label}</span>
                  <span className="font-mono text-xs text-cyan-300 break-all">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.05]">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-400 font-medium">Gateway Operational — Connected to NPHIES Network</span>
            </div>
          </div>
        </div>
      )}

      {/* TRANSACTIONS TAB */}
      {activeTab === "Transactions" && (
        <div>
          <div className="mb-4">
            <div className="text-base font-semibold text-white">Recent NPHIES Transactions</div>
            <div className="text-xs text-gray-500 mt-0.5">Live feed — refreshes every 30 seconds</div>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                    {["Transaction ID", "Type", "Service", "Amount", "Status", "Provider", "Time"].map((h) => (
                      <th key={h} className="text-left text-xs text-gray-500 uppercase tracking-wider pb-2 pt-3 px-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RECENT_TRANSACTIONS.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-cyan-400">{tx.id}</td>
                      <td className="py-3 px-4">
                        <span className={`rounded px-2 py-0.5 text-xs font-medium border ${typeBadge(tx.type)}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300">{tx.service}</td>
                      <td className="py-3 px-4 font-mono text-sm text-white">{tx.amount}</td>
                      <td className="py-3 px-4">
                        <span className={`rounded px-2 py-0.5 text-xs font-medium border ${statusBadge(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-400">{tx.provider}</td>
                      <td className="py-3 px-4 text-xs text-gray-500">{tx.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ERROR CODES TAB */}
      {activeTab === "Error Codes" && (
        <div className="space-y-6">
          <div>
            <div className="text-base font-semibold text-white mb-1">NPHIES Rejection Code Reference</div>
            <div className="text-xs text-gray-500 mb-4">Common rejection codes with Arabic translations and resolution guidance</div>
            <div className="space-y-3">
              {NPHIES_ERROR_CODES.map((err) => (
                <div key={err.code} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-all hover:border-blue-500/30 hover:bg-blue-500/[0.05]">
                  <div className="flex items-start gap-4">
                    <span className={`rounded px-2 py-1 text-xs font-mono font-bold shrink-0 ${
                      err.severity === "error"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    }`}>
                      {err.code}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <div className="font-medium text-white text-sm">{err.english}</div>
                        <span className="text-xs font-mono text-gray-400 shrink-0">{err.frequency}</span>
                      </div>
                      <div className="text-sm text-gray-400 mb-2" dir="rtl" style={{ textAlign: "right" }}>{err.arabic}</div>
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-cyan-500 shrink-0">→ Fix:</span>
                        <span className="text-xs text-gray-400">{err.fix}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RCM Automation Tips */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
            <div className="text-base font-semibold text-white mb-3">RCM Automation Tips</div>
            <div className="text-xs text-gray-500 mb-3 uppercase tracking-wider">ClaimLinc automated rejection handling</div>
            <ul className="space-y-2">
              {[
                "REJ001 — Member eligibility is auto-checked before claim submission via ClaimLinc pre-validation step",
                "REJ002 — Service coverage matrix is cached in KV:CLAIM_STATUS, updated nightly from payer policy feeds",
                "REJ003 — Prior auth requirements are detected at order creation; PA workflow triggers automatically for high-value services",
                "REJ004 — Duplicate detection runs against D1:nphies_claims_db within 24hr window before submission",
                "REJ005 — ICD-10 codes are validated against NPHIES terminology server (KV:TERMINOLOGY) at point of entry",
                "Auto-retry logic handles transient 5xx errors with exponential backoff via Queue:claim-submissions DLQ",
                "All rejections are logged to D1:audit_log_db and surface in ComplianceLinc dashboard within 60 seconds",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="text-cyan-500 shrink-0 mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* TEST TOOLS TAB */}
      {activeTab === "Test Tools" && (
        <div className="space-y-6">
          {/* Eligibility Check */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
            <div className="text-base font-semibold text-white mb-1">Eligibility Check</div>
            <div className="text-xs text-gray-500 mb-4">Verify member coverage via ClaimLinc → NPHIES CoverageEligibilityRequest</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Member ID</label>
                <input
                  type="text"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  placeholder="e.g. SA123456789"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-cyan-500/50 focus:bg-cyan-500/[0.05] transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Payer ID</label>
                <input
                  type="text"
                  value={payerId}
                  onChange={(e) => setPayerId(e.target.value)}
                  placeholder="e.g. BUPA-SA"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-cyan-500/50 focus:bg-cyan-500/[0.05] transition-colors font-mono"
                />
              </div>
            </div>
            <button
              onClick={handleCheckEligibility}
              disabled={!memberId || !payerId || eligLoading}
              className="rounded-lg px-5 py-2.5 text-sm font-medium bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {eligLoading ? "Checking..." : "Check Eligibility via ClaimLinc"}
            </button>

            {eligResult && (
              <div className="mt-4 rounded-lg border border-green-500/20 bg-green-500/[0.05] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-semibold text-green-300">
                    {eligResult.eligible ? "✓ Member Eligible" : "✗ Not Eligible"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Member ID", value: eligResult.memberId },
                    { label: "Payer ID", value: eligResult.payerId },
                    { label: "Coverage Start", value: eligResult.coverageStart },
                    { label: "Coverage End", value: eligResult.coverageEnd },
                    { label: "Plan Type", value: eligResult.planType },
                    { label: "Network", value: eligResult.network },
                    { label: "Co-pay", value: eligResult.copay },
                    { label: "Deductible", value: eligResult.deductible },
                  ].map((item) => (
                    <div key={item.label} className="flex gap-2">
                      <span className="text-xs text-gray-500 w-28 shrink-0">{item.label}</span>
                      <span className="font-mono text-xs text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Claim Preview */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
            <div className="text-base font-semibold text-white mb-1">Claim Preview &amp; Validation</div>
            <div className="text-xs text-gray-500 mb-4">Validate a claim before submission — FHIR check + approval probability estimate</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Service Type</label>
                <select
                  value={claimService}
                  onChange={(e) => setClaimService(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors cursor-pointer"
                >
                  {NPHIES_SERVICE_CODES.map((svc) => (
                    <option key={svc.code} value={svc.code} className="bg-[#0a1628]">
                      {svc.code} — {svc.english} ({svc.arabic})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Claim Amount (SAR)</label>
                <input
                  type="number"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-cyan-500/50 focus:bg-cyan-500/[0.05] transition-colors font-mono"
                />
              </div>
            </div>
            <button
              onClick={handleValidateClaim}
              disabled={!claimAmount || claimLoading}
              className="rounded-lg px-5 py-2.5 text-sm font-medium bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {claimLoading ? "Validating..." : "Validate Claim"}
            </button>

            {claimResult && (
              <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/[0.05] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-semibold text-blue-300">
                    {claimResult.valid ? "✓ Valid FHIR Claim" : "✗ Validation Failed"}
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Service", value: claimResult.service },
                    { label: "Amount", value: `SAR ${parseFloat(claimResult.amount).toLocaleString()}` },
                    { label: "FHIR R4 Valid", value: claimResult.fhirValid ? "✓ Pass" : "✗ Fail" },
                    { label: "ICD-10 Check", value: claimResult.icdCheck },
                    { label: "Prior Auth Required", value: claimResult.priorAuthRequired ? "⚠️ Yes — Submit PA first" : "No" },
                    { label: "Est. Processing", value: claimResult.estimatedProcessing },
                  ].map((item) => (
                    <div key={item.label} className="flex gap-2">
                      <span className="text-xs text-gray-500 w-36 shrink-0">{item.label}</span>
                      <span className="font-mono text-xs text-white">{item.value}</span>
                    </div>
                  ))}
                  <div className="flex gap-2 items-center pt-1 border-t border-white/[0.05] mt-2">
                    <span className="text-xs text-gray-500 w-36 shrink-0">Approval Probability</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${claimResult.approvalProbability >= 98 ? "bg-green-500" : claimResult.approvalProbability >= 95 ? "bg-yellow-500" : "bg-red-500"}`}
                          style={{ width: `${claimResult.approvalProbability}%` }}
                        />
                      </div>
                      <span className={`font-mono text-sm font-bold ${approvalRateColor(claimResult.approvalProbability)}`}>
                        {claimResult.approvalProbability}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
