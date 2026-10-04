import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { createClient } from "@/lib/supabase/server";
import { answerSummary, TASK_TYPES } from "@/lib/tasks";
import { uz } from "@/lib/i18n/uz";
import type { Quiz, Task } from "@/types";
import { deleteQuiz, deleteTask, moveTask } from "../actions";
import { QuizForm } from "../QuizForms";

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: quiz }, { data: taskRows }] = await Promise.all([
    supabase.from("quizzes").select("*").eq("id", id).maybeSingle(),
    supabase.from("tasks").select("*").eq("quiz_id", id).order("order_index"),
  ]);
  if (!quiz) notFound();
  const tasks = (taskRows ?? []) as Task[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/quizzes" className="text-sm text-muted hover:text-foreground">
            ← {uz.quizzes.title}
          </Link>
          <h1 className="mt-1 text-3xl font-bold">{quiz.title}</h1>
        </div>
        {tasks.length > 0 && (
          <Link href={`/quizzes/${id}/preview`} className={buttonClass("secondary")}>
            {uz.quizzes.preview}
          </Link>
        )}
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">{uz.quizzes.settings}</h2>
        <QuizForm quiz={quiz as Quiz} />
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">
          {uz.quizzes.tasks} <span className="text-muted">({tasks.length})</span>
        </h2>
        {tasks.length === 0 ? (
          <p className="text-muted">{uz.quizzes.noTasks}</p>
        ) : (
          <ol className="divide-y divide-border">
            {tasks.map((t, i) => (
              <li key={t.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-background font-mono text-sm">
                    {t.order_index}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">{t.title}</p>
                    <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-muted">
                      <span className="text-primary">{uz.taskTypes[t.type]}</span>
                      <span>{uz.quizzes.points(t.points)}</span>
                      <span className="truncate">✓ {answerSummary(t)}</span>
                    </p>
                  </div>
                </div>
                <form className="flex shrink-0 flex-wrap gap-1">
                  <button
                    formAction={moveTask.bind(null, id, t.id, "up")}
                    disabled={i === 0}
                    aria-label={uz.common.moveUp}
                    className={buttonClass("ghost", "px-3")}
                  >
                    ↑
                  </button>
                  <button
                    formAction={moveTask.bind(null, id, t.id, "down")}
                    disabled={i === tasks.length - 1}
                    aria-label={uz.common.moveDown}
                    className={buttonClass("ghost", "px-3")}
                  >
                    ↓
                  </button>
                  <Link href={`/quizzes/${id}/tasks/${t.id}`} className={buttonClass("secondary")}>
                    {uz.common.edit}
                  </Link>
                  <ConfirmButton formAction={deleteTask.bind(null, id, t.id)} variant="ghost">
                    {uz.common.delete}
                  </ConfirmButton>
                </form>
              </li>
            ))}
          </ol>
        )}

        <h3 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-muted">{uz.quizzes.addTask}</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {TASK_TYPES.map((type) => (
            <Link
              key={type}
              href={`/quizzes/${id}/tasks/new?type=${type}`}
              className="rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary"
            >
              <p className="font-semibold">+ {uz.taskTypes[type]}</p>
              <p className="mt-1 text-xs text-muted">{uz.taskTypeHints[type]}</p>
            </Link>
          ))}
        </div>
      </Card>

      <form className="self-start">
        <ConfirmButton formAction={deleteQuiz.bind(null, id)}>{uz.quizzes.deleteQuiz}</ConfirmButton>
      </form>
    </div>
  );
}
