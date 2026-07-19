import { createClient } from "@/lib/supabase/server";

type PriceRow = {
  company_id: string;
  price_date: string;
  close_price: number;
};

function buildLatestAndChange(prices: PriceRow[]) {
  const byCompany = new Map<string, PriceRow[]>();
  for (const p of prices) {
    const list = byCompany.get(p.company_id) ?? [];
    list.push(p);
    byCompany.set(p.company_id, list);
  }

  const result = new Map<
    string,
    { latest: number; date: string; change: number | null; changePct: number | null }
  >();

  for (const [companyId, rows] of byCompany) {
    const sorted = [...rows].sort((a, b) => (a.price_date < b.price_date ? 1 : -1));
    const [latest, previous] = sorted;
    const change = previous ? latest.close_price - previous.close_price : null;
    const changePct = previous && previous.close_price !== 0
      ? (change! / previous.close_price) * 100
      : null;
    result.set(companyId, {
      latest: latest.close_price,
      date: latest.price_date,
      change,
      changePct,
    });
  }

  return result;
}

export default async function MarketPage() {
  const supabase = await createClient();

  const [{ data: companies, error: companiesError }, { data: prices, error: pricesError }] =
    await Promise.all([
      supabase.from("companies").select("id, name, jse_code").order("jse_code"),
      supabase
        .from("share_prices")
        .select("company_id, price_date, close_price")
        .order("price_date", { ascending: false }),
    ]);

  const error = companiesError ?? pricesError;
  const priceByCompany = buildLatestAndChange(prices ?? []);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-2">Market Data</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl">
        Share prices for JSE-listed REITs. Entered manually for now (no market
        data subscription yet) — add rows to the <code>share_prices</code> table
        in the Supabase Table Editor.
      </p>

      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm">
          Failed to load market data: {error.message}
        </p>
      )}

      {companies && companies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {companies.map((company) => {
            const price = priceByCompany.get(company.id);
            return (
              <div
                key={company.id}
                className="rounded-lg border border-black/[.08] dark:border-white/[.145] px-4 py-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{company.name}</span>
                  <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                    {company.jse_code}
                  </span>
                </div>
                {price ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-semibold">
                      {price.latest.toLocaleString("en-ZA", {
                        style: "currency",
                        currency: "ZAR",
                      })}
                    </span>
                    {price.change !== null && (
                      <span
                        className={`text-sm ${
                          price.change > 0
                            ? "text-green-600 dark:text-green-400"
                            : price.change < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-zinc-500"
                        }`}
                      >
                        {price.change > 0 ? "+" : ""}
                        {price.changePct?.toFixed(2)}%
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-zinc-500">No price data yet</span>
                )}
                {price && (
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    as of {new Date(price.date).toLocaleDateString("en-ZA")}
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
