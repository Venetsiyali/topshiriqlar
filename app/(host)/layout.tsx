import Link from "next/link";
import { logout } from "../(auth)/actions";
import { uz } from "@/lib/i18n/uz";

export default function HostLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="text-xl font-extrabold">
            Py<span className="text-primary">Race</span>
          </Link>
          <form action={logout}>
            <button className="min-h-12 rounded-xl px-4 text-sm font-semibold text-muted hover:bg-surface hover:text-foreground">
              {uz.auth.logout}
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
