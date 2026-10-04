import { getSticker } from "@/lib/stickers";

export function Sticker({ id, size = 48, className = "" }: { id: string; size?: number; className?: string }) {
  const s = getSticker(id);
  return (
    <span
      role="img"
      aria-label={s.id}
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full ${className}`}
      style={{ width: size, height: size, background: s.bg, fontSize: size * 0.58, lineHeight: 1 }}
    >
      {s.emoji}
    </span>
  );
}
