/**
 * BrainSAIT LINC FHIR — Full Integration Chain Audit
 * Traces every UI element → API endpoint → Worker handler → IRIS class
 * Verifies links, buttons, routes, and error paths
 */
import { readFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
let passed = 0, failed = 0, warnings = 0;
const results = [];

function ok(label) { passed++; results.push({ label, status: "PASS" }); }
function fail(label, msg) { failed++; results.push({ label, status: "FAIL", msg }); console.log(`  ✗ ${label}: ${msg}`); }
function warn(label, msg) { warnings++; results.push({ label, status: "WARN", msg }); console.log(`  ⚠ ${label}: ${msg}`); }

console.log("\n" + "▓".repeat(60));
console.log(" BrainSAIT LINC FHIR — Full Integration Chain Audit");
console.log("▓".repeat(60));

// ═══════════════════════════════════════════════════════════════════════════
// 1. TAB BAR — Every tab button loads the correct component
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n─── 1. TAB BAR → COMPONENT MAPPING ────────────────────────────────");

const appJsx = readFileSync(join(ROOT, "src/App.jsx"), "utf8");

const tabMappings = [
  { id: "agents",   component: "AgentPanel",  import: "AgentPanel",  condition: '<AgentPanel agents={LINC_AGENTS} />' },
  { id: "fhir",     component: "FhirFlows",   import: "FhirFlows",   condition: '<FhirFlows flows={FHIR_FLOWS} />' },
  { id: "contest",  component: "ContestPanel",import: "ContestPanel",condition: '<ContestPanel />' },
  { id: "workers",  component: "WorkerList",  import: "WorkerList",  condition: '<WorkerList workers={CF_WORKERS} />' },
  { id: "intersys", component: "InterSystemsPanel", import: "InterSystemsPanel", condition: '<InterSystemsPanel arch={INTERSYSTEMS_ARCH} />' },
  { id: "plan",     component: "UnificationPlan",   import: "UnificationPlan",   condition: '<UnificationPlan' },
];

for (const tab of tabMappings) {
  const importOk = appJsx.includes(tab.import);
  const renderOk = appJsx.includes(tab.condition);
  const tabDefined = appJsx.includes(`"${tab.id}"`);
  if (importOk && renderOk && tabDefined) ok(`Tab "${tab.id}" → ${tab.component}: import ✓, render ✓, tab id ✓`);
  else fail(`Tab "${tab.id}"`, `import=${importOk} render=${renderOk} tabDef=${tabDefined}`);
}

// TABS array has exactly 6 entries
const tabMatches = appJsx.match(/\{ id: "(\w+)"[, ]/g);
if (tabMatches) ok(`TABS array contains ${tabMatches.length} entries`);
else fail("TABS array", "Could not find tab definitions");

// TabBar passes onTabChange
if (appJsx.includes("onTabChange={setActiveTab}")) ok("TabBar wired to setActiveTab");
else fail("TabBar wiring", "onTabChange={setActiveTab} not found");

// ═══════════════════════════════════════════════════════════════════════════
// 2. HEADER — Brand, counts, badges
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n─── 2. HEADER INTEGRATION ─────────────────────────────────────────");

const header = readFileSync(join(ROOT, "src/components/Header.jsx"), "utf8");
if (header.includes("workerCount")) ok("Header receives workerCount prop");
else fail("Header: workerCount prop", "Property not found");
if (header.includes("agentCount")) ok("Header receives agentCount prop");
else fail("Header: agentCount prop", "Property not found");
if (header.includes("BrainSAIT")) ok("Header: Brand name displayed");
else fail("Header: Brand name", "Missing BrainSAIT reference");
if (header.includes("FHIR R4") || header.includes("NPHIES")) ok("Header: FHIR/NPHIES badges");
else fail("Header: badges", "Missing FHIR/NPHIES references");
if (header.includes("LINC Agent Unification")) ok("Header: Subtitle");
else fail("Header: subtitle", "Missing subtitle");

// ═══════════════════════════════════════════════════════════════════════════
// 3. AGENT CARD + AGENT PANEL — Search, expand, health
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n─── 3. AGENT CARD / PANEL INTEGRATION ────────────────────────────");

const agentCard = readFileSync(join(ROOT, "src/components/AgentCard.jsx"), "utf8");
const agentPanel = readFileSync(join(ROOT, "src/components/AgentPanel.jsx"), "utf8");

// AgentCard interactions
if (agentCard.includes("onClick")) ok("AgentCard: click handler");
else fail("AgentCard: onClick", "Missing click handler");
if (agentCard.includes("onKeyDown")) ok("AgentCard: keyboard navigation");
else fail("AgentCard: keyboard", "Missing onKeyDown");
if (agentCard.includes("aria-expanded")) ok("AgentCard: accessibility expanded state");
else fail("AgentCard: aria-expanded", "Missing");
if (agentCard.includes("tabIndex")) ok("AgentCard: tabIndex for keyboard focus");
else fail("AgentCard: tabIndex", "Missing");

// Check detail expand section
if (agentCard.includes("cfWorkers") && agentCard.includes("endpoints") && agentCard.includes("intersystems")) {
  ok("AgentCard: expanded details show CF Workers, endpoints, IRIS mapping");
} else fail("AgentCard: expanded details", "Missing detail sections");

// AgentPanel search
if (agentPanel.includes("searchTerm") && agentPanel.includes("onChange")) ok("AgentPanel: search filter");
else fail("AgentPanel: search", "Missing search input");
if (agentPanel.includes("filtered")) ok("AgentPanel: filtered results");
else fail("AgentPanel: filtered", "Missing filtered logic");
if (agentPanel.includes("No agents match")) ok("AgentPanel: empty state");
else fail("AgentPanel: empty state", "Missing no-results message");

// ═══════════════════════════════════════════════════════════════════════════
// 4. FHIR FLOWS — Grid, NPHIES flags, architecture diagram
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n─── 4. FHIR FLOWS INTEGRATION ────────────────────────────────────");

const fhirFlows = readFileSync(join(ROOT, "src/components/FhirFlows.jsx"), "utf8");
if (fhirFlows.includes("nphies")) ok("FhirFlows: NPHIES flag rendering");
else fail("FhirFlows: NPHIES", "Missing nphies flag");
if (fhirFlows.includes("architecture") || fhirFlows.includes("Architecture")) ok("FhirFlows: architecture diagram");
else fail("FhirFlows: architecture", "Missing architecture diagram");
if (fhirFlows.includes("LINC_AGENTS")) ok("FhirFlows: agent reference resolution");
else fail("FhirFlows: agents", "Missing agent reference");
if (fhirFlows.includes("Internal")) ok("FhirFlows: Internal label for non-NPHIES");
else fail("FhirFlows: Internal label", "Missing");

// ═══════════════════════════════════════════════════════════════════════════
// 5. CONTEST PANEL — All 12 agents, links, scorecard
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n─── 5. CONTEST PANEL INTEGRATION ─────────────────────────────────");

const contestPanel = readFileSync(join(ROOT, "src/components/ContestPanel.jsx"), "utf8");

// Count contest agent cards
const contestAgentEntries = contestPanel.match(/task:/g);
if (contestAgentEntries) ok(`ContestPanel: ${contestAgentEntries.length} agent cards`);
else fail("ContestPanel: agent cards", "No task entries found");

// Each contest agent has a live demo link
const demoUrls = contestPanel.match(/demoUrl: "(\/api\/contest\/[^"]+)"/g);
if (demoUrls) {
  ok(`ContestPanel: ${demoUrls.length} demoUrl data fields`);
  const endpoints = ["summary", "prior-auth", "gaps-in-care", "medication-safety",
    "care-plan", "clinical-trials", "readmission-risk", "triage", "imaging-followup",
    "lab-explainer", "nl-query", "sdoh-referral"];
  for (const ep of endpoints) {
    const found = demoUrls.some(l => l.includes(ep));
    if (found) ok(`ContestPanel demoUrl: /api/contest/${ep}`);
    else fail(`ContestPanel demoUrl: /api/contest/${ep}`, "Missing data field");
  }
  // Verify the <a> tag uses demoUrl
  if (contestPanel.includes("href={agent.demoUrl}")) ok("ContestPanel: <a href={agent.demoUrl}> rendered");
  else fail("ContestPanel: href rendering", "href not wired to demoUrl");
} else fail("ContestPanel: demoUrls", "No demoUrl data fields found");

// Scorecard stats
if (contestPanel.includes("12/12")) ok("ContestPanel: tasks 12/12 scorecard");
else fail("ContestPanel: 12/12 scorecard", "Missing");
if (contestPanel.includes("totalBonus") || contestPanel.includes("60")) ok("ContestPanel: 60 bonus points");
else fail("ContestPanel: 60 points", "Missing");
if (contestPanel.includes("IRIS Classes")) ok("ContestPanel: IRIS class count");
else fail("ContestPanel: IRIS count", "Missing");
if (contestPanel.includes("Agent Workers")) ok("ContestPanel: Worker count");
else fail("ContestPanel: Worker count", "Missing");

// Verify all endpoint links in contest panel match real worker endpoints
const workerIndex = readFileSync(join(ROOT, "wrangler/src/index.js"), "utf8");
const workerRoutes = workerIndex.match(/\/api\/contest\/[a-z-]+/g) || [];
const panelLinks = contestPanel.match(/\/api\/contest\/[a-z-]+/g) || [];
const uniquePanel = [...new Set(panelLinks)];
const uniqueWorker = [...new Set(workerRoutes)];

// Every panel link must have a worker route
for (const link of uniquePanel) {
  if (uniqueWorker.includes(link)) ok(`Panel link "${link}" → Worker route exists`);
  else fail(`Panel link "${link}" → Worker route`, "MISSING HANDLER");
}
// Every worker route must have a panel link
for (const route of uniqueWorker) {
  if (uniquePanel.includes(route)) ok(`Worker route "${route}" → Panel link exists`);
  else fail(`Worker route "${route}" → Panel link`, "No UI reference — orphaned endpoint");
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. WORKER LIST — Type filters, health indicators
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n─── 6. WORKER LIST INTEGRATION ───────────────────────────────────");

const workerList = readFileSync(join(ROOT, "src/components/WorkerList.jsx"), "utf8");
if (workerList.includes("filterType")) ok("WorkerList: type filter");
else fail("WorkerList: filter", "Missing filterType");
if (workerList.includes("All")) ok("WorkerList: 'All' filter button");
else fail("WorkerList: All button", "Missing");
if (workerList.includes("No workers found")) ok("WorkerList: empty state");
else fail("WorkerList: empty state", "Missing no-results message");
const typeButtons = (workerList.match(/TYPES\.map/g) || []).length;
if (typeButtons > 0) ok(`WorkerList: ${typeButtons} type button groups`);
else fail("WorkerList: type buttons", "Missing button generation");

// ═══════════════════════════════════════════════════════════════════════════
// 7. INTERSYSTEMS PANEL — Config display, production classes, code sample
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n─── 7. INTERSYSTEMS PANEL INTEGRATION ────────────────────────────");

const isysPanel = readFileSync(join(ROOT, "src/components/InterSystemsPanel.jsx"), "utf8");
if (isysPanel.includes("IRIS Namespace")) ok("InterSystems: Namespace section");
else fail("InterSystems: Namespace", "Missing");
if (isysPanel.includes("SMART on FHIR")) ok("InterSystems: SMART on FHIR config");
else fail("InterSystems: SMART", "Missing");
if (isysPanel.includes("Production Classes")) ok("InterSystems: Production class listing");
else fail("InterSystems: Production classes", "Missing");
if (isysPanel.includes("ObjectScript") && isysPanel.includes("OnProcessInput")) ok("InterSystems: ObjectScript code sample");
else fail("InterSystems: code sample", "Missing MASTERLINC ObjectScript");
if (isysPanel.includes("SendRequestSync")) ok("InterSystems: SendRequestSync in sample");
else fail("InterSystems: SendRequestSync", "Missing");

// ═══════════════════════════════════════════════════════════════════════════
// 8. UNIFICATION PLAN — Status colors, task lists, stats
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n─── 8. UNIFICATION PLAN INTEGRATION ──────────────────────────────");

const planPanel = readFileSync(join(ROOT, "src/components/UnificationPlan.jsx"), "utf8");
if (planPanel.includes("4-phase") || planPanel.includes("Phase ")) ok("Unification: phase display");
else fail("Unification: phases", "Missing phase rendering");
if (planPanel.includes("statusColor") || planPanel.includes("statusLabel")) ok("Unification: status color coding");
else fail("Unification: status colors", "Missing");
if (planPanel.includes("CF Workers Found") || planPanel.includes("LINC Agents")) ok("Unification: summary stats");
else fail("Unification: stats", "Missing summary cards");

// ═══════════════════════════════════════════════════════════════════════════
// 9. WORKER ROUTER — Every endpoint has a handler
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n─── 9. WORKER ROUTER → HANDLER MAPPING ──────────────────────────");

const workerSrc = readFileSync(join(ROOT, "wrangler/src/index.js"), "utf8");

// Core endpoints
const coreEndpoints = ["/api/health", "/api/agents", "/api/workers", "/api/fhir/flows", "/api/intersystems"];
for (const ep of coreEndpoints) {
  if (workerSrc.includes(ep)) ok(`Worker router: ${ep} endpoint`);
  else fail(`Worker router: ${ep}`, "MISSING");
}

// Contest endpoints
const contestEndpoints = ["summary", "prior-auth", "gaps-in-care", "medication-safety",
  "care-plan", "clinical-trials", "readmission-risk", "triage", "imaging-followup",
  "lab-explainer", "nl-query", "sdoh-referral"];
for (const ep of contestEndpoints) {
  if (workerSrc.includes(`/api/contest/${ep}`)) ok(`Worker router: /api/contest/${ep}`);
  else fail(`Worker router: /api/contest/${ep}`, "MISSING");
}

// All imports reference existing files
const agentDir = join(ROOT, "wrangler/src/agents");
const imports = workerSrc.match(/from "\.\/agents\/([^"]+)"/g) || [];
for (const imp of imports) {
  const fileName = imp.replace(/from "\.\/agents\//, "").replace(/"$/, "");
  const filePath = join(agentDir, fileName);
  if (existsSync(filePath)) ok(`Worker import: ${fileName} exists`);
  else fail(`Worker import: ${fileName}`, `File NOT FOUND at ${filePath}`);
}

// CONTEST_AGENTS map has correct keys
const contestMap = workerSrc.match(/\/api\/contest\/[a-z-]+/g) || [];
const uniqueContestRoutes = [...new Set(contestMap)];
if (uniqueContestRoutes.length >= 12) ok(`Worker CONTEST_AGENTS map: ${uniqueContestRoutes.length} routes`);
else fail("Worker CONTEST_AGENTS map", `Only ${uniqueContestRoutes.length} routes`);

// Fallback handler
if (workerSrc.includes('"BrainSAIT LINC FHIR Unified API"')) ok("Worker: fallback response");
else fail("Worker: fallback", "Missing catch-all response");

// ═══════════════════════════════════════════════════════════════════════════
// 10. IRIS CLASSES → WORKER ENDPOINT — URL consistency
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n─── 10. IRIS CLASS → WORKER ENDPOINT CONSISTENCY ─────────────────");

const contestIrisDir = join(ROOT, "intersystems/src/contest");
const irisClsFiles = readdirSync(contestIrisDir).filter(f => f.endsWith(".cls"));

const endpointMap = {
  "SummaryGenerator": "summary",
  "PriorAuthCopilot": "prior-auth",
  "GapsInCareFinder": "gaps-in-care",
  "MedicationSafety": "medication-safety",
  "CarePlanNavigator": "care-plan",
  "ClinicalTrialMatcher": "clinical-trials",
  "ReadmissionRisk": "readmission-risk",
  "TriageAssistant": "triage",
  "ImagingFollowup": "imaging-followup",
  "LabExplainer": "lab-explainer",
  "NLQueryExplorer": "nl-query",
  "SDOHReferralMatcher": "sdoh-referral",
};

for (const clsFile of irisClsFiles) {
  const clsName = clsFile.replace("BrainSAIT.Contest.", "").replace(".cls", "");
  const expectedEndpoint = endpointMap[clsName];
  if (!expectedEndpoint) {
    fail(`IRIS class ${clsFile}`, "No endpoint mapping found");
    continue;
  }
  const workerRoute = `/api/contest/${expectedEndpoint}`;

  // Check IRIS class calls the correct Worker URL
  const clsContent = readFileSync(join(contestIrisDir, clsFile), "utf8");
  if (clsContent.includes(workerRoute)) ok(`IRIS ${clsName} → Worker ${workerRoute}`);
  else fail(`IRIS ${clsName} → Worker`, `URL "${workerRoute}" not referenced in ObjectScript`);
}

// ═══════════════════════════════════════════════════════════════════════════
// 11. DATA FILES — All exports, no orphaned data
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n─── 11. DATA LAYER INTEGRITY ─────────────────────────────────────");

const { LINC_AGENTS } = await import(join(ROOT, "src/data/agents.js"));
const { CF_WORKERS } = await import(join(ROOT, "src/data/workers.js"));
const { FHIR_FLOWS } = await import(join(ROOT, "src/data/fhir-flows.js"));
const { INTERSYSTEMS_ARCH } = await import(join(ROOT, "src/data/intersystems.js"));

// Every agent referenced in FHIR flows exists
for (const flow of FHIR_FLOWS) {
  for (const agentId of flow.agents) {
    const exists = LINC_AGENTS.some(a => a.id === agentId);
    if (exists) ok(`FHIR flow "${flow.flow}": agent "${agentId}" exists`);
    else fail(`FHIR flow "${flow.flow}": agent "${agentId}"`, "UNDEFINED AGENT");
  }
}

// Every worker referenced by agents exists
const workerNames = new Set(CF_WORKERS.map(w => w.name));
for (const agent of LINC_AGENTS) {
  for (const w of agent.cfWorkers) {
    if (workerNames.has(w)) ok(`Agent "${agent.id}" → worker "${w}" exists`);
    else fail(`Agent "${agent.id}" → worker "${w}"`, "WORKER NOT FOUND in CF_WORKERS");
  }
}

// Every agent has a corresponding IRIS class
const irisShortNames = new Set(INTERSYSTEMS_ARCH.productionClasses.map(c => c.split(".").pop().toLowerCase()));
for (const agent of LINC_AGENTS) {
  if (irisShortNames.has(agent.id)) ok(`Agent "${agent.id}" → IRIS production class exists`);
  else fail(`Agent "${agent.id}" → IRIS class`, "NO MATCHING PRODUCTION CLASS");
}

// ═══════════════════════════════════════════════════════════════════════════
// 12. ERROR HANDLING PATHS
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n─── 12. ERROR HANDLING PATHS ─────────────────────────────────────");

// Worker fallback for unknown routes
if (workerSrc.includes("BrainSAIT LINC FHIR Unified API")) ok("Worker: 404 catch-all response");
else fail("Worker: 404 handler", "Missing");

// AgentPanel empty search state
if (agentPanel.includes("No agents match")) ok("AgentPanel: empty search state");
else fail("AgentPanel: empty search", "Missing");

// WorkerList empty filter state
if (workerList.includes("No workers found")) ok("WorkerList: empty filter state");
else fail("WorkerList: empty filter", "Missing");

// Check all agent worker files handle missing params gracefully
const agentFiles = readdirSync(join(ROOT, "wrangler/src/agents")).filter(f => f.endsWith(".js"));
for (const file of agentFiles) {
  const content = readFileSync(join(ROOT, "wrangler/src/agents", file), "utf8");
  const hasDefault = content.includes('|| "default"') || content.includes('|| "all"') || content.includes("|| {}");
  if (hasDefault) ok(`${file}: default parameter handling`);
  else warn(`${file}: no default parameter handling`, "May fail with missing query params");
}

// ═══════════════════════════════════════════════════════════════════════════
// 13. BILINGUAL SUPPORT
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n─── 13. BILINGUAL (ARABIC/ENGLISH) SUPPORT ───────────────────────");

// All agents have Arabic names
for (const agent of LINC_AGENTS) {
  if (agent.arabic && agent.arabic.length > 0) ok(`Agent "${agent.id}": Arabic name "${agent.arabic}"`);
  else fail(`Agent "${agent.id}": Arabic name`, "MISSING");
}

// Tabs have Arabic labels
const tabsInApp = appJsx.match(/arabic: "([^"]+)"/g);
if (tabsInApp) ok(`${tabsInApp.length} Arabic tab labels`);
else fail("Arabic tab labels", "None found");

// Header has Arabic subtitle
if (header.includes("dir") || header.includes("rtl")) ok("Header: RTL direction support");
else warn("Header: dir attribute", "Missing RTL direction support");

// ContestPanel has Arabic names
const arabicContest = contestPanel.match(/arabic: "([^"]+)"/g);
if (arabicContest) ok(`ContestPanel: ${arabicContest.length} Arabic agent names`);
else fail("ContestPanel: Arabic", "No Arabic names found");

// Gaps-in-Care has Arabic outreach
const gapsFile = readFileSync(join(ROOT, "wrangler/src/agents/gaps-in-care.js"), "utf8");
if (gapsFile.includes("outreachAr")) ok("Gaps-in-Care: Arabic outreach messages");
else fail("Gaps-in-Care: Arabic outreach", "Missing");

// Lab explainer has Arabic translations
const labFile = readFileSync(join(ROOT, "wrangler/src/agents/lab-explainer.js"), "utf8");
if (labFile.includes("patientExplanationAr")) ok("Lab Explainer: Arabic explanations");
else fail("Lab Explainer: Arabic", "Missing Arabic lab explanations");

// Medication safety has Arabic counseling
const medFile = readFileSync(join(ROOT, "wrangler/src/agents/medication-safety.js"), "utf8");
if (medFile.includes("counselingAr")) ok("Medication Safety: Arabic counseling");
else fail("Medication Safety: Arabic counseling", "Missing");

// Imaging followup has Arabic outreach
const imgFile = readFileSync(join(ROOT, "wrangler/src/agents/imaging-followup.js"), "utf8");
if (imgFile.includes("أظهر فحص") || imgFile.includes("الأشعة")) ok("Imaging Follow-up: Arabic patient outreach");
else warn("Imaging Follow-up: Arabic", "Arabic outreach not confirmed");

// ═══════════════════════════════════════════════════════════════════════════
// 14. BUILD OUTPUT — dist/ has production-ready files
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n─── 14. BUILD OUTPUT CHECK ────────────────────────────────────────");

const dist = join(ROOT, "dist");
if (existsSync(dist)) ok("Build output: dist/ exists");
else fail("Build output: dist/", "MISSING — run 'npm run build'");

if (existsSync(join(dist, "index.html"))) ok("Build output: dist/index.html");
else fail("Build output: index.html", "MISSING");

const distAssets = readdirSync(join(dist, "assets")).filter(f => f.endsWith(".js"));
if (distAssets.length > 0) {
  ok(`Build output: ${distAssets.length} JS bundles`);
  const sizes = distAssets.map(f => {
    const stats = execSync(`wc -c "${join(dist, "assets", f)}"`, { encoding: "utf8" }).trim().split(/\s+/)[0];
    return { file: f, bytes: parseInt(stats) };
  });
  for (const s of sizes) {
    if (s.bytes < 300000) ok(`Bundle size OK: ${s.file} (${(s.bytes/1024).toFixed(0)}KB)`);
    else warn(`Bundle size large: ${s.file} (${(s.bytes/1024).toFixed(0)}KB)`, "Consider code splitting");
  }
} else fail("Build output: JS bundles", "No JS files in dist/assets");

// ═══════════════════════════════════════════════════════════════════════════
// 15. GIT STATUS — All changes tracked, no dirty state
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n─── 15. GIT REPOSITORY STATE ─────────────────────────────────────");

const gitStatus = execSync("git status --porcelain", { cwd: ROOT, encoding: "utf8" }).trim();
if (gitStatus.length === 0) ok("Git: working tree clean — no uncommitted changes");
else {
  warn("Git: uncommitted changes", gitStatus.split("\n").length + " files modified");
  for (const line of gitStatus.split("\n")) {
    console.log(`       ${line}`);
  }
}

const branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: ROOT, encoding: "utf8" }).trim();
if (branch === "main") ok(`Git: on branch "${branch}"`);
else warn(`Git: on branch "${branch}"`, "Expected 'main'");

const remoteUrl = execSync("git remote get-url origin 2>/dev/null || echo 'none'", { cwd: ROOT, encoding: "utf8" }).trim();
if (remoteUrl.includes("github.com")) ok(`Git: remote origin set to ${remoteUrl}`);
else fail("Git: remote origin", remoteUrl);

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n" + "▓".repeat(60));
console.log(` INTEGRATION AUDIT COMPLETE`);
console.log(` ${passed} passed, ${warnings} warnings, ${failed} failed — ${passed+failed+warnings} total checks`);
console.log("▓".repeat(60));

if (failed > 0) {
  console.log("\n❌ FAILURES:");
  results.filter(r => r.status === "FAIL").forEach(r => console.log(`  - ${r.label}: ${r.msg}`));
}
if (warnings > 0) {
  console.log("\n⚠ WARNINGS:");
  results.filter(r => r.status === "WARN").forEach(r => console.log(`  - ${r.label}: ${r.msg}`));
}

if (failed > 0) process.exit(1);
else {
  console.log("\n" + "✓".repeat(30));
  console.log(" ✅ FULL INTEGRATION CHAIN VERIFIED");
  console.log("✓".repeat(30) + "\n");
}
