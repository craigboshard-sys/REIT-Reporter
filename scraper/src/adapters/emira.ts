import * as cheerio from "cheerio";
import { CompanyAdapter, parseDDMonYYYY } from "../types.js";

const FEED_URL = "https://irhosted.profiledata.co.za/emira2/2016_feeds/N03_sens.aspx";
const BASE = "https://irhosted.profiledata.co.za/emira2/2016_feeds/";

export const emira: CompanyAdapter = {
  jseCode: "EMI",
  async scrape() {
    const res = await fetch(FEED_URL);
    if (!res.ok) throw new Error(`Emira feed returned ${res.status}`);
    const $ = cheerio.load(await res.text());

    return $("tr")
      .map((_, row) => {
        const dateCell = $(row).find("td.table_right").first();
        const link = $(row).find("td.sens_left a.sens");
        const title = link.text().trim();
        const idMatch = (link.attr("onclick") ?? "").match(/id=(\d+)/);
        const dateText = dateCell.text().trim();
        if (!title || !idMatch || !/\d{4}/.test(dateText)) return null;
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
