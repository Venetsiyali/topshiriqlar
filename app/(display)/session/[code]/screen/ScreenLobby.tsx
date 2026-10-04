"use client";

import { Sticker } from "@/components/Sticker";
import { useSessionLive } from "@/lib/realtime";
import { uz } from "@/lib/i18n/uz";
import type { Player, SessionStatus } from "@/types";

interface Props {
  code: string;
  sessionId: string;
  status: SessionStatus;
  joinUrl: string;
  qr: string;
  initialPlayers: Player[];
}

export function ScreenLobby({ code, sessionId, status: initialStatus, joinUrl, qr, initialPlayers }: Props) {
  const { players } = useSessionLive(code, sessionId, initialPlayers, initialStatus);
  const host = joinUrl.replace(/^https?:\/\//, "").replace(/\/play\/\d+$/, "");

  return (
    <main className="flex min-h-dvh flex-col gap-10 p-8 lg:p-12">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-2xl text-muted">
            {host}/join · {uz.screen.pin}
          </p>
          <p className="font-mono text-8xl font-extrabold tracking-[0.2em]">{code}</p>
        </div>
        <p className="text-5xl font-bold">
          {uz.screen.joined(players.length)}
        </p>
      </header>

      <div className="grid flex-1 gap-10 lg:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR" width={400} height={400} className="rounded-2xl bg-white p-3" />
          <p className="max-w-[400px] text-center text-xl text-muted">{uz.screen.scan}</p>
        </div>

        <ul className="flex flex-wrap content-start gap-4">
          {players.map((p) => (
            <li
              key={p.id}
              className={`flex animate-[pop_300ms_ease-out] items-center gap-3 rounded-full bg-surface py-2 pl-2 pr-6 ${
                p.is_active ? "" : "opacity-40"
              }`}
            >
              <Sticker id={p.sticker} size={56} />
              <span className="text-[32px] font-semibold">{p.nickname}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
