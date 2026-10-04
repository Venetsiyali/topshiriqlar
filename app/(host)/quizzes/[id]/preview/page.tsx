import Link from "next/link";
import { notFound } from "next/navigation";
import { TaskPreview } from "@/components/host/TaskPreview";
import { createClient } from "@/lib/supabase/server";
import { answerSummary, toPublicTask } from "@/lib/tasks";
import { uz } from "@/lib/i18n/uz";
import type { Task } from "@/types";

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: quiz }, { data: taskRows }] = await Promise.all([
    supabase.from("quizzes").select("id, title").eq("id", id).maybeSingle(),
    supabase.from("tasks").select("*").eq("quiz_id", id).order("order_index"),
  ]);
  if (!quiz) notFound();
  const tasks = (taskRows ?? []) as Task[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/quizzes/${id}`} className="text-sm text-muted hover:text-foreground">
          ← {quiz.title}
        </Link>
        <h1 className="mt-1 text-3xl font-bold">{uz.preview.title}</h1>
        <p className="mt-1 text-muted">{uz.preview.subtitle}</p>
      </div>

      {tasks.length === 0 ? (
        <p className="text-muted">{uz.preview.noTasks}</p>
      ) : (
        <div className="grid gap-10 lg:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <div key={task.id} className="flex flex-col gap-3">
              <TaskPreview task={toPublicTask(task)} total={tasks.length} />
              <p className="mx-auto max-w-sm text-center text-sm">
                <span className="text-muted">
                  {uz.taskTypes[task.type]} · {uz.preview.correct}:
                </span>{" "}
                <span className="font-semibold text-green-400">{answerSummary(task)}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
