import "server-only";
import { createHash, randomInt } from "node:crypto";
import { headers } from "next/headers";
import QRCode from "qrcode";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SessionMode, SessionSettings } from "@/types";

/** Klientga yuboriladigan o'yinchi ustunlari (device_token yo'q). */
export const PUBLIC_PLAYER_COLUMNS =
  "id, session_id, nickname, sticker, score, current_task, finished_at, is_active, joined_at";

export const PUBLIC_SESSION_COLUMNS = "id, code, status, mode, started_at, finished_at, settings";

export const DEFAULT_SETTINGS: Required<SessionSettings> = { showLeaderboard: true, allowLateJoin: true };

export function hashDeviceToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function generatePin() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function joinUrlFor(code: string) {
  return `${await getAppUrl()}/play/${code}`;
}

export function qrDataUrl(url: string) {
  return QRCode.toDataURL(url, { width: 400, margin: 1, errorCorrectionLevel: "M" });
}

export interface CreateSessionInput {
  quizId: string;
  groupId: string | null;
  mode: SessionMode;
  settings: SessionSettings;
}

/**
 * Host nomidan sessiya yaratadi (RLS: host_id = auth.uid()).
 * PIN to'qnashsa (unique), boshqasi bilan qayta urinadi.
 */
export async function createSessionForHost(supabase: SupabaseClient, hostId: string, input: CreateSessionInput) {
  const { data: quiz } = await supabase.from("quizzes").select("id, tasks(count)").eq("id", input.quizId).maybeSingle();
  if (!quiz) return { error: "quiz_not_found" as const };
  const taskCount = (quiz.tasks as unknown as { count: number }[])[0]?.count ?? 0;
  if (taskCount === 0) return { error: "quiz_empty" as const };

  for (let attempt = 0; attempt < 8; attempt++) {
    const code = generatePin();
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        code,
        quiz_id: input.quizId,
        group_id: input.groupId,
        host_id: hostId,
        mode: input.mode,
        settings: { ...DEFAULT_SETTINGS, ...input.settings },
      })
      .select("id, code")
      .single();
    if (!error) return { session: data };
    if (error.code !== "23505") return { error: "db_error" as const, message: error.message };
  }
  return { error: "pin_exhausted" as const };
}

const NICKNAME_RE = /^[\p{L}'ʻʼ’‘ ]+$/u;

/** Ismni tozalaydi va tekshiradi: 2–20 belgi, faqat harf, tutuq va probel. */
export function normalizeNickname(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const name = raw.normalize("NFC").replace(/\s+/g, " ").trim();
  if (name.length < 2 || name.length > 20 || !NICKNAME_RE.test(name)) return null;
  return name;
}

/** Bir xil ism bo'lsa "Aziz (2)", "Aziz (3)" ... qaytaradi. */
export function uniqueNickname(name: string, taken: string[]) {
  const lower = new Set(taken.map((n) => n.toLocaleLowerCase()));
  if (!lower.has(name.toLocaleLowerCase())) return name;
  for (let n = 2; ; n++) {
    const candidate = `${name} (${n})`;
    if (!lower.has(candidate.toLocaleLowerCase())) return candidate;
  }
}
