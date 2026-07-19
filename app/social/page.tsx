import { createClient } from "@/lib/supabase/server";

const PLATFORM_LABEL: Record<string, string> = {
  linkedin: "LinkedIn",
  x: "X",
};

export default async function SocialPage() {
  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from("social_media_posts")
    .select("id, platform, post_url, author, note, posted_at, companies(name, jse_code)")
    .order("posted_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-2">Social Media Posts</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl">
        Curated LinkedIn and X posts about SA REITs. LinkedIn and X don&apos;t
        offer a usable free API for reading public posts (and scraping either
        violates their terms of use), so these are added manually via the
        Supabase Table Editor when something worth sharing comes up.
      </p>

      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm">
          Failed to load posts: {error.message}
        </p>
      )}

      {posts && posts.length === 0 && (
        <p className="text-zinc-500 text-sm">
          No posts curated yet — add rows to the{" "}
          <code>social_media_posts</code> table in the Supabase Table Editor.
        </p>
      )}

      {posts && posts.length > 0 && (
        <div className="flex flex-col gap-3 max-w-2xl">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.post_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-black/[.08] dark:border-white/[.145] px-4 py-3 hover:bg-black/[.03] dark:hover:bg-white/[.05] transition-colors block"
            >
              <div className="flex items-center justify-between mb-1 gap-2">
                <span className="font-medium text-sm">
                  {PLATFORM_LABEL[post.platform] ?? post.platform}
                  {post.author && ` · ${post.author}`}
                </span>
                {post.posted_at && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {new Date(post.posted_at).toLocaleDateString("en-ZA")}
                  </span>
                )}
              </div>
              {post.note && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">{post.note}</p>
              )}
              {([] as { name: string; jse_code: string }[])
                .concat(post.companies ?? [])
                .map((c) => (
                  <span
                    key={c.jse_code}
                    className="text-xs rounded bg-black/[.06] dark:bg-white/[.1] px-1.5 py-0.5"
                  >
                    {c.jse_code}
                  </span>
                ))}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
