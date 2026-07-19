import { createClient } from "@/lib/supabase/server";

function formatDuration(duration: string | null) {
  if (!duration) return null;
  const parts = duration.split(":");
  return parts.length === 3 ? `${parts[0]}h ${parts[1]}m` : `${parts[0]}m`;
}

export default async function PodcastsPage() {
  const supabase = await createClient();
  const { data: episodes, error } = await supabase
    .from("podcast_episodes")
    .select(
      "id, title, link, published_at, duration, description, podcast_episode_companies(companies(name, jse_code))",
    )
    .order("published_at", { ascending: false })
    .limit(30);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-2">Podcasts</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl">
        Episodes of Moneyweb&apos;s The Property Pod, South Africa&apos;s
        property investor podcast.
      </p>

      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm">
          Failed to load episodes: {error.message}
        </p>
      )}

      {episodes && episodes.length === 0 && (
        <p className="text-zinc-500 text-sm">
          No episodes yet — the scraper runs daily.
        </p>
      )}

      {episodes && episodes.length > 0 && (
        <div className="flex flex-col gap-3 max-w-2xl">
          {episodes.map((episode) => {
            const companies = episode.podcast_episode_companies.flatMap((link) =>
              ([] as { name: string; jse_code: string }[]).concat(link.companies ?? []),
            );

            return (
              <a
                key={episode.id}
                href={episode.link}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-black/[.08] dark:border-white/[.145] px-4 py-3 hover:bg-black/[.03] dark:hover:bg-white/[.05] transition-colors"
              >
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="font-medium text-sm">{episode.title}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {new Date(episode.published_at).toLocaleDateString("en-ZA")}
                  </span>
                </div>
                {episode.description && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                    {episode.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>The Property Pod</span>
                  {formatDuration(episode.duration) && (
                    <>
                      <span>·</span>
                      <span>{formatDuration(episode.duration)}</span>
                    </>
                  )}
                  {companies.length > 0 && (
                    <>
                      <span>·</span>
                      {companies.map((c) => (
                        <span
                          key={c.jse_code}
                          className="rounded bg-black/[.06] dark:bg-white/[.1] px-1.5 py-0.5"
                        >
                          {c.jse_code}
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
