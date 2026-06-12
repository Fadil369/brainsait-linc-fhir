import { handleSummary, handlePriorAuth, handleGapsInCare,
  handleMedicationSafety, handleCarePlanNavigator, handleClinicalTrials,
  handleReadmissionRisk, handleTriage, handleImagingFollowup,
  handleLabExplainer, handleNLQuery, handleSDOHReferral,
} from "./agents/ai-handler.js";

const AGENTS = {
  summary: { fn: handleSummary, label: "Patient Summary" },
  "prior-auth": { fn: handlePriorAuth, label: "Prior Auth" },
  "gaps-in-care": { fn: handleGapsInCare, label: "Gaps in Care" },
  "medication-safety": { fn: handleMedicationSafety, label: "Medication Safety" },
  "care-plan": { fn: handleCarePlanNavigator, label: "Care Plan" },
  "clinical-trials": { fn: handleClinicalTrials, label: "Clinical Trials" },
  "readmission-risk": { fn: handleReadmissionRisk, label: "Readmission Risk" },
  triage: { fn: handleTriage, label: "Triage" },
  "imaging-followup": { fn: handleImagingFollowup, label: "Imaging Follow-up" },
  "lab-explainer": { fn: handleLabExplainer, label: "Lab Explainer" },
  "nl-query": { fn: handleNLQuery, label: "NL Query" },
  "sdoh-referral": { fn: handleSDOHReferral, label: "SDOH Referral" },
};

const COMMANDS = [
  { command: "start", description: "Start BrainSAIT Healthcare AI" },
  { command: "help", description: "Show available commands" },
  { command: "summary", description: "Generate patient summary (ID 1)" },
  { command: "triage", description: "Triage assessment" },
  { command: "meds", description: "Medication safety check" },
  { command: "gaps", description: "Identify care gaps" },
  { command: "plan", description: "Generate care plan" },
  { command: "labs", description: "Explain lab results" },
  { command: "risk", description: "Readmission risk score" },
  { command: "auth", description: "Prior authorization eval" },
  { command: "trials", description: "Clinical trial matching" },
  { command: "imaging", description: "Imaging follow-up" },
  { command: "sdoh", description: "SDOH referrals" },
  { command: "query", description: "Ask about a patient" },
];

function makeFakeRequest(body) {
  return new Request("http://localhost/api/contest/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function callAgent(agentKey, question, env) {
  const agent = AGENTS[agentKey];
  if (!agent) return "Unknown agent.";
  const fakeReq = makeFakeRequest({ patientId: "1", question: question || "" });
  try {
    const resp = await agent.fn(fakeReq, env);
    const data = await resp.json();
    const response = data.response || data.error || JSON.stringify(data, null, 2);
    return typeof response === "string" ? response : JSON.stringify(response, null, 2);
  } catch (err) {
    return `Error: ${err.message}`;
  }
}

function formatTelegram(text, maxLen = 4000) {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 20) + "\n\n... (truncated)";
}

async function sendMessage(token, chatId, text, replyTo) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: formatTelegram(text),
    parse_mode: "Markdown",
    ...(replyTo ? { reply_to_message_id: replyTo } : {}),
  };
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function sendChatAction(token, chatId, action = "typing") {
  return fetch(`https://api.telegram.org/bot${token}/sendChatAction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action }),
  });
}

async function setWebhook(token, webhookUrl) {
  return fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      allowed_updates: ["message"],
      max_connections: 10,
    }),
  });
}

async function setCommands(token) {
  return fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commands: COMMANDS }),
  });
}

export async function handleTelegramWebhook(request, env) {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({ error: "TELEGRAM_BOT_TOKEN not configured" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  let update;
  try {
    update = await request.json();
  } catch {
    return new Response("OK");
  }

  if (!update.message?.text) return new Response("OK");

  const chatId = update.message.chat.id;
  const text = update.message.text.trim();
  const messageId = update.message.message_id;

  // Handle /start and /help
  if (text === "/start" || text === "/help") {
    const helpText = `🏥 *BrainSAIT Healthcare AI*

Available commands:
/summary — Patient summary
/triage — Triage assessment
/meds — Medication safety
/gaps — Care gaps
/plan — Care plan
/labs — Lab explainer
/risk — Readmission risk
/auth — Prior auth
/trials — Clinical trials
/imaging — Imaging follow-up
/sdoh — SDOH referrals
/query <question> — Ask about a patient

Or send any message for triage-style analysis.`;
    await sendMessage(token, chatId, helpText);
    return new Response("OK");
  }

  // Handle commands
  await sendChatAction(token, chatId);

  let agentKey = null;
  let question = null;

  if (text.startsWith("/")) {
    const cmd = text.split(" ")[0].slice(1).toLowerCase();
    const rest = text.split(" ").slice(1).join(" ");
    if (cmd === "query") {
      agentKey = "nl-query";
      question = rest || "Show patient overview";
    } else if (cmd === "meds") {
      agentKey = "medication-safety";
    } else if (cmd === "plan") {
      agentKey = "care-plan";
    } else if (cmd === "labs") {
      agentKey = "lab-explainer";
    } else if (cmd === "risk") {
      agentKey = "readmission-risk";
    } else if (cmd === "auth") {
      agentKey = "prior-auth";
    } else if (cmd === "trials") {
      agentKey = "clinical-trials";
    } else if (AGENTS[cmd]) {
      agentKey = cmd;
    }
  } else {
    // Free text → triage
    agentKey = "triage";
    question = text;
  }

  if (!agentKey) {
    await sendMessage(token, chatId, "Unknown command. Send /help for options.");
    return new Response("OK");
  }

  const result = await callAgent(agentKey, question, env);
  const label = AGENTS[agentKey]?.label || agentKey;
  await sendMessage(token, chatId, `*${label}*\n\n${result}`, messageId);

  return new Response("OK");
}

export async function handleTelegramSetup(request, env) {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({ error: "TELEGRAM_BOT_TOKEN not configured" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const baseUrl = url.origin;
  const webhookUrl = `${baseUrl}/api/telegram/webhook`;

  const [webhookResp, commandsResp] = await Promise.all([
    setWebhook(token, webhookUrl),
    setCommands(token),
  ]);

  const webhook = await webhookResp.json();
  const commands = await commandsResp.json();

  return new Response(JSON.stringify({
    webhook: webhook.ok ? "configured" : webhook,
    commands: commands.ok ? "configured" : commands,
    webhookUrl,
  }), {
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}
