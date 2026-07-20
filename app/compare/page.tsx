import { createClient } from "@/lib/supabase/server";

type CompanyData = {
  id: string;
  name: string;
  jse_code: string;
  sector: string;
  has_international_exposure: boolean;
  shares_in_issue: number | null;
  price: number | null;
  priceDate: string | null;
  metric: {
    period_end: string;
    ltv: number | null;
    see_through_ltv: number | null;
    icr: number | null;
    nav_per_share: number | null;
    wacc: number | null;
    distribution_per_share: number | null;
    distribution_yield: number | null;
    payout_ratio: number | null;
    vacancy_rate: number | null;
    wale: number | null;
    avg_cost_of_debt: number | null;
    hedged_debt_pct: number | null;
  } | null;
};

function fmtPct(v: number | null | undefined) {
  return v === null || v === undefined ? "—" : `${v}%`;
}
function fmtX(v: number | null | undefined) {
  return v === null || v === undefined ? "—" : `${v}x`;
}
function fmtYears(v: number | null | undefined) {
  return v === null || v === undefined ? "—" : `${v} yrs`;
}
function fmtCurrency(v: number | null | undefined, compact = false) {
  return v === null || v === undefined
    ? "—"
    : v.toLocaleString("en-ZA", { style: "currency", currency: "ZAR", notation: compact ? "compact" : "standard" });
}

async function loadCompanyData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  jseCode: string,
): Promise<CompanyData | null> {
  const { data: company } = await supabase
    .from("companies")
    .select("id, name, jse_code, sector, has_international_exposure, shares_in_issue")
    .eq("jse_code", jseCode)
    .single();

  if (!company) return null;

  const [{ data: metric }, { data: priceRow }] = await Promise.all([
    supabase
      .from("financial_metrics")
      .select(
        "period_end, ltv, see_through_ltv, icr, nav_per_share, wacc, distribution_per_share, distribution_yield, payout_ratio, vacancy_rate, wale, avg_cost_of_debt, hedged_debt_pct",
      )
      .eq("company_id", company.id)
      .order("period_end", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("share_prices")
      .select("price_date, close_price")
      .eq("company_id", company.id)
      .order("price_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    ...company,
    price: priceRow?.close_price ?? null,
    priceDate: priceRow?.price_date ?? null,
    metric: metric ?? null,
  };
}

function Row({
  label,
  a,
  b,
}: {
  label: string;
  a: string;
  b: string;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 py-2 border-b border-black/[.06] dark:border-white/[.08] text-sm">
      <div className="text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className="text-right">{a}</div>
      <div className="text-right">{b}</div>
    </div>
  );
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const supabase = await createClient();
  const { data: companies } = await supabase
    .from("companies")
    .select("jse_code, name")
    .order("jse_code");

  const { a, b } = await searchParams;
  const codeA = a || companies?.[0]?.jse_code || "";
  const codeB = b || companies?.[1]?.jse_code || "";

  const [companyA, companyB] = await Promise.all([
    codeA ? loadCompanyData(supabase, codeA) : null,
    codeB ? loadCompanyData(supabase, codeB) : null,
  ]);

  const marketCapA =
    companyA?.price && companyA?.shares_in_issue ? companyA.price * companyA.shares_in_issue : null;
  const marketCapB =
    companyB?.price && companyB?.shares_in_issue ? companyB.price * companyB.shares_in_issue : null;
  const p2navA =
    companyA?.price && companyA?.metric?.nav_per_share ? companyA.price / companyA.metric.nav_per_share : null;
  const p2navB =
    companyB?.price && companyB?.metric?.nav_per_share ? companyB.price / companyB.metric.nav_per_share : null;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-2">Compare Companies</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl">
        Side-by-side comparison of key financial metrics for any two REITs.
      </p>

      <form className="flex flex-wrap items-end gap-4 mb-8">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Company A</span>
          <select
            name="a"
            defaultValue={codeA}
            className="rounded-md border border-black/[.12] dark:border-white/[.16] bg-transparent px-3 py-1.5 text-sm"
          >
            {companies?.map((c) => (
              <option key={c.jse_code} value={c.jse_code}>
                {c.name} ({c.jse_code})
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Company B</span>
          <select
            name="b"
            defaultValue={codeB}
            className="rounded-md border border-black/[.12] dark:border-white/[.16] bg-transparent px-3 py-1.5 text-sm"
          >
            {companies?.map((c) => (
              <option key={c.jse_code} value={c.jse_code}>
                {c.name} ({c.jse_code})
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md bg-black/[.06] dark:bg-white/[.1] px-4 py-1.5 text-sm font-medium hover:bg-black/[.1] dark:hover:bg-white/[.15] transition-colors"
        >
          Compare
        </button>
      </form>

      {(!companyA || !companyB) && (
        <p className="text-zinc-500 text-sm">Select two companies to compare.</p>
      )}

      {companyA && companyB && (
        <div className="max-w-3xl">
          <div className="grid grid-cols-3 gap-4 pb-2 mb-2 border-b border-black/[.12] dark:border-white/[.16]">
            <div />
            <div className="text-right font-medium text-sm">
              {companyA.name} <span className="text-zinc-500 dark:text-zinc-400">({companyA.jse_code})</span>
            </div>
            <div className="text-right font-medium text-sm">
              {companyB.name} <span className="text-zinc-500 dark:text-zinc-400">({companyB.jse_code})</span>
            </div>
          </div>

          <Row label="Sector" a={companyA.sector} b={companyB.sector} />
          <Row
            label="International exposure"
            a={companyA.has_international_exposure ? "Yes" : "No"}
            b={companyB.has_international_exposure ? "Yes" : "No"}
          />
          <Row
            label="Share price"
            a={fmtCurrency(companyA.price)}
            b={fmtCurrency(companyB.price)}
          />
          <Row label="Market Cap" a={fmtCurrency(marketCapA, true)} b={fmtCurrency(marketCapB, true)} />
          <Row
            label="NAV/share"
            a={fmtCurrency(companyA.metric?.nav_per_share)}
            b={fmtCurrency(companyB.metric?.nav_per_share)}
          />
          <Row label="Price-to-NAV" a={fmtX(p2navA)} b={fmtX(p2navB)} />
          <Row label="LTV" a={fmtPct(companyA.metric?.ltv)} b={fmtPct(companyB.metric?.ltv)} />
          <Row
            label="See-Through LTV"
            a={fmtPct(companyA.metric?.see_through_ltv)}
            b={fmtPct(companyB.metric?.see_through_ltv)}
          />
          <Row label="ICR" a={fmtX(companyA.metric?.icr)} b={fmtX(companyB.metric?.icr)} />
          <Row label="WACC" a={fmtPct(companyA.metric?.wacc)} b={fmtPct(companyB.metric?.wacc)} />
          <Row
            label="Avg cost of debt"
            a={fmtPct(companyA.metric?.avg_cost_of_debt)}
            b={fmtPct(companyB.metric?.avg_cost_of_debt)}
          />
          <Row
            label="Hedged debt"
            a={fmtPct(companyA.metric?.hedged_debt_pct)}
            b={fmtPct(companyB.metric?.hedged_debt_pct)}
          />
          <Row
            label="Distribution/share"
            a={fmtCurrency(companyA.metric?.distribution_per_share)}
            b={fmtCurrency(companyB.metric?.distribution_per_share)}
          />
          <Row
            label="Distribution yield"
            a={fmtPct(companyA.metric?.distribution_yield)}
            b={fmtPct(companyB.metric?.distribution_yield)}
          />
          <Row
            label="Payout ratio"
            a={fmtPct(companyA.metric?.payout_ratio)}
            b={fmtPct(companyB.metric?.payout_ratio)}
          />
          <Row
            label="Vacancy rate"
            a={fmtPct(companyA.metric?.vacancy_rate)}
            b={fmtPct(companyB.metric?.vacancy_rate)}
          />
          <Row label="WALE" a={fmtYears(companyA.metric?.wale)} b={fmtYears(companyB.metric?.wale)} />
        </div>
      )}
    </div>
  );
}
