export function FormMessage({ error, success }: { error?: string; success?: string }) {
  if (error) return <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-300">{error}</p>;
  if (success) return <p className="rounded-lg bg-green-950 px-3 py-2 text-sm text-green-300">{success}</p>;
  return null;
}
