import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/i18n/uz";
import { seedSampleQuiz } from "./actions";
import { QuizForm } from "./QuizForms";

export default async function QuizzesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quizzes")
    .select("id, title, description, tasks(count)")
    .order("created_at", { ascending: false });

  const quizzes = (data ?? []).map((q) => ({
    ...q,
    taskCount: (q.tasks as unknown as { count: number }[])[0]?.count ?? 0,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{uz.quizzes.title}</h1>
        <form action={seedSampleQuiz}>
          <button className={buttonClass("secondary")}>{uz.quizzes.seed}</button>
        </form>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">{uz.quizzes.newQuiz}</h2>
        <QuizForm />
      </Card>

      {quizzes.length === 0 ? (
        <Card>
          <p className="text-muted">{uz.quizzes.empty}</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {quizzes.map((q) => (
            <Link key={q.id} href={`/quizzes/${q.id}`} className="block">
              <Card className="h-full transition-colors hover:border-primary">
                <h3 className="text-lg font-semibold">{q.title}</h3>
                {q.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{q.description}</p>}
                <p className="mt-3 text-sm font-medium text-primary">{uz.quizzes.taskCount(q.taskCount)}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
