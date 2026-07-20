import { createClient } from "@/lib/supabase/server";

function formatPct(value: number | null) {
  return value === null || value === undefined ? "—" : `${value}%`;
}

function formatX(value: number | null) {
  return value === null || value === undefined ? "—" : `${value}x`;
}

function formatYears(value: number | null) {
  return value === null || value === undefined ? "—" : `${value} yrs`;
}

function formatCurrency(value: number | null, compact = false) {
  return value === null || value === undefined
    ? "—"
    : value.toLocaleString("en-ZA", {
        style: "currency",
        currency: "ZAR",
        notation: compact ? "compact" : "standard",
      });
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
      .select(
        "company_id, period_end, ltv, see_through_ltv, icr, nav_per_share, wacc, distribution_per_share, distribution_yield, payout_ratio, vacancy_rate, wale, avg_cost_of_debt, hedged_debt_pct",
      )
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
        Key ratios per REIT from interim/annual results, entered manually via
        the Supabase Table Editor as each company reports. Market Cap and
        Price-to-NAV are computed automatically from the latest share price.
      </p>

      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm">
          Failed to load financial metrics: {error.message}
        </p>
      )}

      {companies && companies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {companies.map((company) => {
            const metric = latestMetricByCompany.get(company.id);
            const price = latestPriceByCompany.get(company.id);
            const marketCap =
              price && company.shares_in_issue ? price * company.shares_in_issue : null;
            const priceToNav =
              price && metric?.nav_per_share ? price / metric.nav_per_share : null;

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
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                  <dt className="text-zinc-500 dark:text-zinc-400">Market Cap</dt>
                  <dd className="text-right">{formatCurrency(marketCap, true)}</dd>

                  <dt className="text-zinc-500 dark:text-zinc-400">NAV/share</dt>
                  <dd className="text-right">{formatCurrency(metric?.nav_per_share ?? null)}</dd>

                  <dt className="text-zinc-500 dark:text-zinc-400">Price-to-NAV</dt>
                  <dd className="text-right">{formatX(priceToNav)}</dd>

                  <dt className="text-zinc-500 dark:text-zinc-400">LTV</dt>
                  <dd className="text-right">{formatPct(metric?.ltv ?? null)}</dd>

                  <dt className="text-zinc-500 dark:text-zinc-400">See-Through LTV</dt>
                  <dd className="text-right">{formatPct(metric?.see_through_ltv ?? null)}</dd>

                  <dt className="text-zinc-500 dark:text-zinc-400">ICR</dt>
                  <dd className="text-right">{formatX(metric?.icr ?? null)}</dd>

                  <dt className="text-zinc-500 dark:text-zinc-400">WACC</dt>
                  <dd className="text-right">{formatPct(metric?.wacc ?? null)}</dd>

                  <dt className="text-zinc-500 dark:text-zinc-400">Avg cost of debt</dt>
                  <dd className="text-right">{formatPct(metric?.avg_cost_of_debt ?? null)}</dd>

                  <dt className="text-zinc-500 dark:text-zinc-400">Hedged debt</dt>
                  <dd className="text-right">{formatPct(metric?.hedged_debt_pct ?? null)}</dd>

                  <dt className="text-zinc-500 dark:text-zinc-400">Distribution/share</dt>
                  <dd className="text-right">
                    {formatCurrency(metric?.distribution_per_share ?? null)}
                  </dd>

                  <dt className="text-zinc-500 dark:text-zinc-400">Distribution yield</dt>
                  <dd className="text-right">{formatPct(metric?.distribution_yield ?? null)}</dd>

                  <dt className="text-zinc-500 dark:text-zinc-400">Payout ratio</dt>
                  <dd className="text-right">{formatPct(metric?.payout_ratio ?? null)}</dd>

                  <dt className="text-zinc-500 dark:text-zinc-400">Vacancy rate</dt>
                  <dd className="text-right">{formatPct(metric?.vacancy_rate ?? null)}</dd>

                  <dt className="text-zinc-500 dark:text-zinc-400">WALE</dt>
                  <dd className="text-right">{formatYears(metric?.wale ?? null)}</dd>
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
