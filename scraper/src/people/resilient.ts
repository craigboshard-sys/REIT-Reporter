import * as cheerio from "cheerio";
import { fetchHtml } from "../http.js";
import { PeopleAdapter, ScrapedPerson, looksExecutive } from "./types.js";

const URL = "https://www.resilient.co.za/directors";

export const resilient: PeopleAdapter = {
  jseCode: "RES",
  async scrape() {
    const res = await fetchHtml(URL);
    if (!res.ok) throw new Error(`Resilient directors page returned ${res.status}`);
    const $ = cheerio.load(await res.text());

    const people: ScrapedPerson[] = [];
    $(".member").each((_, el) => {
      const $el = $(el);
      const fullName = $el.find(".title").first().text().trim();
      const roleTitle = $el.find(".bottom p").eq(1).text().trim();
      const bio = $el.next(".modal").find(".modal-body p").first().text().trim();

      if (!fullName || !roleTitle) return;
      people.push({
        fullName,
        roleTitle,
        isExecutive: looksExecutive(roleTitle),
        bio: bio.length > 20 ? bio : null,
      });
    });

    return people;
  },
};
