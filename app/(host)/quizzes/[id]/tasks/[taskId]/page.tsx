import Link from "next/link";
import { notFound } from "next/navigation";
import { TaskForm } from "@/components/host/TaskForm";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/i18n/uz";
import type { Task } from "@/types";
import { updateTask } from "../../../actions";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string; taskId: string }> }) {
  const { id, taskId } = await params;
  const supabase = await createClient();

  const { data: task } = await supabase
    .from("tasks")
    .select("*, quizzes(title)")
    .eq("id", taskId)
    .eq("quiz_id", id)
    .maybeSingle();
  if (!task) notFound();

  const quizTitle = (task.quizzes as { title: string } | null)?.title ?? "";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <Link href={`/quizzes/${id}`} className="text-sm text-muted hover:text-foreground">
          ← {quizTitle}
        </Link>
        <h1 className="mt-1 text-2xl font-bold">
          {uz.taskForm.editTitle} · <span className="text-primary">{uz.taskTypes[(task as Task).type]}</span>
        </h1>
      </div>
      <TaskForm
        type={(task as Task).type}
        task={task as Task}
        backHref={`/quizzes/${id}`}
        action={updateTask.bind(null, id, taskId)}
      />
    </div>
  );
}
