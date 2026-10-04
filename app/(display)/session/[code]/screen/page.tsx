import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { joinUrlFor, PUBLIC_PLAYER_COLUMNS, qrDataUrl } from "@/lib/session";
import type { Player, SessionStatus } from "@/types";
import { ScreenLobby } from "./ScreenLobby";

// Projektor ekrani: login talab qilinmaydi, faqat ko'rish rejimi
export default async function ScreenPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^\d{6}$/.test(code)) notFound();

  const admin = createAdminClient();
  const { data: session } = await admin.from("sessions").select("id, status").eq("code", code).maybeSingle();
  if (!session) notFound();

  const { data: players } = await admin
    .from("players")
    .select(PUBLIC_PLAYER_COLUMNS)
    .eq("session_id", session.id)
    .order("joined_at");

  const joinUrl = await joinUrlFor(code);

  return (
    <ScreenLobby
      code={code}
      sessionId={session.id}
      status={session.status as SessionStatus}
      joinUrl={joinUrl}
      qr={await qrDataUrl(joinUrl)}
      initialPlayers={(players ?? []) as Player[]}
    />
  );
}
