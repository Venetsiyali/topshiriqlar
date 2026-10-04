"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createSessionForHost } from "@/lib/session";
import { uz } from "@/lib/i18n/uz";

export interface FormState {
  error?: string;
}

export async function createSession(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const quizId = String(formData.get("quizId") ?? "");
  const groupId = String(formData.get("groupId") ?? "") || null;
  const mode = formData.get("mode") === "sync" ? "sync" : "race";

  const result = await createSessionForHost(supabase, user.id, {
    quizId,
    groupId,
    mode,
    settings: {
      allowLateJoin: formData.get("allowLateJoin") === "on",
      showLeaderboard: formData.get("showLeaderboard") === "on",
    },
  });

  if ("error" in result) {
    if (result.error === "quiz_empty") return { error: uz.sessions.quizEmpty };
    if (result.error === "quiz_not_found") return { error: uz.sessions.quizNotFound };
    return { error: uz.sessions.createFailed };
  }

  redirect(`/session/${result.session.code}`);
}
