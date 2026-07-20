import * as cheerio from "cheerio";

export type ScrapedBrokerUpdate = {
  title: string;
  url: string;
  publishedAt: string | null; // ISO date
};

const FEED_URL = "https://curriegroup.co.za/news/";

const MONTHS: Record<string, string> = {
  january: "01", february: "02", march: "03", april: "04", may: "05", june: "06",
  july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
};

function parseDate(text: string): string | null {
  const match = text.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s+(\d{4})/i);
  if (!match) return null;
  const [, monthName, day, year] = match;
  const month = MONTHS[monthName.toLowerCase()];
  return month ? `${year}-${month}-${day.padStart(2, "0")}` : null;
}

export async function scrapeCurrieGroup(): Promise<ScrapedBrokerUpdate[]> {
  const res = await fetch(FEED_URL);
  if (!res.ok) throw new Error(`Currie Group news page returned ${res.status}`);
  const $ = cheerio.load(await res.text());

  return $("li.post-card")
    .map((_, card) => {
      const $card = $(card);
      const title = $card.find("h4.fusion-title-heading").first().text().trim();
      const url = $card.find("a.fusion-column-anchor").first().attr("href");
      const dateText = $card.find("span.fusion-tb-published-date").first().text().trim();

      if (!title || !url) return null;

      return {
        title,
        url,
        publishedAt: parseDate(dateText),
      };
    })
    .get()
    .filter((x): x is NonNullable<typeof x> => x !== null);
}
