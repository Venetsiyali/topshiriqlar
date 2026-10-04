import Link from "next/link";
import { notFound } from "next/navigation";
import { TaskForm } from "@/components/host/TaskForm";
import { createClient } from "@/lib/supabase/server";
import { isTaskType } from "@/lib/tasks";
import { uz } from "@/lib/i18n/uz";
import { createTask } from "../../../actions";

export default async function NewTaskPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const [{ id }, { type }] = await Promise.all([params, searchParams]);
  if (!isTaskType(type)) notFound();

  const supabase = await createClient();
  const { data: quiz } = await supabase.from("quizzes").select("id, title").eq("id", id).maybeSingle();
  if (!quiz) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <Link href={`/quizzes/${id}`} className="text-sm text-muted hover:text-foreground">
          ← {quiz.title}
        </Link>
        <h1 className="mt-1 text-2xl font-bold">{uz.taskForm.newTitle(uz.taskTypes[type])}</h1>
      </div>
      <TaskForm type={type} backHref={`/quizzes/${id}`} action={createTask.bind(null, id)} />
    </div>
  );
}
