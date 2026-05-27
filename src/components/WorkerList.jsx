import { useState } from "react";

const CF_WORKER_METRICS = [
  { name: "healthlinc-unified", req: "284K", errRate: "0.02%", cpu: "12ms", status: "active", p99: "89ms" },
  { name: "healthlinc-mcp", req: "89K", errRate: "0.00%", cpu: "8ms", status: "active", p99: "45ms" },
  { name: "brainsait-masterlinc", req: "148K", errRate: "0.01%", cpu: "24ms", status: "active", p99: "120ms" },
  { name: "brainsait-masterlinc-production", req: "234K", errRate: "0.01%", cpu: "22ms", status: "active", p99: "115ms" },
  { name: "brainsait-unified-prod", req: "92K", errRate: "0.03%", cpu: "18ms", status: "active", p99: "98ms" },
  { name: "contextlinc-api", req: "34K", errRate: "0.05%", cpu: "45ms", status: "active", p99: "234ms" },
  { name: "contextlinc-file-processor", req: "8K", errRate: "0.12%", cpu: "89ms", status: "active", p99: "890ms" },
  { name: "claim-chat-agent", req: "18K", errRate: "0.00%", cpu: "34ms", status: "active", p99: "180ms" },
  { name: "givc-api-router", req: "892K", errRate: "0.00%", cpu: "2ms", status: "active", p99: "8ms" },
  { name: "givc-healthcare-api", req: "184K", errRate: "0.02%", cpu: "15ms", status: "active", p99: "78ms" },
  { name: "givc-healthcare-platform", req: "94K", errRate: "0.01%", cpu: "19ms", status: "active", p99: "95ms" },
  { name: "givc-compliance", req: "248K", errRate: "0.00%", cpu: "11ms", status: "active", p99: "56ms" },
  { name: "givc-compliance-monitor", req: "342K", errRate: "0.00%", cpu: "9ms", status: "active", p99: "45ms" },
  { name: "givc-clinical-decision", req: "28K", errRate: "0.04%", cpu: "89ms", status: "active", p99: "445ms" },
  { name: "givc-lab-parser", req: "12K", errRate: "0.08%", cpu: "128ms", status: "active", p99: "640ms" },
  { name: "givc-dicom-agent", req: "4K", errRate: "0.15%", cpu: "234ms", status: "active", p99: "1.2s" },
  { name: "givc-dicom-analysis", req: "3K", errRate: "0.18%", cpu: "456ms", status: "active", p99: "2.3s" },
  { name: "givc-oracle-container", req: "9K", errRate: "0.22%", cpu: "78ms", status: "active", p99: "390ms" },
  { name: "rcm-validation-api", req: "45K", errRate: "0.01%", cpu: "22ms", status: "active", p99: "110ms" },
  { name: "healthcare-insurance-analysis", req: "7K", errRate: "0.06%", cpu: "156ms", status: "active", p99: "780ms" },
  { name: "brainsait-doctor-hub-api", req: "38K", errRate: "0.02%", cpu: "28ms", status: "active", p99: "140ms" },
  { name: "brainsait-ocr-worker", req: "6K", errRate: "0.14%", cpu: "340ms", status: "active", p99: "1.7s" },
  { name: "brainsait-api-gateway", req: "1.2M", errRate: "0.00%", cpu: "1ms", status: "active", p99: "5ms" },
  { name: "admin-linc-369", req: "2K", errRate: "0.00%", cpu: "45ms", status: "active", p99: "225ms" },
];

const TYPES = [
  "core", "orchestrator", "gateway", "mcp", "agent", "platform",
  "compliance", "router", "bridge", "admin",
];

function errRateColor(rate) {
  const v = parseFloat(rate);
  if (v < 0.05) return "text-green-400";
  if (v <= 0.2) return "text-yellow-400";
  return "text-red-400";
}

function cpuColor(cpu) {
  const v = parseInt(cpu);
  if (v < 50) return "text-green-400";
  if (v <= 200) return "text-yellow-400";
  return "text-red-400";
}

// Rough sparkline: map request string to a relative volume bucket (1-10)
function reqVolume(req) {
  const num = parseFloat(req.replace("M", "000").replace("K", ""));
  const str = req.toUpperCase();
  let val;
  if (str.endsWith("M")) val = parseFloat(req) * 1000;
  else if (str.endsWith("K")) val = parseFloat(req);
  else val = parseFloat(req) / 1000;
  if (val >= 1000) return 10;
  if (val >= 500) return 9;
  if (val >= 250) return 8;
  if (val >= 150) return 7;
  if (val >= 100) return 6;
  if (val >= 50) return 5;
  if (val >= 25) return 4;
  if (val >= 10) return 3;
  if (val >= 5) return 2;
  return 1;
}

function Sparkline({ req }) {
  const level = reqVolume(req);
  const blocks = 10;
  return (
    <div className="flex items-end gap-0.5 h-5">
      {Array.from({ length: blocks }, (_, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-sm ${i < level ? "bg-cyan-500/70" : "bg-white/[0.06]"}`}
          style={{ height: `${((i + 1) / blocks) * 100}%` }}
        />
      ))}
    </div>
  );
}

export default function WorkerList({ workers }) {
  const [filterType, setFilterType] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" | "table"

  const filtered = filterType
    ? workers.filter((w) => w.type === filterType)
    : workers;

  // Compute totals
  const totalActive = workers.filter(w => w.status === "active").length;
  const metricsMap = {};
  CF_WORKER_METRICS.forEach(m => { metricsMap[m.name] = m; });

  return (
    <div>
      {/* Header with summary */}
      <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-white">Cloudflare Workers Inventory</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            All {workers.length} healthcare/LINC workers — {totalActive} active
          </p>
        </div>
        {/* Summary stat chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Total Workers", value: workers.length, color: "text-white" },
            { label: "Active", value: totalActive, color: "text-green-400" },
            { label: "Types", value: TYPES.filter(t => workers.some(w => w.type === t)).length, color: "text-cyan-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-center">
              <div className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter + view toggle row */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <button
            className={`rounded-full cursor-pointer px-3 py-1.5 text-[11px] border transition-colors ${
              filterType === null
                ? "border-cyan-500/30 bg-cyan-500/15 text-cyan-400"
                : "border-white/10 bg-white/[0.04] text-gray-500 hover:text-gray-300"
            }`}
            onClick={() => setFilterType(null)}
          >
            All ({workers.length})
          </button>
          {TYPES.map((t) => {
            const count = workers.filter(w => w.type === t).length;
            if (!count) return null;
            return (
              <button
                key={t}
                className={`rounded-full cursor-pointer px-3 py-1.5 text-[11px] capitalize border transition-colors ${
                  filterType === t
                    ? "border-cyan-500/30 bg-cyan-500/15 text-cyan-400"
                    : "border-white/10 bg-white/[0.04] text-gray-500 hover:text-gray-300"
                }`}
                onClick={() => setFilterType(t)}
              >
                {t} ({count})
              </button>
            );
          })}
        </div>
        {/* View toggle */}
        <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.03] overflow-hidden">
          {[
            { id: "list", label: "≡ List" },
            { id: "table", label: "⊞ Table" },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setViewMode(v.id)}
              className={`px-3 py-1.5 text-[11px] transition-colors cursor-pointer ${
                viewMode === v.id
                  ? "bg-cyan-500/20 text-cyan-300"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  {["Worker Name", "Type", "Role", "Requests/day", "Err Rate", "Avg CPU", "P99", "Volume", "Status"].map((h) => (
                    <th key={h} className="text-left text-xs text-gray-500 uppercase tracking-wider pb-2 pt-3 px-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((w) => {
                  const m = metricsMap[w.name];
                  return (
                    <tr key={w.name} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3">
                        <code className="text-xs text-cyan-400 font-mono">{w.name}</code>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="rounded px-1.5 py-0.5 text-[10px] capitalize bg-white/[0.06] border border-white/[0.08] text-gray-400">{w.type}</span>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-gray-400 max-w-[160px] truncate" title={w.role}>{w.role}</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-white">{m ? m.req : "—"}</td>
                      <td className={`py-2.5 px-3 font-mono text-xs ${m ? errRateColor(m.errRate) : "text-gray-600"}`}>{m ? m.errRate : "—"}</td>
                      <td className={`py-2.5 px-3 font-mono text-xs ${m ? cpuColor(m.cpu) : "text-gray-600"}`}>{m ? m.cpu : "—"}</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-gray-300">{m ? m.p99 : "—"}</td>
                      <td className="py-2.5 px-3">{m ? <Sparkline req={m.req} /> : <span className="text-gray-600 text-xs">—</span>}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${w.status === "active" ? "bg-green-500" : "bg-red-500"}`} />
                          <span className={`text-xs ${w.status === "active" ? "text-green-400" : "text-red-400"}`}>{w.status}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <>
          {filtered.length === 0 && filterType ? (
            <div className="py-10 text-center text-sm text-gray-500">
              No workers found of type &quot;{filterType}&quot;
            </div>
          ) : (
            TYPES.map((type) => {
              const typeWorkers = filterType ? filtered.filter(w => w.type === type) : workers.filter((w) => w.type === type);
              if (!typeWorkers.length || (filterType && filterType !== type)) return null;
              return (
                <div key={type} className="mb-5">
                  <p className="mb-2 pl-1 text-[11px] uppercase tracking-wider text-gray-500">
                    {type} ({typeWorkers.length})
                  </p>
                  <div className="space-y-1.5">
                    {typeWorkers.map((w) => {
                      const m = metricsMap[w.name];
                      return (
                        <div
                          key={w.name}
                          className="flex items-center gap-4 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3 transition-all hover:border-blue-500/20 hover:bg-blue-500/[0.03]"
                        >
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${w.status === "active" ? "bg-green-500" : "bg-red-500"}`}
                            aria-label={`Status: ${w.status}`}
                          />
                          <code className="min-w-[220px] text-xs text-cyan-400 font-mono">{w.name}</code>
                          <span className="text-xs text-gray-400 flex-1">{w.role}</span>
                          {m && (
                            <div className="flex items-center gap-4 shrink-0">
                              <div className="text-center hidden md:block">
                                <div className="font-mono text-xs text-white">{m.req}</div>
                                <div className="text-[9px] text-gray-600">req/day</div>
                              </div>
                              <div className="text-center hidden lg:block">
                                <div className={`font-mono text-xs ${errRateColor(m.errRate)}`}>{m.errRate}</div>
                                <div className="text-[9px] text-gray-600">err rate</div>
                              </div>
                              <div className="text-center hidden lg:block">
                                <div className={`font-mono text-xs ${cpuColor(m.cpu)}`}>{m.cpu}</div>
                                <div className="text-[9px] text-gray-600">cpu avg</div>
                              </div>
                              <div className="text-center hidden xl:block">
                                <div className="font-mono text-xs text-gray-300">{m.p99}</div>
                                <div className="text-[9px] text-gray-600">p99</div>
                              </div>
                              <Sparkline req={m.req} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
}
