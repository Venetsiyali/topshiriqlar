"use client";

import Link from "next/link";
import { useState } from "react";
import { Sticker } from "@/components/Sticker";
import { Button, buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useSessionLive } from "@/lib/realtime";
import { uz } from "@/lib/i18n/uz";
import type { Player, SessionStatus } from "@/types";

interface Props {
  code: string;
  sessionId: string;
  status: SessionStatus;
  quizTitle: string;
  groupName: string | null;
  joinUrl: string;
  qr: string;
  initialPlayers: Player[];
}

export function HostLobby({ code, sessionId, status: initialStatus, quizTitle, groupName, joinUrl, qr, initialPlayers }: Props) {
  const { players, status } = useSessionLive(code, sessionId, initialPlayers, initialStatus);
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/sessions" className="text-sm text-muted hover:text-foreground">
            ← {uz.sessions.title}
          </Link>
          <h1 className="mt-1 text-3xl font-bold">{quizTitle}</h1>
          <p className="text-muted">
            {groupName && `${groupName} · `}
            {uz.sessions.status[status]}
          </p>
        </div>
        <a href={`/session/${code}/screen`} target="_blank" rel="noreferrer" className={buttonClass("primary")}>
          {uz.host.openScreen} ↗
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <Card className="flex flex-col items-center gap-4">
          <p className="text-sm font-medium uppercase tracking-wide text-muted">{uz.host.pin}</p>
          <p className="font-mono text-5xl font-bold tracking-[0.3em]">{code}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR" width={240} height={240} className="rounded-xl bg-white p-2" />
          <p className="max-w-60 break-all text-center text-xs text-muted">{joinUrl}</p>
          <Button variant="secondary" onClick={copy}>
            {copied ? uz.host.copied : uz.host.copyLink}
          </Button>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">{uz.host.joined(players.length)}</h2>
          {players.length === 0 ? (
            <p className="text-muted">{uz.host.waiting}</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {players.map((p) => (
                <li
                  key={p.id}
                  className={`flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-4 ${
                    p.is_active ? "" : "opacity-40"
                  }`}
                >
                  <Sticker id={p.sticker} size={36} />
                  <span className="font-medium">{p.nickname}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-6 text-sm text-muted">{uz.host.startHint}</p>
        </Card>
      </div>
    </div>
  );
}
