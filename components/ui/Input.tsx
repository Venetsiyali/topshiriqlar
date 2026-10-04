import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, id, className = "", ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <label htmlFor={inputId} className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-muted">{label}</span>
      <input
        id={inputId}
        className={`min-h-12 rounded-xl border border-border bg-background px-4 text-base text-foreground outline-none placeholder:text-slate-500 focus:border-primary ${className}`}
        {...props}
      />
    </label>
  );
}
