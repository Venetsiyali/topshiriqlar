export type TaskType = "crossword" | "choice" | "short" | "python" | "order";
export type SessionStatus = "lobby" | "running" | "paused" | "finished";
export type SessionMode = "race" | "sync";

export interface Profile {
  id: string;
  full_name: string;
  created_at: string;
}

export interface Group {
  id: string;
  owner_id: string;
  name: string;
  subject: string | null;
  created_at: string;
}

export interface Quiz {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  is_template: boolean;
  created_at: string;
}

export interface CrosswordPayload {
  answer: string;
  caseSensitive: boolean;
  revealHint: number;
  maxAttempts: number | null;
}

export interface ChoicePayload {
  options: string[];
  correctIndex: number;
  shuffle: boolean;
}

export interface ShortPayload {
  accepted: string[];
  matchMode: "exact" | "fuzzy";
  threshold: number;
}

export interface PythonTest {
  stdin: string;
  expectedStdout: string;
  visible: boolean;
}

export interface PythonPayload {
  starterCode: string;
  tests: PythonTest[];
  forbiddenKeywords: string[];
  timeoutMs: number;
}

export interface OrderPayload {
  items: string[];
  correctOrder: number[];
}

export type TaskPayload = CrosswordPayload | ChoicePayload | ShortPayload | PythonPayload | OrderPayload;

export interface Task {
  id: string;
  quiz_id: string;
  order_index: number;
  type: TaskType;
  title: string;
  hint: string | null;
  payload: TaskPayload;
  points: number;
  time_limit_sec: number | null;
}

export interface SessionSettings {
  showLeaderboard?: boolean;
  allowLateJoin?: boolean;
}

export interface Session {
  id: string;
  code: string;
  quiz_id: string | null;
  group_id: string | null;
  host_id: string;
  status: SessionStatus;
  mode: SessionMode;
  started_at: string | null;
  finished_at: string | null;
  settings: SessionSettings;
  created_at: string;
}

/** Klientga ko'rinadigan o'yinchi ma'lumotlari (device_token yo'q). */
export interface Player {
  id: string;
  session_id: string;
  nickname: string;
  sticker: string;
  score: number;
  current_task: number;
  finished_at: string | null;
  is_active: boolean;
  joined_at: string;
}
