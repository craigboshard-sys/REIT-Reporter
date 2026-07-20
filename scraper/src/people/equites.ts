import * as cheerio from "cheerio";
import { fetchHtml } from "../http.js";
import { PeopleAdapter, ScrapedPerson, looksExecutive } from "./types.js";

const URL = "https://equites.co.za/about/corporate-governance/";

// Bios live in modals populated by JavaScript at runtime, not present in the
// static HTML -- only name + role are reliably scrapable here.
export const equites: PeopleAdapter = {
  jseCode: "EQU",
  async scrape() {
    const res = await fetchHtml(URL);
    if (!res.ok) throw new Error(`Equites governance page returned ${res.status}`);
    const $ = cheerio.load(await res.text());

    const people: ScrapedPerson[] = [];
    $(".board").each((_, el) => {
      const $el = $(el);
      const fullName = $el.find("h4").first().text().trim();
      const roleHtml = $el.find("p").first().html() ?? "";
      const roleTitle = roleHtml
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();

      if (!fullName || !roleTitle) return;
      people.push({
        fullName,
        roleTitle,
        isExecutive: looksExecutive(roleTitle),
        bio: null,
      });
    });

    return people;
  },
};
