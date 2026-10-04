"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { uz } from "@/lib/i18n/uz";
import type { Quiz } from "@/types";
import { createQuiz, updateQuiz, type FormState } from "./actions";

export function QuizForm({ quiz }: { quiz?: Quiz }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    quiz ? updateQuiz.bind(null, quiz.id) : createQuiz,
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <Input
        label={uz.quizzes.quizTitle}
        name="title"
        defaultValue={quiz?.title}
        placeholder={uz.quizzes.quizTitlePlaceholder}
        required
        maxLength={120}
      />
      <Textarea
        label={`${uz.quizzes.description} (${uz.common.optional})`}
        name="description"
        defaultValue={quiz?.description ?? ""}
        maxLength={1000}
        rows={2}
      />
      <FormMessage error={state.error} success={state.ok ? uz.common.saved : undefined} />
      <Button type="submit" disabled={pending} className="self-start">
        {quiz ? uz.common.save : uz.common.create}
      </Button>
    </form>
  );
}
