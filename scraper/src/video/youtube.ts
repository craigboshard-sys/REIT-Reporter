export type ScrapedVideo = {
  videoId: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string | null;
  description: string;
};

// Broad, general queries rather than one per company (22 companies x 100
// quota units per search would burn through the free 10,000/day quota fast).
// Company tagging happens afterwards by matching title/description text.
const QUERIES = [
  "SA REIT interview",
  "JSE REIT results interview",
  "South Africa property fund CEO interview",
  "Property Pod Moneyweb",
];

const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

export async function scrapeYoutubeInterviews(apiKey: string): Promise<ScrapedVideo[]> {
  const publishedAfter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const byVideoId = new Map<string, ScrapedVideo>();

  for (const query of QUERIES) {
    const url = new URL(SEARCH_URL);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", query);
    url.searchParams.set("type", "video");
    url.searchParams.set("order", "date");
    url.searchParams.set("publishedAfter", publishedAfter);
    url.searchParams.set("maxResults", "15");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`YouTube API returned ${res.status} for query "${query}": ${body}`);
    }
    const json = await res.json();

    for (const item of json.items ?? []) {
      const videoId = item.id?.videoId;
      if (!videoId || byVideoId.has(videoId)) continue;
      byVideoId.set(videoId, {
        videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl: item.snippet.thumbnails?.medium?.url ?? null,
        description: item.snippet.description ?? "",
      });
    }
  }

  return [...byVideoId.values()];
}
