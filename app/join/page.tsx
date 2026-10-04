"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { uz } from "@/lib/i18n/uz";

export default function JoinPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(pin)) {
      setError(uz.join.invalidPin);
      return;
    }
    router.push(`/play/${pin}`);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
      <Card>
        <h1 className="mb-6 text-center text-2xl font-bold">{uz.join.title}</h1>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-center text-sm text-muted">{uz.join.pinLabel}</span>
            <input
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
                setError("");
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              placeholder="000000"
              className="min-h-16 rounded-xl border border-border bg-background text-center font-mono text-4xl tracking-[0.4em] outline-none focus:border-primary"
            />
          </label>
          {error && <p className="text-center text-sm text-red-400">{error}</p>}
          <Button type="submit" disabled={pin.length !== 6}>
            {uz.join.submit}
          </Button>
        </form>
      </Card>
    </main>
  );
}
