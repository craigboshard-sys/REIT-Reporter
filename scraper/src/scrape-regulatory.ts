import { createClient } from "@supabase/supabase-js";
import { scrapeFsca } from "./regulatory/fsca.js";
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

  const updates = await scrapeFsca();
  console.log(`Scraped ${updates.length} FSCA updates`);

  // Unlike news/podcasts/video, store only REIT-relevant items -- FSCA's
  // releases are almost entirely unrelated (unlicensed FSPs, debarments,
  // insurance matters), so ingesting everything would just be noise.
  let relevantCount = 0;

  for (const update of updates) {
    const matchedCompanyIds = companies
      .filter((c) => matchesCompany([update.title], c.name))
      .map((c) => c.id);

    if (matchedCompanyIds.length === 0) continue;
    relevantCount++;

    const { data: inserted, error: insertError } = await supabase
      .from("regulatory_updates")
      .upsert(
        {
          source: "FSCA",
          title: update.title,
          document_url: update.documentUrl,
          published_date: update.publishedDate,
          published_year: update.publishedYear,
        },
        { onConflict: "document_url" },
      )
      .select("id")
      .single();

    if (insertError) {
      console.error(`Failed to upsert "${update.title}"`, insertError.message);
      continue;
    }

    const { error: linkError } = await supabase
      .from("regulatory_update_companies")
      .upsert(
        matchedCompanyIds.map((company_id) => ({
          regulatory_update_id: inserted.id,
          company_id,
        })),
        { onConflict: "regulatory_update_id,company_id", ignoreDuplicates: true },
      );
    if (linkError) {
      console.error(`Failed to link companies for "${update.title}"`, linkError.message);
    }
  }

  console.log(`${relevantCount} of ${updates.length} were REIT-relevant and stored`);
}

run();
