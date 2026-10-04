"use client";

import type { ButtonHTMLAttributes } from "react";
import { buttonClass } from "./Button";
import { uz } from "@/lib/i18n/uz";

interface ConfirmButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "formAction"> {
  formAction: () => Promise<void>;
  message?: string;
  variant?: "danger" | "ghost" | "secondary";
}

/** Server action'ni tasdiqlashdan keyin yuboradigan tugma (forma ichida ishlatiladi). */
export function ConfirmButton({
  formAction,
  message = uz.common.confirmDelete,
  variant = "danger",
  className = "",
  ...props
}: ConfirmButtonProps) {
  return (
    <button
      type="submit"
      formAction={formAction}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className={buttonClass(variant, className)}
      {...props}
    />
  );
}
