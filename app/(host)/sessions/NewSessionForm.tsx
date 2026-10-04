"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import { uz } from "@/lib/i18n/uz";
import { createSession, type FormState } from "./actions";

const selectClass =
  "min-h-12 rounded-xl border border-border bg-background px-4 text-base outline-none focus:border-primary";

interface Props {
  quizzes: { id: string; title: string; taskCount: number }[];
  groups: { id: string; name: string }[];
}

export function NewSessionForm({ quizzes, groups }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(createSession, {});

  if (quizzes.length === 0) return <p className="text-muted">{uz.sessions.noQuizzes}</p>;

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted">{uz.sessions.quiz}</span>
          <select name="quizId" required className={selectClass}>
            {quizzes.map((q) => (
              <option key={q.id} value={q.id} disabled={q.taskCount === 0}>
                {q.title} ({uz.quizzes.taskCount(q.taskCount)})
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted">{uz.sessions.group}</span>
          <select name="groupId" className={selectClass}>
            <option value="">{uz.sessions.noGroup}</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted">{uz.sessions.mode}</span>
          <select name="mode" className={selectClass} defaultValue="race">
            <option value="race">{uz.sessions.modeRace}</option>
            <option value="sync">{uz.sessions.modeSync}</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-x-6">
        <label className="flex min-h-12 cursor-pointer items-center gap-3">
          <input type="checkbox" name="allowLateJoin" defaultChecked className="size-5 accent-blue-600" />
          {uz.sessions.allowLateJoin}
        </label>
        <label className="flex min-h-12 cursor-pointer items-center gap-3">
          <input type="checkbox" name="showLeaderboard" defaultChecked className="size-5 accent-blue-600" />
          {uz.sessions.showLeaderboard}
        </label>
      </div>
      <FormMessage error={state.error} />
      <Button type="submit" disabled={pending} className="self-start">
        {uz.sessions.start}
      </Button>
    </form>
  );
}
