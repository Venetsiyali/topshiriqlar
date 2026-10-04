"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button, buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { splitLetters } from "@/lib/letters";
import { orderSequence } from "@/lib/tasks";
import { uz } from "@/lib/i18n/uz";
import type {
  ChoicePayload,
  CrosswordPayload,
  OrderPayload,
  PythonPayload,
  PythonTest,
  ShortPayload,
  Task,
  TaskType,
} from "@/types";

const t = uz.taskForm;

interface FormState {
  error?: string;
}

interface TaskFormProps {
  type: TaskType;
  task?: Task;
  backHref: string;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}

const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));

export function TaskForm({ type, task, backHref, action }: TaskFormProps) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  const [title, setTitle] = useState(task?.title ?? "");
  const [hint, setHint] = useState(task?.hint ?? "");
  const [points, setPoints] = useState(String(task?.points ?? (type === "python" ? 60 : 100)));
  const [timeLimit, setTimeLimit] = useState(task?.time_limit_sec != null ? String(task.time_limit_sec) : "");

  // crossword
  const cw = task?.type === "crossword" ? (task.payload as CrosswordPayload) : undefined;
  const [answer, setAnswer] = useState(cw?.answer ?? "");
  const [caseSensitive, setCaseSensitive] = useState(cw?.caseSensitive ?? false);
  const [revealHint, setRevealHint] = useState(String(cw?.revealHint ?? 0));
  const [maxAttempts, setMaxAttempts] = useState(cw?.maxAttempts != null ? String(cw.maxAttempts) : "");

  // choice
  const ch = task?.type === "choice" ? (task.payload as ChoicePayload) : undefined;
  const [options, setOptions] = useState<string[]>(ch?.options ?? ["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(ch?.correctIndex ?? 0);
  const [shuffle, setShuffle] = useState(ch?.shuffle ?? true);

  // short
  const sh = task?.type === "short" ? (task.payload as ShortPayload) : undefined;
  const [accepted, setAccepted] = useState<string[]>(sh?.accepted ?? [""]);
  const [matchMode, setMatchMode] = useState<"exact" | "fuzzy">(sh?.matchMode ?? "fuzzy");
  const [threshold, setThreshold] = useState(String(sh?.threshold ?? 0.8));

  // python
  const py = task?.type === "python" ? (task.payload as PythonPayload) : undefined;
  const [starterCode, setStarterCode] = useState(py?.starterCode ?? "# shu yerga yozing\n");
  const [tests, setTests] = useState<PythonTest[]>(py?.tests ?? [{ stdin: "", expectedStdout: "", visible: true }]);
  const [forbidden, setForbidden] = useState((py?.forbiddenKeywords ?? ["import os", "open("]).join("\n"));
  const [timeoutMs, setTimeoutMs] = useState(String(py?.timeoutMs ?? 5000));

  // order
  const od = task?.type === "order" ? (task.payload as OrderPayload) : undefined;
  const [sequence, setSequence] = useState<string[]>(od ? orderSequence(od) : ["", "", ""]);

  function buildPayload() {
    switch (type) {
      case "crossword":
        return {
          answer,
          caseSensitive,
          revealHint: Number(revealHint) || 0,
          maxAttempts: numOrNull(maxAttempts),
        };
      case "choice":
        return { options, correctIndex, shuffle };
      case "short":
        return { accepted, matchMode, threshold: Number(threshold) };
      case "python":
        return {
          starterCode,
          tests,
          forbiddenKeywords: forbidden
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          timeoutMs: Number(timeoutMs),
        };
      case "order":
        return { sequence };
    }
  }

  const data = JSON.stringify({
    type,
    title,
    hint: hint || null,
    points: Number(points),
    timeLimitSec: numOrNull(timeLimit),
    payload: buildPayload(),
  });

  const cells = splitLetters(answer.trim());

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="data" value={data} />

      <Card className="flex flex-col gap-4">
        <Textarea label={t.question} value={title} onChange={(e) => setTitle(e.target.value)} required rows={2} maxLength={500} />
        <Input
          label={`${t.hint} (${uz.common.optional})`}
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          maxLength={500}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t.points} type="number" min={0} max={1000} value={points} onChange={(e) => setPoints(e.target.value)} />
          <Input
            label={t.timeLimit}
            type="number"
            min={5}
            max={3600}
            value={timeLimit}
            placeholder={t.timeLimitHint}
            onChange={(e) => setTimeLimit(e.target.value)}
          />
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        {type === "crossword" && (
          <>
            <Input
              label={t.answer}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              autoCapitalize="characters"
              className="font-mono uppercase"
            />
            <p className="-mt-2 text-xs text-muted">{t.answerHint}</p>
            {cells.length > 0 && cells[0] !== "" && (
              <div>
                <div className="flex flex-wrap gap-1.5">
                  {cells.map((c, i) => (
                    <span
                      key={i}
                      className={`flex size-11 items-center justify-center rounded-lg border-2 font-mono text-lg font-bold uppercase ${
                        i < Number(revealHint) ? "border-primary bg-blue-950 text-blue-300" : "border-border"
                      }`}
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted">{t.cells(cells.length)}</p>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t.revealHint}
                type="number"
                min={0}
                max={Math.max(0, cells.length - 1)}
                value={revealHint}
                onChange={(e) => setRevealHint(e.target.value)}
              />
              <Input
                label={t.maxAttempts}
                type="number"
                min={1}
                value={maxAttempts}
                placeholder={t.maxAttemptsHint}
                onChange={(e) => setMaxAttempts(e.target.value)}
              />
            </div>
            <Checkbox label={t.caseSensitive} checked={caseSensitive} onChange={setCaseSensitive} />
          </>
        )}

        {type === "choice" && (
          <>
            <p className="text-sm font-medium text-muted">
              {t.options} — {t.correctOption}
            </p>
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correct"
                  checked={correctIndex === i}
                  onChange={() => setCorrectIndex(i)}
                  className="size-6 shrink-0 accent-green-600"
                  aria-label={t.correctOption}
                />
                <input
                  value={opt}
                  onChange={(e) => setOptions(options.map((o, k) => (k === i ? e.target.value : o)))}
                  placeholder={t.option(i + 1)}
                  required
                  maxLength={200}
                  className={`min-h-12 flex-1 rounded-xl border bg-background px-4 outline-none focus:border-primary ${
                    correctIndex === i ? "border-success" : "border-border"
                  }`}
                />
                <RemoveButton
                  disabled={options.length <= 2}
                  onClick={() => {
                    setOptions(options.filter((_, k) => k !== i));
                    if (correctIndex >= i && correctIndex > 0) setCorrectIndex(correctIndex - 1);
                  }}
                />
              </div>
            ))}
            {options.length < 6 && <AddButton label={t.addOption} onClick={() => setOptions([...options, ""])} />}
            <Checkbox label={t.shuffle} checked={shuffle} onChange={setShuffle} />
          </>
        )}

        {type === "short" && (
          <>
            <p className="text-sm font-medium text-muted">{t.accepted}</p>
            {accepted.map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  value={a}
                  onChange={(e) => setAccepted(accepted.map((x, k) => (k === i ? e.target.value : x)))}
                  placeholder={t.acceptedItem(i + 1)}
                  required
                  maxLength={200}
                  className="min-h-12 flex-1 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
                />
                <RemoveButton disabled={accepted.length <= 1} onClick={() => setAccepted(accepted.filter((_, k) => k !== i))} />
              </div>
            ))}
            <AddButton label={t.addAccepted} onClick={() => setAccepted([...accepted, ""])} />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-muted">{t.matchMode}</span>
                <select
                  value={matchMode}
                  onChange={(e) => setMatchMode(e.target.value as "exact" | "fuzzy")}
                  className="min-h-12 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
                >
                  <option value="fuzzy">{t.matchFuzzy}</option>
                  <option value="exact">{t.matchExact}</option>
                </select>
              </label>
              {matchMode === "fuzzy" && (
                <Input
                  label={t.threshold}
                  type="number"
                  min={0.5}
                  max={1}
                  step={0.05}
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                />
              )}
            </div>
          </>
        )}

        {type === "python" && (
          <>
            <Textarea
              label={t.starterCode}
              value={starterCode}
              onChange={(e) => setStarterCode(e.target.value)}
              rows={6}
              spellCheck={false}
              className="font-mono text-sm"
            />
            <p className="text-sm font-medium text-muted">{t.tests}</p>
            {tests.map((test, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{t.test(i + 1)}</span>
                  <RemoveButton disabled={tests.length <= 1} onClick={() => setTests(tests.filter((_, k) => k !== i))} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Textarea
                    label={t.stdin}
                    value={test.stdin}
                    onChange={(e) => setTests(tests.map((x, k) => (k === i ? { ...x, stdin: e.target.value } : x)))}
                    rows={2}
                    spellCheck={false}
                    className="font-mono text-sm"
                  />
                  <Textarea
                    label={t.expectedStdout}
                    value={test.expectedStdout}
                    onChange={(e) =>
                      setTests(tests.map((x, k) => (k === i ? { ...x, expectedStdout: e.target.value } : x)))
                    }
                    rows={2}
                    required
                    spellCheck={false}
                    className="font-mono text-sm"
                  />
                </div>
                <Checkbox
                  label={t.visible}
                  checked={test.visible}
                  onChange={(v) => setTests(tests.map((x, k) => (k === i ? { ...x, visible: v } : x)))}
                />
              </div>
            ))}
            <AddButton
              label={t.addTest}
              onClick={() => setTests([...tests, { stdin: "", expectedStdout: "", visible: false }])}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Textarea
                  label={t.forbidden}
                  value={forbidden}
                  onChange={(e) => setForbidden(e.target.value)}
                  rows={3}
                  spellCheck={false}
                  className="font-mono text-sm"
                />
                <p className="mt-1 text-xs text-muted">{t.forbiddenHint}</p>
              </div>
              <Input
                label={t.timeoutMs}
                type="number"
                min={1000}
                max={10000}
                step={500}
                value={timeoutMs}
                onChange={(e) => setTimeoutMs(e.target.value)}
              />
            </div>
          </>
        )}

        {type === "order" && (
          <>
            <div>
              <p className="text-sm font-medium text-muted">{t.sequence}</p>
              <p className="text-xs text-muted">{t.sequenceHint}</p>
            </div>
            {sequence.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background font-mono text-sm">
                  {i + 1}
                </span>
                <input
                  value={item}
                  onChange={(e) => setSequence(sequence.map((x, k) => (k === i ? e.target.value : x)))}
                  placeholder={t.item(i + 1)}
                  required
                  maxLength={200}
                  className="min-h-12 flex-1 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
                />
                <RemoveButton
                  disabled={sequence.length <= 2}
                  onClick={() => setSequence(sequence.filter((_, k) => k !== i))}
                />
              </div>
            ))}
            {sequence.length < 10 && <AddButton label={t.addItem} onClick={() => setSequence([...sequence, ""])} />}
          </>
        )}
      </Card>

      <FormMessage error={state.error} />

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {uz.common.save}
        </Button>
        <Link href={backHref} className={buttonClass("ghost")}>
          {uz.common.cancel}
        </Link>
      </div>
    </form>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-5 accent-blue-600"
      />
      <span>{label}</span>
    </label>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={buttonClass("secondary", "self-start")}>
      + {label}
    </button>
  );
}

function RemoveButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={uz.common.remove}
      className={buttonClass("ghost", "shrink-0 px-3")}
    >
      ✕
    </button>
  );
}
