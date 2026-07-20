import * as cheerio from "cheerio";
import { fetchHtml } from "../http.js";
import { PeopleAdapter, ScrapedPerson, looksExecutive } from "./types.js";

const URLS = ["https://fairvest.co.za/board.php", "https://fairvest.co.za/management.php"];

export const fairvest: PeopleAdapter = {
  jseCode: "FTA",
  async scrape() {
    const seen = new Map<string, ScrapedPerson>();

    for (const url of URLS) {
      const res = await fetchHtml(url);
      if (!res.ok) continue;
      const $ = cheerio.load(await res.text());

      $(".card-wrapper").each((_, el) => {
        const $el = $(el);
        const fullName = $el.find(".card-details h5").first().text().trim();
        const roleTitle = $el.find(".card-details p em").first().text().trim();
        const paragraphs = $el
          .find(".card-information p")
          .toArray()
          .map((p) => $(p).text().trim())
          .filter((t) => t.length > 30);
        const bio = paragraphs.length > 0 ? paragraphs[paragraphs.length - 1] : null;

        if (!fullName || !roleTitle) return;
        const key = fullName.toLowerCase();
        if (!seen.has(key)) {
          seen.set(key, { fullName, roleTitle, isExecutive: looksExecutive(roleTitle), bio });
        }
      });
    }

    return [...seen.values()];
  },
};
