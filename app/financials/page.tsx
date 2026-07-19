import { createClient } from "@/lib/supabase/server";

function formatMetric(value: number | null, suffix: string) {
  return value === null ? "—" : `${value}${suffix}`;
}

export default async function FinancialsPage() {
  const supabase = await createClient();

  const [
    { data: companies, error: companiesError },
    { data: metrics, error: metricsError },
    { data: prices, error: pricesError },
  ] = await Promise.all([
    supabase.from("companies").select("id, name, jse_code, shares_in_issue").order("jse_code"),
    supabase
      .from("financial_metrics")
      .select("company_id, period_end, ltv, see_through_ltv, icr, nav_per_share")
      .order("period_end", { ascending: false }),
    supabase
      .from("share_prices")
      .select("company_id, price_date, close_price")
      .order("price_date", { ascending: false }),
  ]);

  const error = companiesError ?? metricsError ?? pricesError;

  const latestMetricByCompany = new Map<string, NonNullable<typeof metrics>[number]>();
  for (const m of metrics ?? []) {
    if (!latestMetricByCompany.has(m.company_id)) latestMetricByCompany.set(m.company_id, m);
  }

  const latestPriceByCompany = new Map<string, number>();
  for (const p of prices ?? []) {
    if (!latestPriceByCompany.has(p.company_id)) latestPriceByCompany.set(p.company_id, p.close_price);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-2">Financial Metrics</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl">
        Key metrics per REIT from interim/annual results. LTV, See-Through LTV,
        ICR, and NAV are entered manually via the Supabase Table Editor as each
        company reports; Market Cap is computed automatically from the latest
        share price.
      </p>

      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm">
          Failed to load financial metrics: {error.message}
        </p>
      )}

      {companies && companies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {companies.map((company) => {
            const metric = latestMetricByCompany.get(company.id);
            const price = latestPriceByCompany.get(company.id);
            const marketCap =
              price && company.shares_in_issue
                ? price * company.shares_in_issue
                : null;

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
                <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                  <dt className="text-zinc-500 dark:text-zinc-400">Market Cap</dt>
                  <dd className="text-right">
                    {marketCap
                      ? marketCap.toLocaleString("en-ZA", {
                          style: "currency",
                          currency: "ZAR",
                          notation: "compact",
                        })
                      : "—"}
                  </dd>
                  <dt className="text-zinc-500 dark:text-zinc-400">LTV</dt>
                  <dd className="text-right">{formatMetric(metric?.ltv ?? null, "%")}</dd>
                  <dt className="text-zinc-500 dark:text-zinc-400">See-Through LTV</dt>
                  <dd className="text-right">
                    {formatMetric(metric?.see_through_ltv ?? null, "%")}
                  </dd>
                  <dt className="text-zinc-500 dark:text-zinc-400">ICR</dt>
                  <dd className="text-right">{formatMetric(metric?.icr ?? null, "x")}</dd>
                  <dt className="text-zinc-500 dark:text-zinc-400">NAV/share</dt>
                  <dd className="text-right">
                    {metric?.nav_per_share
                      ? metric.nav_per_share.toLocaleString("en-ZA", {
                          style: "currency",
                          currency: "ZAR",
                        })
                      : "—"}
                  </dd>
                </dl>
                {metric && (
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                    as of {new Date(metric.period_end).toLocaleDateString("en-ZA")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
