import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { isStickerId } from "@/lib/stickers";
import {
  hashDeviceToken,
  normalizeNickname,
  PUBLIC_PLAYER_COLUMNS,
  uniqueNickname,
} from "@/lib/session";
import type { SessionSettings } from "@/types";

const bodySchema = z.object({
  deviceToken: z.string().min(16).max(100),
  nickname: z.string().optional(),
  sticker: z.string().optional(),
});

/**
 * Talabani sessiyaga qo'shadi yoki (shu qurilmadan oldin kirgan bo'lsa) tiklaydi.
 * Faqat deviceToken yuborilsa — tiklashga urinadi; topilmasa { error: "needs_profile" }.
 */
export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^\d{6}$/.test(code)) return NextResponse.json({ error: "invalid_code" }, { status: 400 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  const { deviceToken, nickname: rawNickname, sticker } = parsed.data;

  const admin = createAdminClient();
  const { data: session } = await admin
    .from("sessions")
    .select("id, status, settings")
    .eq("code", code)
    .maybeSingle();
  if (!session) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const tokenHash = hashDeviceToken(deviceToken);

  // 1) Shu qurilma oldin kirganmi — progress tiklanadi
  const { data: existing } = await admin
    .from("players")
    .select(PUBLIC_PLAYER_COLUMNS)
    .eq("session_id", session.id)
    .eq("device_token", tokenHash)
    .maybeSingle();
  if (existing) {
    if (!existing.is_active) await admin.from("players").update({ is_active: true }).eq("id", existing.id);
    return NextResponse.json({ player: { ...existing, is_active: true }, restored: true });
  }

  if (session.status === "finished") return NextResponse.json({ error: "finished" }, { status: 410 });
  const settings = (session.settings ?? {}) as SessionSettings;
  if (session.status !== "lobby" && settings.allowLateJoin === false) {
    return NextResponse.json({ error: "late_join_disabled" }, { status: 403 });
  }

  // 2) Yangi ishtirokchi
  if (rawNickname === undefined) return NextResponse.json({ error: "needs_profile" }, { status: 404 });
  const nickname = normalizeNickname(rawNickname);
  if (!nickname) return NextResponse.json({ error: "invalid_nickname" }, { status: 422 });
  if (!isStickerId(sticker)) return NextResponse.json({ error: "invalid_sticker" }, { status: 422 });

  const { data: others } = await admin.from("players").select("nickname").eq("session_id", session.id);
  const finalName = uniqueNickname(
    nickname,
    (others ?? []).map((p) => p.nickname),
  );

  const { data: player, error } = await admin
    .from("players")
    .insert({ session_id: session.id, nickname: finalName, sticker, device_token: tokenHash })
    .select(PUBLIC_PLAYER_COLUMNS)
    .single();

  if (error) {
    // Bir vaqtda ikki marta yuborilgan bo'lsa — mavjudini qaytaramiz
    if (error.code === "23505") {
      const { data: again } = await admin
        .from("players")
        .select(PUBLIC_PLAYER_COLUMNS)
        .eq("session_id", session.id)
        .eq("device_token", tokenHash)
        .single();
      return NextResponse.json({ player: again, restored: true });
    }
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ player, restored: false, late: session.status !== "lobby" });
}
