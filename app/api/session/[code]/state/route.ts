import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { PUBLIC_PLAYER_COLUMNS, PUBLIC_SESSION_COLUMNS } from "@/lib/session";

// Sessiya holati + ishtirokchilar (qayta ulanish va boshlang'ich yuklash uchun)
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^\d{6}$/.test(code)) return NextResponse.json({ error: "invalid_code" }, { status: 400 });

  const admin = createAdminClient();
  const { data: session } = await admin.from("sessions").select(PUBLIC_SESSION_COLUMNS).eq("code", code).maybeSingle();
  if (!session) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { data: players } = await admin
    .from("players")
    .select(PUBLIC_PLAYER_COLUMNS)
    .eq("session_id", session.id)
    .order("joined_at");

  return NextResponse.json({ session, players: players ?? [] });
}
