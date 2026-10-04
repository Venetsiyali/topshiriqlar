"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { uz } from "@/lib/i18n/uz";
import { login, register, type AuthState } from "./actions";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    mode === "login" ? login : register,
    {},
  );
  const isLogin = mode === "login";

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
      <Link href="/" className="mb-8 text-center text-3xl font-extrabold">
        Py<span className="text-primary">Race</span>
      </Link>
      <Card>
        <h1 className="mb-6 text-2xl font-bold">{isLogin ? uz.auth.loginTitle : uz.auth.registerTitle}</h1>
        <form action={action} className="flex flex-col gap-4">
          {next && <input type="hidden" name="next" value={next} />}
          {!isLogin && <Input label={uz.auth.fullName} name="fullName" required autoComplete="name" />}
          <Input label={uz.auth.email} name="email" type="email" required autoComplete="email" />
          <Input
            label={uz.auth.password}
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
          {state.error && <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-300">{state.error}</p>}
          {state.message && (
            <p className="rounded-lg bg-blue-950 px-3 py-2 text-sm text-blue-200">{state.message}</p>
          )}
          <Button type="submit" disabled={pending}>
            {isLogin ? uz.auth.login : uz.auth.register}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          {isLogin ? uz.auth.noAccount : uz.auth.haveAccount}{" "}
          <Link href={isLogin ? "/register" : "/login"} className="font-semibold text-primary hover:underline">
            {isLogin ? uz.auth.register : uz.auth.login}
          </Link>
        </p>
      </Card>
    </main>
  );
}
