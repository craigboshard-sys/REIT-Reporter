import { createClient } from "@/lib/supabase/server";

export default async function NewsPage() {
  const supabase = await createClient();
  const { data: articles, error } = await supabase
    .from("news_articles")
    .select(
      "id, title, url, source, published_at, summary, news_article_companies(companies(name, jse_code))",
    )
    .order("published_at", { ascending: false })
    .limit(30);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-2">News Articles</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl">
        SA property REIT news, aggregated from Moneyweb&apos;s property coverage and
        company-specific Google News searches.
      </p>

      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm">
          Failed to load articles: {error.message}
        </p>
      )}

      {articles && articles.length === 0 && (
        <p className="text-zinc-500 text-sm">
          No articles yet — the scraper runs every 2 hours.
        </p>
      )}

      {articles && articles.length > 0 && (
        <div className="flex flex-col gap-3 max-w-2xl">
          {articles.map((article) => {
            const companies = article.news_article_companies.flatMap((link) =>
              ([] as { name: string; jse_code: string }[]).concat(link.companies ?? []),
            );

            return (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-black/[.08] dark:border-white/[.145] px-4 py-3 hover:bg-black/[.03] dark:hover:bg-white/[.05] transition-colors"
              >
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="font-medium text-sm">{article.title}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {new Date(article.published_at).toLocaleDateString("en-ZA")}
                  </span>
                </div>
                {article.summary && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                    {article.summary}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{article.source}</span>
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
