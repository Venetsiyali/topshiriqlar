import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function Textarea({ label, id, className = "", ...props }: TextareaProps) {
  const inputId = id ?? props.name;
  return (
    <label htmlFor={inputId} className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-muted">{label}</span>
      <textarea
        id={inputId}
        className={`min-h-24 rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none placeholder:text-slate-500 focus:border-primary ${className}`}
        {...props}
      />
    </label>
  );
}
