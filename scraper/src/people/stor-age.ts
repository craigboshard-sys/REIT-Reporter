import * as cheerio from "cheerio";
import { fetchHtml } from "../http.js";
import { PeopleAdapter, ScrapedPerson, looksExecutive } from "./types.js";

const URLS = [
  "https://investor-relations.stor-age.co.za/board-of-directors",
  "https://investor-relations.stor-age.co.za/Executive-Management-Team",
];

export const storAge: PeopleAdapter = {
  jseCode: "SSS",
  async scrape() {
    const seen = new Map<string, ScrapedPerson>();

    for (const url of URLS) {
      const res = await fetchHtml(url);
      if (!res.ok) continue;
      const $ = cheerio.load(await res.text());

      $("table.tbl-portrait-bio tr").each((_, row) => {
        const $cells = $(row).find("td");
        if ($cells.length < 2) return;
        const infoCell = $cells.eq(1);
        const fullName = infoCell.find("strong").first().text().replace(/:\s*$/, "").trim();
        const roleTitle = infoCell.find("em").first().text().trim();
        if (!fullName || !roleTitle) return;

        const clone = infoCell.clone();
        clone.find("strong, em").remove();
        const bio = clone.text().replace(/\s+/g, " ").trim();

        const key = fullName.toLowerCase();
        if (!seen.has(key)) {
          seen.set(key, {
            fullName,
            roleTitle,
            isExecutive: looksExecutive(roleTitle),
            bio: bio.length > 20 ? bio : null,
          });
        }
      });
    }

    return [...seen.values()];
  },
};
