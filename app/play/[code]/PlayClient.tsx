"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Sticker } from "@/components/Sticker";
import { Button, buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useSessionLive } from "@/lib/realtime";
import { STICKERS } from "@/lib/stickers";
import { uz } from "@/lib/i18n/uz";
import type { Player, SessionStatus } from "@/types";

const DEVICE_KEY = "pyrace:device";

function getDeviceToken() {
  try {
    let token = localStorage.getItem(DEVICE_KEY);
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem(DEVICE_KEY, token);
    }
    return token;
  } catch {
    // localStorage yopiq (private rejim) — shu sahifa davomida ishlaydigan token
    return crypto.randomUUID();
  }
}

interface SessionInfo {
  id: string;
  status: SessionStatus;
}

type Stage =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "profile"; session: SessionInfo; players: Player[] }
  | { kind: "joined"; session: SessionInfo; players: Player[]; me: Player; late: boolean };

const errorText = (code: string) => uz.join.errors[code] ?? uz.join.errors.generic;

export function PlayClient({ code }: { code: string }) {
  const [stage, setStage] = useState<Stage>({ kind: "loading" });
  const [deviceToken, setDeviceToken] = useState("");

  const join = useCallback(
    async (token: string, profile?: { nickname: string; sticker: string }) => {
      const res = await fetch(`/api/session/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceToken: token, ...profile }),
      });
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, data } as { ok: boolean; data: { error?: string; player?: Player; late?: boolean } };
    },
    [code],
  );

  // Boshlang'ich yuklash: sessiya holati + shu qurilma avval kirganmi
  useEffect(() => {
    const token = getDeviceToken();
    setDeviceToken(token);

    (async () => {
      try {
        const stateRes = await fetch(`/api/session/${code}/state`, { cache: "no-store" });
        const state = await stateRes.json();
        if (!stateRes.ok) return setStage({ kind: "error", message: errorText(state.error) });

        const { ok, data } = await join(token);
        if (ok && data.player) {
          return setStage({ kind: "joined", session: state.session, players: state.players, me: data.player, late: false });
        }
        if (data.error && data.error !== "needs_profile") {
          return setStage({ kind: "error", message: errorText(data.error) });
        }
        setStage({ kind: "profile", session: state.session, players: state.players });
      } catch {
        setStage({ kind: "error", message: uz.join.errors.network });
      }
    })();
  }, [code, join]);

  if (stage.kind === "loading") {
    return <Centered><p className="text-muted">{uz.play.loading}</p></Centered>;
  }

  if (stage.kind === "error") {
    return (
      <Centered>
        <Card className="flex flex-col items-center gap-4 text-center">
          <p className="text-lg">{stage.message}</p>
          <Link href="/join" className={buttonClass("secondary")}>
            {uz.common.back}
          </Link>
        </Card>
      </Centered>
    );
  }

  if (stage.kind === "profile") {
    return (
      <ProfileForm
        code={code}
        takenStickers={new Set(stage.players.map((p) => p.sticker))}
        onSubmit={async (profile) => {
          try {
            const { ok, data } = await join(deviceToken, profile);
            if (!ok || !data.player) return errorText(data.error ?? "generic");
            setStage({
              kind: "joined",
              session: stage.session,
              players: [...stage.players.filter((p) => p.id !== data.player!.id), data.player],
              me: data.player,
              late: Boolean(data.late),
            });
            return null;
          } catch {
            return uz.join.errors.network;
          }
        }}
      />
    );
  }

  return <Lobby code={code} session={stage.session} initialPlayers={stage.players} me={stage.me} late={stage.late} />;
}

function Centered({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-8">{children}</main>;
}

function ProfileForm({
  code,
  takenStickers,
  onSubmit,
}: {
  code: string;
  takenStickers: Set<string>;
  onSubmit: (p: { nickname: string; sticker: string }) => Promise<string | null>;
}) {
  const [nickname, setNickname] = useState("");
  const [sticker, setSticker] = useState(() => STICKERS.find((s) => !takenStickers.has(s.id))?.id ?? STICKERS[0].id);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError((await onSubmit({ nickname, sticker })) ?? "");
    setPending(false);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 py-6">
      <p className="text-center text-sm text-muted">
        {uz.play.session} <span className="font-mono tracking-widest text-foreground">{code}</span>
      </p>
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3">
          <Sticker id={sticker} size={96} />
          <label className="flex w-full flex-col gap-1.5">
            <span className="text-sm font-medium text-muted">{uz.join.name}</span>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={uz.join.namePlaceholder}
              minLength={2}
              maxLength={20}
              required
              autoComplete="given-name"
              className="min-h-14 rounded-xl border border-border bg-surface px-4 text-center text-xl outline-none focus:border-primary"
            />
            <span className="text-center text-xs text-muted">{uz.join.nameRule}</span>
          </label>
        </div>

        <div>
          <p className="mb-1 text-sm font-medium text-muted">{uz.join.pickSticker}</p>
          <p className="mb-3 text-xs text-muted">{uz.join.takenHint}</p>
          <div className="grid grid-cols-6 gap-2">
            {STICKERS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSticker(s.id)}
                aria-pressed={sticker === s.id}
                className={`flex aspect-square items-center justify-center rounded-xl border-2 transition ${
                  sticker === s.id ? "border-primary bg-blue-950" : "border-transparent"
                } ${takenStickers.has(s.id) && sticker !== s.id ? "opacity-30" : ""}`}
              >
                <Sticker id={s.id} size={40} />
              </button>
            ))}
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-950 px-3 py-2 text-center text-sm text-red-300">{error}</p>}

        <Button type="submit" disabled={pending || nickname.trim().length < 2} className="sticky bottom-4 min-h-14 text-lg">
          {uz.join.enter}
        </Button>
      </form>
    </main>
  );
}

function Lobby({
  code,
  session,
  initialPlayers,
  me,
  late,
}: {
  code: string;
  session: SessionInfo;
  initialPlayers: Player[];
  me: Player;
  late: boolean;
}) {
  const { players, status } = useSessionLive(code, session.id, initialPlayers, session.status);

  let message: string = uz.play.lobbyTitle;
  if (status === "running" || status === "paused") message = late ? uz.play.late : uz.play.started;
  if (status === "finished") message = uz.play.finished;

  return (
    <Centered>
      <div className="flex flex-col items-center gap-6 text-center">
        <Sticker id={me.sticker} size={120} className="animate-[pop_400ms_ease-out]" />
        <p className="text-3xl font-bold">{me.nickname}</p>
        <Card className="w-full">
          <p className="text-lg">{message}</p>
          <p className="mt-3 text-sm text-muted">{uz.play.joinedCount(players.length)}</p>
        </Card>
        <p className="text-xs text-muted">
          {uz.play.session} <span className="font-mono tracking-widest">{code}</span>
        </p>
      </div>
    </Centered>
  );
}
