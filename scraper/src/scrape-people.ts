import { createClient } from "@supabase/supabase-js";
import { peopleAdapters } from "./people/index.js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select("id, jse_code");
  if (companiesError) throw companiesError;

  const companyIdByCode = new Map(companies.map((c) => [c.jse_code, c.id]));

  for (const adapter of peopleAdapters) {
    const companyId = companyIdByCode.get(adapter.jseCode);
    if (!companyId) {
      console.warn(`Skipping ${adapter.jseCode}: no matching company in database`);
      continue;
    }

    try {
      const people = await adapter.scrape();
      console.log(`${adapter.jseCode}: scraped ${people.length} people`);
      if (people.length === 0) continue;

      // Full replace per company: board/exec composition changes over time,
      // and a straight delete+insert avoids stale entries lingering after
      // someone leaves.
      const { error: deleteError } = await supabase
        .from("company_people")
        .delete()
        .eq("company_id", companyId);
      if (deleteError) {
        console.error(`${adapter.jseCode}: delete failed`, deleteError.message);
        continue;
      }

      const { error: insertError } = await supabase.from("company_people").insert(
        people.map((p) => ({
          company_id: companyId,
          full_name: p.fullName,
          role_title: p.roleTitle,
          is_executive: p.isExecutive,
          bio: p.bio,
        })),
      );
      if (insertError) {
        console.error(`${adapter.jseCode}: insert failed`, insertError.message);
      }
    } catch (err) {
      console.error(`${adapter.jseCode}: scrape failed`, (err as Error).message);
    }
  }
}

run();
