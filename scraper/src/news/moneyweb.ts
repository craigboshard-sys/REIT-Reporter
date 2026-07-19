import * as cheerio from "cheerio";

export type ScrapedArticle = {
  title: string;
  url: string;
  publishedAt: string; // ISO datetime
  summary: string | null;
  categories: string[];
};

const FEED_URL = "https://www.moneyweb.co.za/category/investing/property/feed/";

export async function scrapeMoneywebProperty(): Promise<ScrapedArticle[]> {
  const res = await fetch(FEED_URL);
  if (!res.ok) throw new Error(`Moneyweb feed returned ${res.status}`);
  const $ = cheerio.load(await res.text(), { xmlMode: true });

  return $("item")
    .map((_, item) => {
      const $item = $(item);
      const title = $item.find("title").first().text().trim();
      const url = $item.find("link").first().text().trim();
      const pubDate = $item.find("pubDate").first().text().trim();
      const summary = $item.find("description").first().text().trim() || null;
      const categories = $item
        .find("category")
        .map((_, cat) => $(cat).text().trim())
        .get();

      if (!title || !url || !pubDate) return null;

      return {
        title,
        url,
        publishedAt: new Date(pubDate).toISOString(),
        summary,
        categories,
      };
    })
    .get()
    .filter((x): x is NonNullable<typeof x> => x !== null);
}
