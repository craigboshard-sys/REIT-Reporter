import * as cheerio from "cheerio";
import { CompanyAdapter, parseDDMonYYYY } from "../types.js";

const FEED_URL = "https://irhosted.profiledata.co.za/vukile/2023_feeds/N03_sens.aspx";
const BASE = "https://irhosted.profiledata.co.za/vukile/2023_feeds/";

export const vukile: CompanyAdapter = {
  jseCode: "VKE",
  async scrape() {
    const res = await fetch(FEED_URL);
    if (!res.ok) throw new Error(`Vukile feed returned ${res.status}`);
    const $ = cheerio.load(await res.text());

    return $(".articles_row.card")
      .map((_, row) => {
        const dateText = $(row).find(".date").text();
        const link = $(row).find(".link a");
        const title = link.text().trim();
        const idMatch = (link.attr("onclick") ?? "").match(/id=(\d+)/);
        if (!title || !idMatch) return null;
        return {
          title,
          announcedAt: parseDDMonYYYY(dateText),
          sourceUrl: `${BASE}SensPopUp.aspx?id=${idMatch[1]}`,
        };
      })
      .get()
      .filter((x): x is NonNullable<typeof x> => x !== null);
  },
};
