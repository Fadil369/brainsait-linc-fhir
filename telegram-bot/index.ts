import { Hono } from "hono";
import type { Browser } from "@cloudflare/puppeteer";
import {
  sendTelegramMessage,
  sendTelegramPhoto,
  sendInlineKeyboard,
  answerCallbackQuery,
  sendChannelMessage,
} from "./telegram";
import { launchBrowser, getCourses, getNotesAndDrawings } from "./browser";
import { saveCookies, loadCookies, clearCookies, saveSession, loadSession } from "./storage";

export interface Env {
  MYBROWSER: Fetcher;
  SESSION_KV: KVNamespace;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_WEBHOOK_SECRET: string;
  ALLOWED_USERS: string;
  BRAINSAIT_CHANNEL: string;
  DRNAJEEB_LOGIN_URL: string;
  DRNAJEEB_COURSES_URL: string;
  DRNAJEEB_NOTES_URL: string;
}

const app = new Hono<{ Bindings: Env }>();

// Rate limiting
const rateLimitMap = new Map<number, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 10;

// Channel ID for @brainsait
const BRAINSAIT_CHANNEL_ID = -1002047131363;

// Proactive keywords to respond to
const HEALTH_KEYWORDS = [
  "health", "medical", "doctor", "hospital", "medicine", "treatment",
  "diagnosis", "symptom", "disease", "patient", "clinical", "fhir",
  "nphies", "insurance", "claim", "lab", "test", "result", "prescription",
  "medication", "surgery", "emergency", "care", "wellness", "prevention",
  "diabetes", "hypertension", "heart", "kidney", "cancer", "covid",
  "vaccine", "immunization", "screening", "checkup", "appointment"
];

// Medical tips database
const MEDICAL_TIPS = [
  "💊 Did you know? Regular health screenings can detect conditions early when they're most treatable.",
  "🏥 Reminder: Keep your vaccination records up to date. Check your immunization schedule!",
  "📋 Health Tip: Always bring a list of your current medications to doctor appointments.",
  "🩺 Prevention is better than cure! Schedule your annual checkup today.",
  "💉 Flu season is coming! Get your flu vaccine to protect yourself and others.",
  "🧬 Family health history matters. Share it with your healthcare provider.",
  "❤️ Heart health: 30 minutes of daily exercise can reduce cardiovascular risk by up to 30%.",
  "🍎 Nutrition tip: A balanced diet with fruits, vegetables, and whole grains supports immune health.",
  "😴 Sleep is crucial for health. Adults need 7-9 hours of quality sleep each night.",
  "🧠 Mental health matters. Don't hesitate to seek help if you're feeling overwhelmed."
];

// UI Constants
const BUTTONS = {
  main: [
    [{ text: "📚 My Courses", callback_data: "courses" }, { text: "📝 Notes & Drawings", callback_data: "notes" }],
    [{ text: "🔐 Login", callback_data: "login" }, { text: "📊 Status", callback_data: "status" }],
    [{ text: "📸 Screenshot", callback_data: "screenshot" }, { text: "🧹 Clear Cache", callback_data: "clear" }],
    [{ text: "🏥 Health Tips", callback_data: "health_tips" }, { text: "❓ Help", callback_data: "help" }],
  ],
  back: [[{ text: "🔙 Back to Menu", callback_data: "menu" }]],
  login: [
    [{ text: "🌐 Open Login Page", callback_data: "do_login" }],
    [{ text: "🔙 Back to Menu", callback_data: "menu" }],
  ],
  channel: [
    [{ text: "🤖 Start Bot", url: "https://t.me/brainsait_bot" }],
    [{ text: "📚 View Courses", callback_data: "courses" }, { text: "🏥 Health Tips", callback_data: "health_tips" }],
  ],
};

// Health check
app.get("/", (c) => c.json({ status: "ok", bot: "brainsait-bot", version: "4.0.0" }));
app.get("/health", async (c) => c.json({ status: "ok", kv: await checkKVHealth(c.env) }));

// Webhook handler
app.post("/webhook", async (c) => {
  try {
    const secret = c.req.header("X-Telegram-Bot-Api-Secret-Token");
    if (secret !== c.env.TELEGRAM_WEBHOOK_SECRET) return c.json({ error: "Unauthorized" }, 401);

    const update = await c.req.json().catch(() => null);
    if (!update) return c.json({ error: "Invalid JSON" }, 400);

    // Handle callback queries (button clicks)
    if (update.callback_query) {
      await handleCallback(update.callback_query, c.env);
      return c.json({ ok: true });
    }

    // Handle channel posts (proactive responses)
    if (update.channel_post) {
      await handleChannelPost(update.channel_post, c.env);
      return c.json({ ok: true });
    }

    // Handle messages
    const message = update?.message;
    if (!message?.text) return c.json({ ok: true });

    const chatId = message.chat.id;
    const userId = message.from?.id?.toString();
    const text = message.text.trim();

    // Auth check for private chats
    if (message.chat.type === "private") {
      const allowedUsers = c.env.ALLOWED_USERS.split(",").map((u) => u.trim());
      if (allowedUsers.length > 0 && !allowedUsers.includes(userId || "")) {
        return c.json({ ok: true, skip: "unauthorized" });
      }
    }

    // Rate limit
    if (!checkRateLimit(parseInt(userId || "0"))) {
      await sendTelegramMessage(chatId, "⏳ Please wait a moment...", c.env);
      return c.json({ ok: true });
    }

    // Command handling
    if (text === "/start" || text === "/menu") {
      await showMainMenu(chatId, c.env);
    } else if (text === "/login") {
      await handleLogin(chatId, c.env);
    } else if (text === "/courses") {
      await handleCourses(chatId, c.env);
    } else if (text === "/notes") {
      await handleNotes(chatId, c.env);
    } else if (text === "/status") {
      await handleStatus(chatId, c.env);
    } else if (text === "/health_tips" || text === "/healthtips") {
      await sendHealthTip(chatId, c.env);
    } else if (text === "/about") {
      await sendAboutInfo(chatId, c.env);
    } else {
      // Check if message contains health keywords
      const containsHealthKeyword = HEALTH_KEYWORDS.some(kw => 
        text.toLowerCase().includes(kw)
      );
      
      if (containsHealthKeyword) {
        await sendHealthTip(chatId, c.env);
      } else {
        await showMainMenu(chatId, c.env);
      }
    }

    return c.json({ ok: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Handle channel posts - proactive responses
async function handleChannelPost(post: any, env: Env) {
  const chatId = post.chat?.id;
  const text = post.text || post.caption || "";
  const messageId = post.message_id;

  if (!chatId) return;

  // Only respond to @brainsait channel
  if (chatId !== BRAINSAIT_CHANNEL_ID) return;

  // Check if post contains health-related keywords
  const containsHealthKeyword = HEALTH_KEYWORDS.some(kw => 
    text.toLowerCase().includes(kw)
  );

  if (containsHealthKeyword) {
    // Send a helpful reply with health tip
    const tip = MEDICAL_TIPS[Math.floor(Math.random() * MEDICAL_TIPS.length)];
    
    const responseText = [
      tip,
      "",
      "💡 Want to learn more? Visit our healthcare platform:",
      "🌐 https://brainsait-linc-fhir.pages.dev",
      "",
      "🤖 Or start our bot: @brainsait_bot",
    ].join("\n");

    await sendChannelMessage(chatId, responseText, env, messageId);
  }

  // Respond to specific topics
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes("fhir") || lowerText.includes("health data")) {
    await sendChannelMessage(chatId, 
      "📊 *FHIR Integration*\n\nBrainSAIT supports full FHIR R4 integration with:\n• Patient records\n• Clinical data\n• Lab results\n• Medications\n\nLearn more: @brainsait_bot",
      env, messageId, "MarkdownV2"
    );
  }
  
  if (lowerText.includes("nphies") || lowerText.includes("insurance")) {
    await sendChannelMessage(chatId,
      "🏥 *NPHIES Integration*\n\nOur platform integrates with Saudi NPHIES for:\n• Claims processing\n• Eligibility verification\n• Prior authorization\n\nTry it: @brainsait_bot",
      env, messageId, "MarkdownV2"
    );
  }
  
  if (lowerText.includes("ai") || lowerText.includes("artificial intelligence")) {
    await sendChannelMessage(chatId,
      "🤖 *AI-Powered Healthcare*\n\nBrainSAIT uses AI for:\n• 12 specialized healthcare agents\n• Clinical decision support\n• Patient summaries\n• Medication safety\n\nExplore: @brainsait_bot",
      env, messageId, "MarkdownV2"
    );
  }
}

// Handle callback queries
async function handleCallback(callback: any, env: Env) {
  const chatId = callback.message?.chat?.id;
  const data = callback.data;
  const callbackId = callback.id;

  if (!chatId) return;

  await answerCallbackQuery(callbackId, env);

  switch (data) {
    case "menu":
      await showMainMenu(chatId, env);
      break;
    case "courses":
      await handleCourses(chatId, env);
      break;
    case "notes":
      await handleNotes(chatId, env);
      break;
    case "login":
      await showLoginMenu(chatId, env);
      break;
    case "do_login":
      await handleLogin(chatId, env);
      break;
    case "status":
      await handleStatus(chatId, env);
      break;
    case "screenshot":
      await handleScreenshot(chatId, env);
      break;
    case "clear":
      await handleClearCache(chatId, env);
      break;
    case "help":
      await showHelp(chatId, env);
      break;
    case "health_tips":
      await sendHealthTip(chatId, env);
      break;
  }
}

// Show main menu
async function showMainMenu(chatId: number, env: Env) {
  const session = await loadSession(env);
  const statusEmoji = session?.status === "logged_in" ? "🟢" : "🔴";
  const statusText = session?.status === "logged_in" ? "Connected" : "Not connected";

  const text = [
    "🏥 *BrainSAIT Healthcare*",
    "",
    `${statusEmoji} Status: ${statusText}`,
    "",
    "Choose an action below:",
  ].join("\n");

  await sendInlineKeyboard(chatId, text, BUTTONS.main, env, "MarkdownV2");
}

// Show login menu
async function showLoginMenu(chatId: number, env: Env) {
  const text = [
    "🔐 *Login to Dr\\. Najeeb*",
    "",
    "Access your courses and notes.",
    "Tap below to open the login page.",
  ].join("\n");

  await sendInlineKeyboard(chatId, text, BUTTONS.login, env, "MarkdownV2");
}

// Show help
async function showHelp(chatId: number, env: Env) {
  const text = [
    "❓ *Available Commands*",
    "",
    "📚 /courses \\- View your courses",
    "📝 /notes \\- Access notes & drawings",
    "🔐 /login \\- Sign in with Google",
    "📊 /status \\- Check connection",
    "🏥 /health\\_tips \\- Get health tips",
    "ℹ️ /about \\- About BrainSAIT",
    "",
    "💡 *Pro tip:* The bot auto\\-responds to health topics\\!",
  ].join("\n");

  await sendInlineKeyboard(chatId, text, BUTTONS.back, env, "MarkdownV2");
}

// Send health tip
async function sendHealthTip(chatId: number, env: Env) {
  const tip = MEDICAL_TIPS[Math.floor(Math.random() * MEDICAL_TIPS.length)];
  
  const text = [
    "🏥 *Health Tip*",
    "",
    tip,
    "",
    "📚 Learn more at our platform:",
    "🌐 https://brainsait-linc-fhir.pages.dev",
  ].join("\n");

  await sendInlineKeyboard(chatId, text, BUTTONS.back, env, "MarkdownV2");
}

// Send about info
async function sendAboutInfo(chatId: number, env: Env) {
  const text = [
    "ℹ️ *About BrainSAIT*",
    "",
    "🏥 Enterprise AI\\-FHIR Healthcare Platform",
    "",
    "✅ 12 AI Healthcare Agents",
    "✅ FHIR R4 Integration",
    "✅ NPHIES Support",
    "✅ Bilingual (Arabic/English)",
    "",
    "🌐 Website: brainsait-linc-fhir.pages.dev",
    "📢 Channel: @brainsait",
    "🤖 Bot: @brainsait_bot",
  ].join("\n");

  await sendInlineKeyboard(chatId, text, BUTTONS.back, env, "MarkdownV2");
}

// Login handler
async function handleLogin(chatId: number, env: Env) {
  await sendTelegramMessage(chatId, "🔄 Opening login page...", env);

  let browser: Browser | null = null;
  try {
    browser = await launchBrowser(env);
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(env.DRNAJEEB_LOGIN_URL, { waitUntil: "networkidle0", timeout: 30000 });

    const screenshot = await page.screenshot({ type: "png", fullPage: false });

    const caption = [
      "📸 *Login Page*",
      "",
      "1️⃣ Open link in browser",
      "2️⃣ Sign in with Google",
      "3️⃣ Return and tap *My Courses*",
    ].join("\n");

    await sendInlineKeyboard(chatId, screenshot, BUTTONS.back, env, "MarkdownV2", true);
    await saveCookies(env, []);
    await saveSession(env, { status: "awaiting_login", timestamp: Date.now() });
  } catch (error: any) {
    await sendTelegramMessage(chatId, `❌ Error: ${error.message}`, env);
  } finally {
    if (browser) await browser.close();
  }
}

// Courses handler
async function handleCourses(chatId: number, env: Env) {
  await sendTelegramMessage(chatId, "📚 Fetching courses...", env);

  let browser: Browser | null = null;
  try {
    browser = await launchBrowser(env);
    const page = await browser.newPage();

    const cookies = await loadCookies(env);
    if (cookies?.length) await page.setCookie(...cookies);

    await page.goto(env.DRNAJEEB_COURSES_URL, { waitUntil: "networkidle0", timeout: 30000 });

    if (page.url().includes("login")) {
      await sendInlineKeyboard(chatId, "⚠️ *Not logged in*\n\nPlease login first\\. 🔐", BUTTONS.login, env, "MarkdownV2");
      return;
    }

    await saveCookies(env, await page.cookies());
    const courses = await getCourses(page);

    if (!courses.length) {
      await sendInlineKeyboard(chatId, "📭 No courses found", BUTTONS.back, env);
      return;
    }

    const lines = ["📚 *Your Courses:*", ""];
    courses.forEach((c, i) => {
      lines.push(`${i + 1}\\. *${escapeMd(c.title)}*`);
      if (c.progress) lines.push(`   📊 ${escapeMd(c.progress)}`);
      lines.push("");
    });

    await sendInlineKeyboard(chatId, lines.join("\n"), BUTTONS.back, env, "MarkdownV2");
    await saveSession(env, { status: "logged_in", lastCoursesFetch: Date.now(), courseCount: courses.length });
  } catch (error: any) {
    await sendTelegramMessage(chatId, `❌ Error: ${error.message}`, env);
  } finally {
    if (browser) await browser.close();
  }
}

// Notes handler
async function handleNotes(chatId: number, env: Env) {
  await sendTelegramMessage(chatId, "📝 Fetching notes...", env);

  let browser: Browser | null = null;
  try {
    browser = await launchBrowser(env);
    const page = await browser.newPage();

    const cookies = await loadCookies(env);
    if (cookies?.length) await page.setCookie(...cookies);

    await page.goto(env.DRNAJEEB_NOTES_URL, { waitUntil: "networkidle0", timeout: 30000 });

    if (page.url().includes("login")) {
      await sendInlineKeyboard(chatId, "⚠️ *Not logged in*\n\nPlease login first\\. 🔐", BUTTONS.login, env, "MarkdownV2");
      return;
    }

    await saveCookies(env, await page.cookies());
    const notes = await getNotesAndDrawings(page);

    if (!notes.length) {
      await sendInlineKeyboard(chatId, "📭 No notes found", BUTTONS.back, env);
      return;
    }

    const lines = ["📝 *Notes & Drawings:*", ""];
    notes.forEach((n, i) => {
      lines.push(`${i + 1}\\. *${escapeMd(n.title)}*`);
      if (n.type) lines.push(`   📎 ${escapeMd(n.type)}`);
      lines.push("");
    });

    await sendInlineKeyboard(chatId, lines.join("\n"), BUTTONS.back, env, "MarkdownV2");

    const screenshot = await page.screenshot({ type: "png", fullPage: true });
    await sendTelegramPhoto(chatId, screenshot, "📸 Notes page", env);

    await saveSession(env, { status: "logged_in", lastNotesFetch: Date.now(), notesCount: notes.length });
  } catch (error: any) {
    await sendTelegramMessage(chatId, `❌ Error: ${error.message}`, env);
  } finally {
    if (browser) await browser.close();
  }
}

// Status handler
async function handleStatus(chatId: number, env: Env) {
  const session = await loadSession(env);
  const cookies = await loadCookies(env);

  if (!session || !cookies?.length) {
    await sendInlineKeyboard(chatId, "🔴 *Not connected*\n\nTap Login to start\\. 🔐", BUTTONS.login, env, "MarkdownV2");
    return;
  }

  const lastActivity = session.lastCoursesFetch || session.lastNotesFetch;
  const timeAgo = lastActivity ? getTimeAgo(lastActivity) : "never";

  const text = [
    "📊 *Connection Status*",
    "",
    `🟢 Status: *${escapeMd(session.status)}*`,
    `⏰ Last active: *${escapeMd(timeAgo)}*`,
    `🍪 Cookies: *${cookies.length}*`,
    session.courseCount ? `📚 Courses: *${session.courseCount}*` : "",
    session.notesCount ? `📝 Notes: *${session.notesCount}*` : "",
  ].filter(Boolean).join("\n");

  await sendInlineKeyboard(chatId, text, BUTTONS.back, env, "MarkdownV2");
}

// Screenshot handler
async function handleScreenshot(chatId: number, env: Env) {
  await sendTelegramMessage(chatId, "📸 Taking screenshot...", env);

  let browser: Browser | null = null;
  try {
    browser = await launchBrowser(env);
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(env.DRNAJEEB_COURSES_URL, { waitUntil: "networkidle0", timeout: 30000 });

    const screenshot = await page.screenshot({ type: "png", fullPage: false });
    await sendInlineKeyboard(chatId, screenshot, BUTTONS.back, env, undefined, true);
  } catch (error: any) {
    await sendTelegramMessage(chatId, `❌ Error: ${error.message}`, env);
  } finally {
    if (browser) await browser.close();
  }
}

// Clear cache handler
async function handleClearCache(chatId: number, env: Env) {
  await clearCookies(env);
  await sendInlineKeyboard(chatId, "🧹 *Cache cleared\\!*", BUTTONS.back, env, "MarkdownV2");
}

// Helpers
function escapeMd(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

function getTimeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function checkRateLimit(userId: number): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(userId);
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (limit.count >= RATE_LIMIT_MAX) return false;
  limit.count++;
  return true;
}

async function checkKVHealth(env: Env): Promise<string> {
  try {
    await env.SESSION_KV.put("health_check", "ok", { expirationTtl: 60 });
    await env.SESSION_KV.delete("health_check");
    return "healthy";
  } catch {
    return "unhealthy";
  }
}

export default app;
