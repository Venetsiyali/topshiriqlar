import Link from "next/link";
import { logout } from "../(auth)/actions";
import { uz } from "@/lib/i18n/uz";

const NAV = [
  { href: "/dashboard", label: uz.nav.dashboard },
  { href: "/groups", label: uz.nav.groups },
  { href: "/quizzes", label: uz.nav.quizzes },
  { href: "/sessions", label: uz.nav.sessions },
];

export default function HostLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2">
          <Link href="/dashboard" className="text-xl font-extrabold">
            Py<span className="text-primary">Race</span>
          </Link>
          <nav className="flex flex-1 gap-1 overflow-x-auto">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-12 items-center whitespace-nowrap rounded-xl px-3 text-sm font-medium text-muted hover:bg-surface hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
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
