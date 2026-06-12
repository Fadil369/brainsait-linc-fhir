import type { Env } from "./index";

export interface SessionData {
  status: string;
  timestamp?: number;
  lastCoursesFetch?: number;
  lastNotesFetch?: number;
  courseCount?: number;
  notesCount?: number;
  initiatedBy?: number;
  error?: string;
}

const COOKIES_KEY = "drnajeeb:cookies";
const SESSION_KEY = "drnajeeb:session";

/**
 * Save browser cookies to KV
 */
export async function saveCookies(env: Env, cookies: any[]): Promise<void> {
  await env.SESSION_KV.put(COOKIES_KEY, JSON.stringify(cookies), {
    expirationTtl: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Load browser cookies from KV
 */
export async function loadCookies(env: Env): Promise<any[] | null> {
  const data = await env.SESSION_KV.get(COOKIES_KEY, "json");
  return data as any[] | null;
}

/**
 * Clear saved cookies from KV
 */
export async function clearCookies(env: Env): Promise<void> {
  await env.SESSION_KV.delete(COOKIES_KEY);
}

/**
 * Save session data to KV
 */
export async function saveSession(
  env: Env,
  session: SessionData
): Promise<void> {
  const existing = await loadSession(env);
  const merged = { ...existing, ...session };
  await env.SESSION_KV.put(SESSION_KEY, JSON.stringify(merged), {
    expirationTtl: 60 * 60 * 24 * 30, // 30 days
  });
}

/**
 * Load session data from KV
 */
export async function loadSession(env: Env): Promise<SessionData | null> {
  const data = await env.SESSION_KV.get(SESSION_KEY, "json");
  return data as SessionData | null;
}

/**
 * Clear session data from KV
 */
export async function clearSession(env: Env): Promise<void> {
  await env.SESSION_KV.delete(SESSION_KEY);
}
