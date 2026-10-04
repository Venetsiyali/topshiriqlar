import type { PublicTask } from "@/lib/tasks";
import { uz } from "@/lib/i18n/uz";

// Kahoot uslubidagi variant ranglari
const CHOICE_COLORS = ["bg-red-600", "bg-blue-600", "bg-amber-500", "bg-green-600", "bg-purple-600", "bg-pink-600"];

/**
 * Talaba ekranining statik ko'rinishi. Faqat PublicTask qabul qiladi —
 * ya'ni bu yerga to'g'ri javob umuman yetib kelmaydi.
 */
export function TaskPreview({ task, total }: { task: PublicTask; total: number }) {
  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-[2rem] border-4 border-slate-700 bg-background shadow-2xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 text-sm">
        <span className="font-semibold">🦊 Talaba</span>
        <span className="font-mono text-muted">
          {task.order_index}/{total} · {task.points}
        </span>
      </div>

      <div className="flex min-h-80 flex-col gap-5 px-4 py-6">
        <p className="text-center text-xl font-semibold">{task.title}</p>
        {task.hint && <p className="-mt-3 text-center text-sm text-muted">💡 {task.hint}</p>}

        {task.type === "crossword" && (
          <div className="flex flex-wrap justify-center gap-1.5">
            {Array.from({ length: task.cells }, (_, i) => {
              const revealed = task.revealed.find((r) => r.index === i);
              return (
                <span
                  key={i}
                  className={`flex size-11 items-center justify-center rounded-lg border-2 font-mono text-xl font-bold uppercase ${
                    revealed ? "border-primary bg-blue-950 text-blue-300" : "border-border bg-surface"
                  }`}
                >
                  {revealed?.letter ?? ""}
                </span>
              );
            })}
          </div>
        )}

        {task.type === "choice" && (
          <div className="grid grid-cols-2 gap-3">
            {task.options.map((opt, i) => (
              <div
                key={i}
                className={`flex min-h-20 items-center justify-center rounded-xl p-3 text-center font-semibold text-white ${
                  CHOICE_COLORS[i % CHOICE_COLORS.length]
                }`}
              >
                {opt}
              </div>
            ))}
          </div>
        )}

        {task.type === "short" && (
          <div className="min-h-12 rounded-xl border border-border bg-surface px-4 py-3 text-slate-500">
            {uz.preview.answerPlaceholder}
          </div>
        )}

        {task.type === "python" && (
          <>
            <pre className="overflow-x-auto rounded-xl border border-border bg-slate-950 p-3 font-mono text-sm text-slate-200">
              {task.starterCode}
            </pre>
            {task.visibleTests.length > 0 && (
              <div className="text-sm">
                <p className="mb-1 font-medium text-muted">{uz.preview.visibleTests}</p>
                {task.visibleTests.map((tc, i) => (
                  <p key={i} className="font-mono text-xs text-slate-300">
                    {tc.stdin ? `${tc.stdin.replace(/\n/g, "⏎")} → ` : "→ "}
                    {tc.expectedStdout}
                  </p>
                ))}
              </div>
            )}
          </>
        )}

        {task.type === "order" && (
          <ol className="flex flex-col gap-2">
            {task.items.map((item, i) => (
              <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3">
                <span className="flex flex-col text-xs leading-none text-muted">
                  <span>▲</span>
                  <span>▼</span>
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-auto rounded-xl bg-primary py-3 text-center font-semibold text-white">
          {task.type === "python" ? uz.preview.run : uz.preview.check}
        </div>
      </div>
    </div>
  );
}
