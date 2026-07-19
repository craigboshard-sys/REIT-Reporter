import * as cheerio from "cheerio";

export type ScrapedEpisode = {
  guid: string;
  title: string;
  link: string;
  publishedAt: string;
  duration: string | null;
  audioUrl: string | null;
  description: string | null;
};

const FEED_URL = "https://rss.iono.fm/rss/chan/6203";

export async function scrapePropertyPod(): Promise<ScrapedEpisode[]> {
  const res = await fetch(FEED_URL);
  if (!res.ok) throw new Error(`Property Pod feed returned ${res.status}`);
  const $ = cheerio.load(await res.text(), { xmlMode: true });

  return $("item")
    .map((_, item) => {
      const $item = $(item);
      const guid = $item.find("guid").first().text().trim();
      const title = $item.find("title").first().text().trim();
      const link = $item.find("link").first().text().trim();
      const pubDate = $item.find("pubDate").first().text().trim();
      const duration = $item.find("itunes\\:duration").first().text().trim() || null;
      const audioUrl = $item.find("enclosure").first().attr("url") ?? null;
      const description = $item.find("description").first().text().trim() || null;

      if (!guid || !title || !link || !pubDate) return null;

      return {
        guid,
        title,
        link,
        publishedAt: new Date(pubDate).toISOString(),
        duration,
        audioUrl,
        description,
      };
    })
    .get()
    .filter((x): x is NonNullable<typeof x> => x !== null);
}
