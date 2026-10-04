import { splitLetters } from "@/lib/letters";
import type { TaskInput } from "@/lib/validators";
import type {
  ChoicePayload,
  CrosswordPayload,
  OrderPayload,
  PythonPayload,
  Task,
  TaskPayload,
  TaskType,
} from "@/types";

/**
 * Talabaga yuboriladigan topshiriq ko'rinishi — to'g'ri javoblar olib tashlangan.
 * Klientga faqat shu shakl ketadi (TZ 4.1: javob hech qachon klientga yuborilmaydi).
 */
export type PublicTask = {
  id: string;
  order_index: number;
  title: string;
  hint: string | null;
  points: number;
  time_limit_sec: number | null;
} & (
  | { type: "crossword"; cells: number; revealed: { index: number; letter: string }[] }
  | { type: "choice"; options: string[] }
  | { type: "short" }
  | { type: "python"; starterCode: string; visibleTests: { stdin: string; expectedStdout: string }[]; timeoutMs: number }
  | { type: "order"; items: string[] }
);

export function toPublicTask(task: Task): PublicTask {
  const base = {
    id: task.id,
    order_index: task.order_index,
    title: task.title,
    hint: task.hint,
    points: task.points,
    time_limit_sec: task.time_limit_sec,
  };

  switch (task.type) {
    case "crossword": {
      const p = task.payload as CrosswordPayload;
      const letters = splitLetters(p.answer);
      const revealed = letters.slice(0, p.revealHint).map((letter, index) => ({ index, letter }));
      return { ...base, type: "crossword", cells: letters.length, revealed };
    }
    case "choice": {
      const p = task.payload as ChoicePayload;
      // Aralashtirish sessiya vaqtida, har bir talaba uchun alohida qilinadi
      return { ...base, type: "choice", options: p.options };
    }
    case "short":
      return { ...base, type: "short" };
    case "python": {
      const p = task.payload as PythonPayload;
      return {
        ...base,
        type: "python",
        starterCode: p.starterCode,
        visibleTests: p.tests.filter((t) => t.visible).map(({ stdin, expectedStdout }) => ({ stdin, expectedStdout })),
        timeoutMs: p.timeoutMs,
      };
    }
    case "order": {
      const p = task.payload as OrderPayload;
      return { ...base, type: "order", items: p.items };
    }
  }
}

function shuffledPermutation(n: number): number[] {
  const perm = Array.from({ length: n }, (_, i) => i);
  do {
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
  } while (n > 1 && perm.every((v, i) => v === i));
  return perm;
}

/** Forma ma'lumotini DB'ga yoziladigan payload'ga aylantiradi. */
export function toStoredPayload(input: TaskInput): TaskPayload {
  if (input.type !== "order") return input.payload;

  // Elementlar aralashtirib saqlanadi; correctOrder[k] = k-chi to'g'ri elementning items'dagi indeksi
  const seq = input.payload.sequence;
  const perm = shuffledPermutation(seq.length);
  const items = perm.map((i) => seq[i]);
  const correctOrder = seq.map((_, k) => perm.indexOf(k));
  return { items, correctOrder };
}

/** Saqlangan order payload'idan to'g'ri ketma-ketlikni tiklaydi (tahrirlash formasi uchun). */
export function orderSequence(p: OrderPayload): string[] {
  return p.correctOrder.map((i) => p.items[i]);
}

/** Host uchun to'g'ri javobning qisqa matni. */
export function answerSummary(task: Task): string {
  switch (task.type) {
    case "crossword":
      return (task.payload as CrosswordPayload).answer;
    case "choice": {
      const p = task.payload as ChoicePayload;
      return p.options[p.correctIndex];
    }
    case "short":
      return (task.payload as { accepted: string[] }).accepted.join(" · ");
    case "python":
      return (task.payload as PythonPayload).tests.map((t) => t.expectedStdout).join(" · ");
    case "order":
      return orderSequence(task.payload as OrderPayload).join(" → ");
  }
}

export const TASK_TYPES: TaskType[] = ["crossword", "choice", "short", "python", "order"];

export function isTaskType(value: unknown): value is TaskType {
  return typeof value === "string" && (TASK_TYPES as string[]).includes(value);
}
