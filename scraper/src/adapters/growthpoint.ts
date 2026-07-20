import * as cheerio from "cheerio";
import { CompanyAdapter, parseDDMMYYYYDotted } from "../types.js";

const FEED_URL = "https://irhosted.profiledata.co.za/Growthpoint/2024_feeds/N03B_SENS.aspx";

export const growthpoint: CompanyAdapter = {
  jseCode: "GRT",
  async scrape() {
    const res = await fetch(FEED_URL);
    if (!res.ok) throw new Error(`Growthpoint SENS page returned ${res.status}`);
    const $ = cheerio.load(await res.text());

    return $(".linkblock > .row")
      .not(".header")
      .map((_, row) => {
        const dateText = $(row).find(".date").text();
        // Live site's class name is misspelled "desription" (missing the first "c").
        const link = $(row).find(".desription a").first();
        const title = link.text().trim();
        const pdfHref = link.attr("href");
        if (!title || !pdfHref || !dateText) return null;
        return {
          title,
          announcedAt: parseDDMMYYYYDotted(dateText),
          sourceUrl: pdfHref,
        };
      })
      .get()
      .filter((x): x is NonNullable<typeof x> => x !== null);
  },
};
