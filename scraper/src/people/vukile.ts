import * as cheerio from "cheerio";
import { fetchHtml } from "../http.js";
import { PeopleAdapter, ScrapedPerson, looksExecutive } from "./types.js";

const URL = "https://www.vukile.co.za/leadership-team/";

// Full bios live on separate per-person pages (e.g. /people/laurence-rapp/)
// -- names and roles only from this overview page.
export const vukile: PeopleAdapter = {
  jseCode: "VKE",
  async scrape() {
    const res = await fetchHtml(URL);
    if (!res.ok) throw new Error(`Vukile leadership team page returned ${res.status}`);
    const $ = cheerio.load(await res.text());

    const seen = new Map<string, ScrapedPerson>();
    $("article.vukile-person").each((_, el) => {
      const $el = $(el);
      const fullName = $el.find("h3 a").first().text().trim();
      const roleTitle = $el.find(".vukile-person__position").first().text().trim();
      if (!fullName || !roleTitle) return;
      seen.set(fullName.toLowerCase(), {
        fullName,
        roleTitle,
        isExecutive: looksExecutive(roleTitle),
        bio: null,
      });
    });

    return [...seen.values()];
  },
};
