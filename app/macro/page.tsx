import { createClient } from "@/lib/supabase/server";

export default async function MacroPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("macro_indicators")
    .select("timeseries_code, name, category, value, observation_date")
    .order("observation_date", { ascending: false });

  type Indicator = { name: string; category: string; value: number; date: string };

  const latestByCode = new Map<string, Indicator>();
  for (const row of data ?? []) {
    if (!latestByCode.has(row.timeseries_code)) {
      latestByCode.set(row.timeseries_code, {
        name: row.name,
        category: row.category,
        value: row.value,
        date: row.observation_date,
      });
    }
  }

  const byCategory = new Map<string, Indicator[]>();
  for (const indicator of latestByCode.values()) {
    const list = byCategory.get(indicator.category) ?? [];
    list.push(indicator);
    byCategory.set(indicator.category, list);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-2">Macro Indicators</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl">
        Interest rates, inflation, and bond yields, sourced directly from the
        South African Reserve Bank.
      </p>

      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm">
          Failed to load macro indicators: {error.message}
        </p>
      )}

      {byCategory.size === 0 && !error && (
        <p className="text-zinc-500 text-sm">
          No data yet — the scraper runs daily.
        </p>
      )}

      <div className="flex flex-col gap-6">
        {[...byCategory.entries()].map(([category, indicators]) => (
          <div key={category}>
            <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-2">
              {category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {indicators.map((indicator) => (
                <div
                  key={indicator.name}
                  className="rounded-lg border border-black/[.08] dark:border-white/[.145] px-4 py-3"
                >
                  <div className="text-sm font-medium mb-1">{indicator.name}</div>
                  <div className="text-lg font-semibold">{indicator.value}%</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    as of {new Date(indicator.date).toLocaleDateString("en-ZA")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
