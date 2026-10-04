import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/i18n/uz";
import type { Group } from "@/types";
import { CreateGroupForm, GroupRow } from "./GroupForms";

export default async function GroupsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("groups").select("*").order("created_at", { ascending: false });
  const groups = (data ?? []) as Group[];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">{uz.groups.title}</h1>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">{uz.groups.newGroup}</h2>
        <CreateGroupForm />
      </Card>

      <Card>
        {groups.length === 0 ? (
          <p className="text-muted">{uz.groups.empty}</p>
        ) : (
          <ul className="divide-y divide-border">
            {groups.map((g) => (
              <GroupRow key={g.id} group={g} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
