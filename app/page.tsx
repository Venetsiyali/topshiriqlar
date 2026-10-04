import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { buttonClass } from "@/components/ui/Button";
import { uz } from "@/lib/i18n/uz";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col justify-center gap-10 px-4 py-12">
      <header className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Py<span className="text-primary">Race</span>
        </h1>
        <p className="mt-3 text-lg text-muted">{uz.app.tagline}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">{uz.home.joinTitle}</h2>
          <p className="text-muted">{uz.home.joinDesc}</p>
          <Link href="/join" className={buttonClass("primary", "mt-auto")}>
            {uz.home.joinCta}
          </Link>
        </Card>
        <Card className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">{uz.home.hostTitle}</h2>
          <p className="text-muted">{uz.home.hostDesc}</p>
          <Link href="/login" className={buttonClass("secondary", "mt-auto")}>
            {uz.home.hostCta}
          </Link>
        </Card>
      </div>
    </main>
  );
}
