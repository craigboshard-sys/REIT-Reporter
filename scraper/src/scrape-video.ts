import { createClient } from "@supabase/supabase-js";
import { scrapeYoutubeInterviews } from "./video/youtube.js";
import { matchesCompany } from "./match-company.js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const youtubeApiKey = process.env.YOUTUBE_API_KEY;

if (!supabaseUrl || !serviceRoleKey || !youtubeApiKey) {
  throw new Error("SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and YOUTUBE_API_KEY must be set");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select("id, name");
  if (companiesError) throw companiesError;

  const videos = await scrapeYoutubeInterviews(youtubeApiKey!);
  console.log(`Scraped ${videos.length} videos from YouTube`);

  for (const video of videos) {
    const { data: inserted, error: insertError } = await supabase
      .from("video_interviews")
      .upsert(
        {
          video_id: video.videoId,
          title: video.title,
          channel_title: video.channelTitle,
          published_at: video.publishedAt,
          thumbnail_url: video.thumbnailUrl,
          description: video.description,
        },
        { onConflict: "video_id" },
      )
      .select("id")
      .single();

    if (insertError) {
      console.error(`Failed to upsert "${video.title}"`, insertError.message);
      continue;
    }

    const matchedCompanyIds = companies
      .filter((c) => matchesCompany([video.title, video.description], c.name))
      .map((c) => c.id);

    if (matchedCompanyIds.length > 0) {
      const { error: linkError } = await supabase
        .from("video_interview_companies")
        .upsert(
          matchedCompanyIds.map((company_id) => ({
            video_interview_id: inserted.id,
            company_id,
          })),
          { onConflict: "video_interview_id,company_id", ignoreDuplicates: true },
        );
      if (linkError) {
        console.error(`Failed to link companies for "${video.title}"`, linkError.message);
      }
    }
  }
}

run();
