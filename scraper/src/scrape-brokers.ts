import { createClient } from "@supabase/supabase-js";
import { scrapeCurrieGroup } from "./brokers/currie-group.js";
import { matchesCompany } from "./match-company.js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select("id, name");
  if (companiesError) throw companiesError;

  const updates = await scrapeCurrieGroup();
  console.log(`Scraped ${updates.length} updates from Currie Group`);

  for (const update of updates) {
    const { data: inserted, error: insertError } = await supabase
      .from("broker_updates")
      .upsert(
        {
          broker: "Currie Group",
          title: update.title,
          url: update.url,
          published_at: update.publishedAt,
        },
        { onConflict: "url" },
      )
      .select("id")
      .single();

    if (insertError) {
      console.error(`Failed to upsert "${update.title}"`, insertError.message);
      continue;
    }

    const matchedCompanyIds = companies
      .filter((c) => matchesCompany([update.title], c.name))
      .map((c) => c.id);

    if (matchedCompanyIds.length > 0) {
      const { error: linkError } = await supabase
        .from("broker_update_companies")
        .upsert(
          matchedCompanyIds.map((company_id) => ({
            broker_update_id: inserted.id,
            company_id,
          })),
          { onConflict: "broker_update_id,company_id", ignoreDuplicates: true },
        );
      if (linkError) {
        console.error(`Failed to link companies for "${update.title}"`, linkError.message);
      }
    }
  }
}

run();
