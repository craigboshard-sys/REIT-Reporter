import * as cheerio from "cheerio";
import { CompanyAdapter, parseDDMonYYYY } from "../types.js";

const FEED_URL = "https://www.resilient.co.za/announcements";

export const resilient: CompanyAdapter = {
  jseCode: "RES",
  async scrape() {
    const res = await fetch(FEED_URL);
    if (!res.ok) throw new Error(`Resilient page returned ${res.status}`);
    const $ = cheerio.load(await res.text());

    return $("p.secondary-blue")
      .map((_, p) => {
        const row = $(p).closest("tr");
        const pdfHref = row.find('a[href$=".pdf"]').first().attr("href");
        const dateText = $(p).find("strong").text();
        const title = $(p)
          .clone()
          .children()
          .remove()
          .end()
          .text()
          .trim();
        if (!title || !pdfHref || !dateText) return null;
        return {
          title,
          announcedAt: parseDDMonYYYY(dateText),
          sourceUrl: pdfHref,
        };
      })
      .get()
      .filter((x): x is NonNullable<typeof x> => x !== null);
  },
};
