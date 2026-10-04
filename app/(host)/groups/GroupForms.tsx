"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { uz } from "@/lib/i18n/uz";
import type { Group } from "@/types";
import { createGroup, deleteGroup, updateGroup, type FormState } from "./actions";

export function CreateGroupForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createGroup, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <div className="flex flex-col gap-3">
      <form ref={formRef} action={action} className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <Input label={uz.groups.name} name="name" placeholder={uz.groups.namePlaceholder} required maxLength={60} />
        </div>
        <div className="flex-1">
          <Input label={uz.groups.subject} name="subject" placeholder={uz.groups.subjectPlaceholder} maxLength={60} />
        </div>
        <Button type="submit" disabled={pending}>
          {uz.common.create}
        </Button>
      </form>
      <FormMessage error={state.error} />
    </div>
  );
}

export function GroupRow({ group }: { group: Group }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(updateGroup.bind(null, group.id), {});

  useEffect(() => {
    if (state.ok) setEditing(false);
  }, [state]);

  if (!editing) {
    return (
      <li className="flex items-center justify-between gap-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{group.name}</p>
          {group.subject && <p className="text-sm text-muted">{group.subject}</p>}
        </div>
        <form className="flex shrink-0 gap-2">
          <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
            {uz.common.edit}
          </Button>
          <ConfirmButton formAction={deleteGroup.bind(null, group.id)} variant="ghost">
            {uz.common.delete}
          </ConfirmButton>
        </form>
      </li>
    );
  }

  return (
    <li className="py-3">
      <form action={action} className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <Input label={uz.groups.name} name="name" defaultValue={group.name} required maxLength={60} />
        </div>
        <div className="flex-1">
          <Input label={uz.groups.subject} name="subject" defaultValue={group.subject ?? ""} maxLength={60} />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {uz.common.save}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
            {uz.common.cancel}
          </Button>
        </div>
      </form>
      {state.error && (
        <div className="mt-2">
          <FormMessage error={state.error} />
        </div>
      )}
    </li>
  );
}
