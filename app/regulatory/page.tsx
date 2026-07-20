import { createClient } from "@/lib/supabase/server";

export default async function RegulatoryPage() {
  const supabase = await createClient();
  const { data: updates, error } = await supabase
    .from("regulatory_updates")
    .select(
      "id, source, title, document_url, published_date, published_year, regulatory_update_companies(companies(name, jse_code))",
    )
    .order("published_date", { ascending: false, nullsFirst: false })
    .order("published_year", { ascending: false })
    .limit(30);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-2">Regulatory Bodies</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl">
        REIT-relevant updates from the FSCA. FSCA press releases are almost
        entirely unrelated to REITs (unlicensed FSPs, debarments, insurance
        matters), so this page will often show nothing new — that&apos;s
        expected, not a bug. JSE and SARB don&apos;t currently offer an
        automatable source of dated, REIT-relevant regulatory news.
      </p>

      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm">
          Failed to load updates: {error.message}
        </p>
      )}

      {updates && updates.length === 0 && (
        <p className="text-zinc-500 text-sm">
          No REIT-relevant regulatory updates found yet.
        </p>
      )}

      {updates && updates.length > 0 && (
        <div className="flex flex-col gap-3 max-w-2xl">
          {updates.map((update) => {
            const companies = update.regulatory_update_companies.flatMap((link) =>
              ([] as { name: string; jse_code: string }[]).concat(link.companies ?? []),
            );

            return (
              <a
                key={update.id}
                href={update.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-black/[.08] dark:border-white/[.145] px-4 py-3 hover:bg-black/[.03] dark:hover:bg-white/[.05] transition-colors"
              >
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="font-medium text-sm">{update.title}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {update.published_date
                      ? new Date(update.published_date).toLocaleDateString("en-ZA")
                      : update.published_year}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{update.source}</span>
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
