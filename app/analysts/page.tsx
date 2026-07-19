import { createClient } from "@/lib/supabase/server";

const RATING_STYLE: Record<string, string> = {
  buy: "bg-green-600/10 text-green-700 dark:text-green-400",
  hold: "bg-yellow-600/10 text-yellow-700 dark:text-yellow-400",
  sell: "bg-red-600/10 text-red-700 dark:text-red-400",
};

export default async function AnalystsPage() {
  const supabase = await createClient();

  const [
    { data: companies, error: companiesError },
    { data: ratings, error: ratingsError },
  ] = await Promise.all([
    supabase.from("companies").select("id, name, jse_code").order("jse_code"),
    supabase
      .from("analyst_coverage")
      .select("company_id, analyst_firm, rating, target_price, rating_date, notes")
      .order("rating_date", { ascending: false }),
  ]);

  const error = companiesError ?? ratingsError;

  const ratingsByCompany = new Map<string, NonNullable<typeof ratings>>();
  for (const r of ratings ?? []) {
    const list = ratingsByCompany.get(r.company_id) ?? [];
    list.push(r);
    ratingsByCompany.set(r.company_id, list);
  }

  const companiesWithCoverage = (companies ?? []).filter((c) => ratingsByCompany.has(c.id));

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-2">Analyst Coverage</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl">
        Buy/sell/hold consensus per REIT. No free API exists for analyst
        ratings, so these are added manually via the Supabase Table Editor as
        coverage is published.
      </p>

      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm">
          Failed to load analyst coverage: {error.message}
        </p>
      )}

      {companiesWithCoverage.length === 0 && !error && (
        <p className="text-zinc-500 text-sm">
          No analyst coverage entered yet — add rows to the{" "}
          <code>analyst_coverage</code> table in the Supabase Table Editor.
        </p>
      )}

      <div className="flex flex-col gap-3 max-w-2xl">
        {companiesWithCoverage.map((company) => {
          const companyRatings = ratingsByCompany.get(company.id) ?? [];
          const counts = { buy: 0, hold: 0, sell: 0 };
          for (const r of companyRatings) counts[r.rating as keyof typeof counts]++;

          return (
            <div
              key={company.id}
              className="rounded-lg border border-black/[.08] dark:border-white/[.145] px-4 py-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{company.name}</span>
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  {company.jse_code}
                </span>
              </div>
              <div className="flex gap-2 mb-3 text-xs">
                <span className="rounded bg-green-600/10 text-green-700 dark:text-green-400 px-1.5 py-0.5">
                  {counts.buy} Buy
                </span>
                <span className="rounded bg-yellow-600/10 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5">
                  {counts.hold} Hold
                </span>
                <span className="rounded bg-red-600/10 text-red-700 dark:text-red-400 px-1.5 py-0.5">
                  {counts.sell} Sell
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {companyRatings.map((r) => (
                  <div
                    key={`${r.analyst_firm}-${r.rating_date}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-zinc-600 dark:text-zinc-400">{r.analyst_firm}</span>
                    <div className="flex items-center gap-2">
                      {r.target_price && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          Target: {r.target_price.toLocaleString("en-ZA", {
                            style: "currency",
                            currency: "ZAR",
                          })}
                        </span>
                      )}
                      <span
                        className={`text-xs rounded px-1.5 py-0.5 uppercase font-medium ${RATING_STYLE[r.rating]}`}
                      >
                        {r.rating}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
