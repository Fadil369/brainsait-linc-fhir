import type { Env } from "./index";

const TELEGRAM_API = "https://api.telegram.org";

/**
 * Send a text message via Telegram Bot API
 */
export async function sendTelegramMessage(
  chatId: number,
  text: string,
  env: Env,
  parseMode?: string
): Promise<void> {
  const body: Record<string, any> = { chat_id: chatId, text };
  if (parseMode) body.parse_mode = parseMode;

  await fetch(`${TELEGRAM_API}/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * Send a message with inline keyboard
 */
export async function sendInlineKeyboard(
  chatId: number,
  text: string,
  buttons: Array<Array<{ text: string; callback_data: string }>>,
  env: Env,
  parseMode?: string,
  isPhoto?: boolean
): Promise<void> {
  const keyboard = { inline_keyboard: buttons };

  if (isPhoto) {
    // For photos, use sendPhoto with reply_markup
    const formData = new FormData();
    formData.append("chat_id", chatId.toString());
    formData.append("photo", new Blob([text as any]), "image.png");
    formData.append("reply_markup", JSON.stringify(keyboard));

    await fetch(`${TELEGRAM_API}/bot${env.TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: "POST",
      body: formData,
    });
  } else {
    const body: Record<string, any> = {
      chat_id: chatId,
      text,
      reply_markup: keyboard,
    };
    if (parseMode) body.parse_mode = parseMode;

    await fetch(`${TELEGRAM_API}/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }
}

/**
 * Answer a callback query to remove loading state
 */
export async function answerCallbackQuery(
  callbackQueryId: string,
  env: Env,
  text?: string
): Promise<void> {
  const body: Record<string, any> = { callback_query_id: callbackQueryId };
  if (text) body.text = text;

  await fetch(`${TELEGRAM_API}/bot${env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * Send a photo via Telegram Bot API
 */
export async function sendTelegramPhoto(
  chatId: number,
  photo: ArrayBuffer | Uint8Array,
  caption: string,
  env: Env,
  parseMode?: string
): Promise<void> {
  const formData = new FormData();
  formData.append("chat_id", chatId.toString());
  formData.append("photo", new Blob([photo as BlobPart]), "screenshot.png");
  formData.append("caption", caption);
  if (parseMode) formData.append("parse_mode", parseMode);

  await fetch(`${TELEGRAM_API}/bot${env.TELEGRAM_BOT_TOKEN}/sendPhoto`, {
    method: "POST",
    body: formData,
  });
}

/**
 * Send a document via Telegram Bot API
 */
export async function sendTelegramDocument(
  chatId: number,
  document: ArrayBuffer | Uint8Array,
  filename: string,
  caption: string,
  env: Env
): Promise<void> {
  const formData = new FormData();
  formData.append("chat_id", chatId.toString());
  formData.append("document", new Blob([document as BlobPart]), filename);
  formData.append("caption", caption);

  await fetch(`${TELEGRAM_API}/bot${env.TELEGRAM_BOT_TOKEN}/sendDocument`, {
    method: "POST",
    body: formData,
  });
}

/**
 * Send a message to a channel (for proactive responses)
 */
export async function sendChannelMessage(
  chatId: number,
  text: string,
  env: Env,
  replyToMessageId?: number,
  parseMode?: string
): Promise<void> {
  const body: Record<string, any> = {
    chat_id: chatId,
    text,
  };
  if (replyToMessageId) body.reply_to_message_id = replyToMessageId;
  if (parseMode) body.parse_mode = parseMode;

  await fetch(`${TELEGRAM_API}/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * Set the webhook for the Telegram bot
 */
export async function setTelegramWebhook(
  webhookUrl: string,
  secret: string,
  env: Env
): Promise<boolean> {
  const response = await fetch(`${TELEGRAM_API}/bot${env.TELEGRAM_BOT_TOKEN}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: secret,
      allowed_updates: ["message", "callback_query"],
    }),
  });

  const result = await response.json() as { ok: boolean };
  return result.ok;
}
