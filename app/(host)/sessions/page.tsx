import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/i18n/uz";
import type { SessionStatus } from "@/types";
import { NewSessionForm } from "./NewSessionForm";

const STATUS_CLASS: Record<SessionStatus, string> = {
  lobby: "bg-blue-950 text-blue-300",
  running: "bg-green-950 text-green-300",
  paused: "bg-amber-950 text-amber-300",
  finished: "bg-slate-800 text-slate-400",
};

export default async function SessionsPage() {
  const supabase = await createClient();
  const [{ data: quizRows }, { data: groups }, { data: sessions }] = await Promise.all([
    supabase.from("quizzes").select("id, title, tasks(count)").order("created_at", { ascending: false }),
    supabase.from("groups").select("id, name").order("name"),
    supabase
      .from("sessions")
      .select("id, code, status, created_at, quizzes(title), groups(name), players(count)")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const quizzes = (quizRows ?? []).map((q) => ({
    id: q.id,
    title: q.title,
    taskCount: (q.tasks as unknown as { count: number }[])[0]?.count ?? 0,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">{uz.sessions.title}</h1>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">{uz.sessions.newSession}</h2>
        <NewSessionForm quizzes={quizzes} groups={groups ?? []} />
      </Card>

      <Card>
        {!sessions || sessions.length === 0 ? (
          <p className="text-muted">{uz.sessions.empty}</p>
        ) : (
          <ul className="divide-y divide-border">
            {sessions.map((s) => {
              const status = s.status as SessionStatus;
              const playerCount = (s.players as unknown as { count: number }[])[0]?.count ?? 0;
              return (
                <li key={s.id}>
                  <Link
                    href={`/session/${s.code}`}
                    className="-mx-2 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl px-2 py-3 hover:bg-background"
                  >
                    <span className="font-mono text-xl tracking-widest">{s.code}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASS[status]}`}>
                      {uz.sessions.status[status]}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {(s.quizzes as unknown as { title: string } | null)?.title}
                      {s.groups && <span className="text-muted"> · {(s.groups as unknown as { name: string }).name}</span>}
                    </span>
                    <span className="text-sm text-muted">{uz.sessions.players(playerCount)}</span>
                    <span className="text-sm text-muted">{new Date(s.created_at).toLocaleString("uz-UZ")}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
