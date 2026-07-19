import { createClient } from "@supabase/supabase-js";
import { scrapePropertyPod } from "./podcasts/property-pod.js";
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

  const episodes = await scrapePropertyPod();
  console.log(`Scraped ${episodes.length} episodes from The Property Pod`);

  for (const episode of episodes) {
    const { data: inserted, error: insertError } = await supabase
      .from("podcast_episodes")
      .upsert(
        {
          guid: episode.guid,
          title: episode.title,
          link: episode.link,
          published_at: episode.publishedAt,
          duration: episode.duration,
          audio_url: episode.audioUrl,
          description: episode.description,
        },
        { onConflict: "guid" },
      )
      .select("id")
      .single();

    if (insertError) {
      console.error(`Failed to upsert "${episode.title}"`, insertError.message);
      continue;
    }

    const matchedCompanyIds = companies
      .filter((c) => matchesCompany([episode.title, episode.description ?? ""], c.name))
      .map((c) => c.id);

    if (matchedCompanyIds.length > 0) {
      const { error: linkError } = await supabase
        .from("podcast_episode_companies")
        .upsert(
          matchedCompanyIds.map((company_id) => ({
            podcast_episode_id: inserted.id,
            company_id,
          })),
          { onConflict: "podcast_episode_id,company_id", ignoreDuplicates: true },
        );
      if (linkError) {
        console.error(`Failed to link companies for "${episode.title}"`, linkError.message);
      }
    }
  }
}

run();
