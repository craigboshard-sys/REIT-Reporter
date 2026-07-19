import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const FEED_URL = "https://custom.resbank.co.za/SarbWebApi/WebIndicators/HomePageRates";

// Only interest rate and inflation indicators, per the project's macro
// indicators scope (exchange rates are out of scope for now).
const RELEVANT_SECTIONS = new Set(["HPRIR", "HPRINT"]);

type SarbRate = {
  Name: string;
  SectionId: string;
  SectionName: string;
  TimeseriesCode: string;
  Date: string;
  Value: number;
};

async function run() {
  const res = await fetch(FEED_URL);
  if (!res.ok) throw new Error(`SARB API returned ${res.status}`);
  const rates: SarbRate[] = await res.json();

  const relevant = rates.filter((r) => RELEVANT_SECTIONS.has(r.SectionId));
  console.log(`Fetched ${rates.length} indicators, ${relevant.length} in scope`);

  const { error } = await supabase.from("macro_indicators").upsert(
    relevant.map((r) => ({
      timeseries_code: r.TimeseriesCode,
      name: r.Name,
      category: r.SectionName,
      value: r.Value,
      observation_date: r.Date,
    })),
    { onConflict: "timeseries_code,observation_date" },
  );

  if (error) throw error;
  console.log("Upserted successfully");
}

run();
