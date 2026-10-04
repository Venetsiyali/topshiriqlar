import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { joinUrlFor, PUBLIC_PLAYER_COLUMNS, qrDataUrl } from "@/lib/session";
import type { Player, SessionStatus } from "@/types";
import { HostLobby } from "./HostLobby";

export default async function HostSessionPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^\d{6}$/.test(code)) notFound();

  const supabase = await createClient();
  // RLS: faqat o'z sessiyasi
  const { data: session } = await supabase
    .from("sessions")
    .select("id, code, status, mode, quizzes(title), groups(name)")
    .eq("code", code)
    .maybeSingle();
  if (!session) notFound();

  const { data: players } = await supabase
    .from("players")
    .select(PUBLIC_PLAYER_COLUMNS)
    .eq("session_id", session.id)
    .order("joined_at");

  const joinUrl = await joinUrlFor(code);

  return (
    <HostLobby
      code={code}
      sessionId={session.id}
      status={session.status as SessionStatus}
      quizTitle={(session.quizzes as unknown as { title: string } | null)?.title ?? ""}
      groupName={(session.groups as unknown as { name: string } | null)?.name ?? null}
      joinUrl={joinUrl}
      qr={await qrDataUrl(joinUrl)}
      initialPlayers={(players ?? []) as Player[]}
    />
  );
}
