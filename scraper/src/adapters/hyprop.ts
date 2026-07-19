import * as cheerio from "cheerio";
import { CompanyAdapter, parseYYYYMMDD } from "../types.js";

const FEED_URL = "https://irhosted.profiledata.co.za/hyprop/2024_feeds/sens/N03_sens.aspx";

export const hyprop: CompanyAdapter = {
  jseCode: "HYP",
  async scrape() {
    const res = await fetch(FEED_URL);
    if (!res.ok) throw new Error(`Hyprop feed returned ${res.status}`);
    const $ = cheerio.load(await res.text());

    return $(".sens_row")
      .map((_, row) => {
        const titleLink = $(row).find(".title a");
        const title = titleLink.text().trim();
        const href = titleLink.attr("href");
        const dateText = $(row).find(".title span").text();
        if (!title || !href) return null;
        return {
          title,
          announcedAt: parseYYYYMMDD(dateText),
          sourceUrl: href,
        };
      })
      .get()
      .filter((x): x is NonNullable<typeof x> => x !== null);
  },
};
