"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { firstError, groupSchema } from "@/lib/validators";

export interface FormState {
  error?: string;
  ok?: boolean;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function createGroup(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = groupSchema.safeParse({
    name: formData.get("name"),
    subject: formData.get("subject") ?? undefined,
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("groups").insert({ ...parsed.data, owner_id: user.id });
  if (error) return { error: error.message };

  revalidatePath("/groups");
  return { ok: true };
}

export async function updateGroup(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = groupSchema.safeParse({
    name: formData.get("name"),
    subject: formData.get("subject") ?? undefined,
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { supabase } = await requireUser();
  const { error } = await supabase.from("groups").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/groups");
  return { ok: true };
}

export async function deleteGroup(id: string) {
  const { supabase } = await requireUser();
  await supabase.from("groups").delete().eq("id", id);
  revalidatePath("/groups");
}
