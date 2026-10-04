import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/i18n/uz";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { count: groupCount }, { count: quizCount }, { count: sessionCount }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase.from("groups").select("*", { count: "exact", head: true }),
    supabase.from("quizzes").select("*", { count: "exact", head: true }),
    supabase.from("sessions").select("*", { count: "exact", head: true }).eq("host_id", user.id),
  ]);

  const sections = [
    { href: "/groups", title: uz.dashboard.groups, count: groupCount ?? 0 },
    { href: "/quizzes", title: uz.dashboard.quizzes, count: quizCount ?? 0 },
    { href: "/sessions", title: uz.dashboard.sessions, count: sessionCount ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">{uz.dashboard.title}</h1>
        <p className="mt-1 text-muted">{uz.dashboard.greeting(profile?.full_name ?? user.email ?? "")}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="block">
            <Card className="h-full transition-colors hover:border-primary">
              <h2 className="text-xl font-semibold">{s.title}</h2>
              <p className="mt-2 text-4xl font-bold text-primary">{uz.dashboard.count(s.count)}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
