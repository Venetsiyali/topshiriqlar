"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sampleTasks } from "@/lib/seed/sampleQuiz";
import { toStoredPayload } from "@/lib/tasks";
import { uz } from "@/lib/i18n/uz";
import { firstError, quizSchema, taskInputSchema, type TaskInput } from "@/lib/validators";

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

function toRow(input: TaskInput) {
  return {
    type: input.type,
    title: input.title,
    hint: input.hint,
    points: input.points,
    time_limit_sec: input.timeLimitSec,
    payload: toStoredPayload(input),
  };
}

// ---------- To'plamlar ----------

export async function createQuiz(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = quizSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("quizzes")
    .insert({ ...parsed.data, owner_id: user.id })
    .select("id")
    .single();
  if (error) return { error: error.message };

  redirect(`/quizzes/${data.id}`);
}

export async function updateQuiz(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = quizSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { supabase } = await requireUser();
  const { error } = await supabase.from("quizzes").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/quizzes/${id}`);
  revalidatePath("/quizzes");
  return { ok: true };
}

export async function deleteQuiz(id: string) {
  const { supabase } = await requireUser();
  await supabase.from("quizzes").delete().eq("id", id);
  revalidatePath("/quizzes");
  redirect("/quizzes");
}

export async function seedSampleQuiz() {
  const { supabase, user } = await requireUser();
  const { data: quiz, error } = await supabase
    .from("quizzes")
    .insert({ title: uz.quizzes.seedTitle, owner_id: user.id, is_template: true })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const rows = sampleTasks.map((t, i) => ({ ...toRow(t), quiz_id: quiz.id, order_index: i + 1 }));
  const { error: tasksError } = await supabase.from("tasks").insert(rows);
  if (tasksError) throw new Error(tasksError.message);

  redirect(`/quizzes/${quiz.id}`);
}

// ---------- Topshiriqlar ----------

function parseTask(formData: FormData) {
  try {
    return taskInputSchema.safeParse(JSON.parse(String(formData.get("data") ?? "")));
  } catch {
    return null;
  }
}

export async function createTask(quizId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = parseTask(formData);
  if (!parsed) return { error: uz.auth.genericError };
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { supabase } = await requireUser();
  const { data: last } = await supabase
    .from("tasks")
    .select("order_index")
    .eq("quiz_id", quizId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase
    .from("tasks")
    .insert({ ...toRow(parsed.data), quiz_id: quizId, order_index: (last?.order_index ?? 0) + 1 });
  if (error) return { error: error.message };

  revalidatePath(`/quizzes/${quizId}`);
  redirect(`/quizzes/${quizId}`);
}

export async function updateTask(
  quizId: string,
  taskId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = parseTask(formData);
  if (!parsed) return { error: uz.auth.genericError };
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { supabase } = await requireUser();
  const { error } = await supabase.from("tasks").update(toRow(parsed.data)).eq("id", taskId).eq("quiz_id", quizId);
  if (error) return { error: error.message };

  revalidatePath(`/quizzes/${quizId}`);
  redirect(`/quizzes/${quizId}`);
}

export async function deleteTask(quizId: string, taskId: string) {
  const { supabase } = await requireUser();
  const { data: removed } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("quiz_id", quizId)
    .select("order_index")
    .maybeSingle();

  if (removed) {
    // Keyingi topshiriqlarni bittaga suramiz (o'sish tartibida — unique cheklov buzilmaydi)
    const { data: rest } = await supabase
      .from("tasks")
      .select("id, order_index")
      .eq("quiz_id", quizId)
      .gt("order_index", removed.order_index)
      .order("order_index");
    for (const t of rest ?? []) {
      await supabase.from("tasks").update({ order_index: t.order_index - 1 }).eq("id", t.id);
    }
  }

  revalidatePath(`/quizzes/${quizId}`);
}

export async function moveTask(quizId: string, taskId: string, direction: "up" | "down") {
  const { supabase } = await requireUser();
  const { data: current } = await supabase
    .from("tasks")
    .select("id, order_index")
    .eq("id", taskId)
    .eq("quiz_id", quizId)
    .single();
  if (!current) return;

  const target = current.order_index + (direction === "up" ? -1 : 1);
  const { data: other } = await supabase
    .from("tasks")
    .select("id, order_index")
    .eq("quiz_id", quizId)
    .eq("order_index", target)
    .maybeSingle();
  if (!other) return;

  // unique (quiz_id, order_index) sababli vaqtinchalik qiymat orqali almashtiramiz
  await supabase.from("tasks").update({ order_index: -1 }).eq("id", current.id);
  await supabase.from("tasks").update({ order_index: current.order_index }).eq("id", other.id);
  await supabase.from("tasks").update({ order_index: target }).eq("id", current.id);

  revalidatePath(`/quizzes/${quizId}`);
}
