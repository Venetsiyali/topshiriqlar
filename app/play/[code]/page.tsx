import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { uz } from "@/lib/i18n/uz";

// Ism + stiker tanlash va o'yin ekrani 3–5-bosqichlarda qo'shiladi
export default async function PlayPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^\d{6}$/.test(code)) notFound();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
      <Card className="text-center">
        <p className="text-sm text-muted">{uz.play.session}</p>
        <p className="mt-1 font-mono text-4xl tracking-[0.3em]">{code}</p>
        <p className="mt-6 text-lg">{uz.play.lobbyTitle}</p>
      </Card>
    </main>
  );
}
