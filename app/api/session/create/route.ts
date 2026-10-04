import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createSessionForHost, joinUrlFor, qrDataUrl } from "@/lib/session";

const bodySchema = z.object({
  quizId: z.string().uuid(),
  groupId: z.string().uuid().nullable().optional(),
  mode: z.enum(["race", "sync"]).default("race"),
  settings: z.object({ showLeaderboard: z.boolean().optional(), allowLateJoin: z.boolean().optional() }).default({}),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const result = await createSessionForHost(supabase, user.id, { ...parsed.data, groupId: parsed.data.groupId ?? null });
  if ("error" in result) {
    const status = result.error === "quiz_not_found" ? 404 : result.error === "quiz_empty" ? 422 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }

  const joinUrl = await joinUrlFor(result.session.code);
  return NextResponse.json({
    code: result.session.code,
    sessionId: result.session.id,
    joinUrl,
    qrDataUrl: await qrDataUrl(joinUrl),
  });
}
