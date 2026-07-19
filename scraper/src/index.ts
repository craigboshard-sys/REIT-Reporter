import { createClient } from "@supabase/supabase-js";
import { adapters } from "./companies.js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const { data: companies, error } = await supabase
    .from("companies")
    .select("id, jse_code");

  if (error) throw error;

  const companyIdByCode = new Map(companies.map((c) => [c.jse_code, c.id]));

  for (const adapter of adapters) {
    const companyId = companyIdByCode.get(adapter.jseCode);
    if (!companyId) {
      console.warn(`Skipping ${adapter.jseCode}: no matching company in database`);
      continue;
    }

    try {
      const announcements = await adapter.scrape();
      console.log(`${adapter.jseCode}: scraped ${announcements.length} announcements`);

      if (announcements.length === 0) continue;

      const { error: upsertError } = await supabase.from("sens_announcements").upsert(
        announcements.map((a) => ({
          company_id: companyId,
          title: a.title,
          announced_at: a.announcedAt,
          source_url: a.sourceUrl,
          source: adapter.jseCode,
        })),
        { onConflict: "company_id,title,announced_at", ignoreDuplicates: true },
      );

      if (upsertError) {
        console.error(`${adapter.jseCode}: upsert failed`, upsertError.message);
      }
    } catch (err) {
      console.error(`${adapter.jseCode}: scrape failed`, (err as Error).message);
    }
  }
}

run();
