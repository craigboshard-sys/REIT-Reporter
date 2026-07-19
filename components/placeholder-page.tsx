export function PlaceholderPage({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase: number;
}) {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight mb-2">{title}</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-4">{description}</p>
      <div className="inline-block rounded-md bg-black/[.04] px-3 py-1.5 text-sm text-zinc-600 dark:bg-white/[.06] dark:text-zinc-400">
        Planned for Phase {phase}
      </div>
    </div>
  );
}
