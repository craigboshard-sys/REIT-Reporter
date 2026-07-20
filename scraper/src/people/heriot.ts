import * as cheerio from "cheerio";
import { fetchHtml } from "../http.js";
import { PeopleAdapter, ScrapedPerson, looksExecutive } from "./types.js";

const URL = "https://www.heriotreit.com/directors.php";

// No bios available on this page -- names and roles only.
export const heriot: PeopleAdapter = {
  jseCode: "HET",
  async scrape() {
    const res = await fetchHtml(URL);
    if (!res.ok) throw new Error(`Heriot directors page returned ${res.status}`);
    const $ = cheerio.load(await res.text());

    const people: ScrapedPerson[] = [];
    $("h3").each((_, el) => {
      const $el = $(el);
      const fullName = $el.text().trim();
      const roleTitle = $el.next("p.font-serif").text().trim();
      if (!fullName || !roleTitle) return;
      // Skip regional office / department staff (e.g. "CFO - Pretoria Office",
      // "Finance - H/O") -- keep group-level board and executive roles only.
      if (roleTitle.includes(" - ") || roleTitle.includes("H/O")) return;
      people.push({ fullName, roleTitle, isExecutive: looksExecutive(roleTitle), bio: null });
    });

    return people;
  },
};
