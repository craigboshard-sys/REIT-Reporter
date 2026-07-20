import * as cheerio from "cheerio";

export type ScrapedArticle = {
  title: string;
  url: string;
  publishedAt: string; // ISO datetime
  summary: string | null;
  source: string | null;
};

/**
 * One targeted query per company (exact-phrase match on its name) rather
 * than one shared feed, so each result is already known to belong to that
 * company -- no keyword/category matching needed afterwards.
 */
export async function scrapeGoogleNewsForCompany(companyName: string): Promise<ScrapedArticle[]> {
  const feedUrl =
    "https://news.google.com/rss/search?q=" +
    encodeURIComponent(`"${companyName}"`) +
    "&hl=en-ZA&gl=ZA&ceid=ZA:en";

  const res = await fetch(feedUrl);
  if (!res.ok) throw new Error(`Google News RSS returned ${res.status} for "${companyName}"`);
  const $ = cheerio.load(await res.text(), { xmlMode: true });

  return $("item")
    .map((_, item) => {
      const $item = $(item);
      const rawTitle = $item.find("title").first().text().trim();
      const url = $item.find("link").first().text().trim();
      const pubDate = $item.find("pubDate").first().text().trim();
      const source = $item.find("source").first().text().trim() || null;

      // Google News appends " - Source Name" to every title; strip it since
      // the source is stored (and displayed) separately.
      const title =
        source && rawTitle.endsWith(` - ${source}`)
          ? rawTitle.slice(0, -(source.length + 3)).trim()
          : rawTitle;

      if (!title || !url || !pubDate) return null;

      return {
        title,
        url,
        publishedAt: new Date(pubDate).toISOString(),
        summary: null,
        source,
      };
    })
    .get()
    .filter((x): x is NonNullable<typeof x> => x !== null);
}
