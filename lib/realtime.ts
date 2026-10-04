"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Player, SessionStatus } from "@/types";

/**
 * Sessiya kanaliga (`session:{code}`) obuna bo'ladi: players o'zgarishlari va sessiya holati.
 * Boshlang'ich ro'yxat serverdan keladi, keyin Postgres changes orqali jonli yangilanadi.
 */
export function useSessionLive(
  code: string,
  sessionId: string,
  initialPlayers: Player[],
  initialStatus: SessionStatus,
) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [status, setStatus] = useState<SessionStatus>(initialStatus);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const channel = supabase
      .channel(`session:${code}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          setPlayers((prev) => {
            if (payload.eventType === "DELETE") {
              const id = (payload.old as { id?: string }).id;
              return prev.filter((p) => p.id !== id);
            }
            // device_token klient holatiga kirmasin
            const { device_token: _omit, ...row } = payload.new as Player & { device_token?: string };
            void _omit;
            const idx = prev.findIndex((p) => p.id === row.id);
            if (idx === -1) return [...prev, row];
            const next = prev.slice();
            next[idx] = row;
            return next;
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "sessions", filter: `id=eq.${sessionId}` },
        (payload) => setStatus((payload.new as { status: SessionStatus }).status),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, code, sessionId]);

  return { players, status };
}
