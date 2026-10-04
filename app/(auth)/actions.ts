"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/i18n/uz";

export interface AuthState {
  error?: string;
  message?: string;
}

function isConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function safeNext(next: FormDataEntryValue | null) {
  const value = typeof next === "string" ? next : "";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isConfigured()) return { error: uz.auth.notConfigured };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: uz.auth.invalidCredentials };

  redirect(safeNext(formData.get("next")));
}

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isConfigured()) return { error: uz.auth.notConfigured };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) return { error: uz.auth.passwordTooShort };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/auth/callback`,
    },
  });
  if (error) return { error: error.message || uz.auth.genericError };

  // Email tasdiqlash yoqilgan bo'lsa, sessiya darhol berilmaydi
  if (!data.session) return { message: uz.auth.checkEmail };

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
