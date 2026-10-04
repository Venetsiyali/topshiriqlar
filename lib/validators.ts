import { z } from "zod";
import { splitLetters } from "@/lib/letters";

const text = (max: number) => z.string().trim().min(1, "Maydon bo'sh bo'lmasin").max(max, `Ko'pi bilan ${max} belgi`);

export const groupSchema = z.object({
  name: text(60),
  subject: z.string().trim().max(60).optional().transform((v) => v || null),
});

export const quizSchema = z.object({
  title: text(120),
  description: z.string().trim().max(1000).optional().transform((v) => v || null),
});

const crosswordPayload = z.object({
  answer: z
    .string()
    .trim()
    .min(1, "Javobni kiriting")
    .refine((v) => !/\s/.test(v), "Javob bo'sh joysiz bitta so'z bo'lsin")
    .refine((v) => splitLetters(v).length <= 30, "Javob ko'pi bilan 30 katak"),
  caseSensitive: z.boolean(),
  revealHint: z.number().int().min(0),
  maxAttempts: z.number().int().min(1).nullable(),
});

const choicePayload = z
  .object({
    options: z.array(text(200)).min(2, "Kamida 2 ta variant").max(6, "Ko'pi bilan 6 ta variant"),
    correctIndex: z.number().int().min(0),
    shuffle: z.boolean(),
  })
  .refine((p) => p.correctIndex < p.options.length, { message: "To'g'ri variantni belgilang", path: ["correctIndex"] });

const shortPayload = z.object({
  accepted: z.array(text(200)).min(1, "Kamida bitta javob kiriting"),
  matchMode: z.enum(["exact", "fuzzy"]),
  threshold: z.number().min(0.5).max(1),
});

const pythonPayload = z.object({
  starterCode: z.string().max(5000),
  tests: z
    .array(
      z.object({
        stdin: z.string().max(2000),
        expectedStdout: z.string().max(2000).refine((v) => v.trim().length > 0, "Kutilgan natijani kiriting"),
        visible: z.boolean(),
      }),
    )
    .min(1, "Kamida bitta test kerak"),
  forbiddenKeywords: z.array(z.string().trim().min(1)).max(20),
  timeoutMs: z.number().int().min(1000).max(10000),
});

/** Formadan keladigan shakl: elementlar to'g'ri tartibda; saqlashda aralashtiriladi. */
const orderInput = z.object({
  sequence: z.array(text(200)).min(2, "Kamida 2 ta element").max(10, "Ko'pi bilan 10 ta element"),
});

const taskCommon = {
  title: text(500),
  hint: z.string().trim().max(500).nullable().transform((v) => v || null),
  points: z.number().int().min(0).max(1000),
  timeLimitSec: z.number().int().min(5).max(3600).nullable(),
};

export const taskInputSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("crossword"), ...taskCommon, payload: crosswordPayload }),
  z.object({ type: z.literal("choice"), ...taskCommon, payload: choicePayload }),
  z.object({ type: z.literal("short"), ...taskCommon, payload: shortPayload }),
  z.object({ type: z.literal("python"), ...taskCommon, payload: pythonPayload }),
  z.object({ type: z.literal("order"), ...taskCommon, payload: orderInput }),
]);

export type TaskInput = z.infer<typeof taskInputSchema>;

export function firstError(error: z.ZodError): string {
  const issue = error.issues[0];
  return issue?.message ?? "Ma'lumotlar noto'g'ri";
}
