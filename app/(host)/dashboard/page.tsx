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

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

  const sections = [uz.dashboard.groups, uz.dashboard.quizzes, uz.dashboard.sessions];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">{uz.dashboard.title}</h1>
        <p className="mt-1 text-muted">{uz.dashboard.greeting(profile?.full_name ?? user.email ?? "")}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {sections.map((title) => (
          <Card key={title}>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted">{uz.dashboard.comingSoon}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
