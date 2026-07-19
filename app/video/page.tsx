import { createClient } from "@/lib/supabase/server";

export default async function VideoPage() {
  const supabase = await createClient();
  const { data: videos, error } = await supabase
    .from("video_interviews")
    .select(
      "id, title, video_id, channel_title, published_at, thumbnail_url, video_interview_companies(companies(name, jse_code))",
    )
    .order("published_at", { ascending: false })
    .limit(30);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-2">Video / Interviews</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl">
        TV and YouTube interviews with REIT executives and analysts, found via
        the YouTube Data API.
      </p>

      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm">
          Failed to load videos: {error.message}
        </p>
      )}

      {videos && videos.length === 0 && (
        <p className="text-zinc-500 text-sm">
          No videos yet — the scraper runs daily.
        </p>
      )}

      {videos && videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {videos.map((video) => {
            const companies = video.video_interview_companies.flatMap((link) =>
              ([] as { name: string; jse_code: string }[]).concat(link.companies ?? []),
            );

            return (
              <a
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.video_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-black/[.08] dark:border-white/[.145] overflow-hidden hover:bg-black/[.03] dark:hover:bg-white/[.05] transition-colors"
              >
                {video.thumbnail_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full aspect-video object-cover"
                  />
                )}
                <div className="px-3 py-2">
                  <div className="font-medium text-sm line-clamp-2 mb-1">{video.title}</div>
                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>{video.channel_title}</span>
                    <span>{new Date(video.published_at).toLocaleDateString("en-ZA")}</span>
                  </div>
                  {companies.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {companies.map((c) => (
                        <span
                          key={c.jse_code}
                          className="text-xs rounded bg-black/[.06] dark:bg-white/[.1] px-1.5 py-0.5"
                        >
                          {c.jse_code}
                        </span>
                      ))}
                    </div>
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
