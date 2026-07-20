import * as cheerio from "cheerio";
import { fetchHtml } from "../http.js";
import { PeopleAdapter, ScrapedPerson, looksExecutive } from "./types.js";

const URL = "https://www.dipula.co.za/index.php/who-we-are/board";

export const dipula: PeopleAdapter = {
  jseCode: "DIB",
  async scrape() {
    const res = await fetchHtml(URL);
    if (!res.ok) throw new Error(`Dipula board page returned ${res.status}`);
    const $ = cheerio.load(await res.text());

    const people: ScrapedPerson[] = [];
    $(".white-block").each((_, el) => {
      const $el = $(el);
      const nameHtml = $el.find("h5.wp-block-heading").first().html() ?? "";
      const fullName = nameHtml
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]+>/g, "")
        .trim();
      if (!fullName) return;

      const roleParagraph = $el.find(".col-md-8 p.wp-block-paragraph").first();
      const roleTitle = (roleParagraph.html() ?? "")
        .replace(/<br\s*\/?>/gi, " — ")
        .replace(/<[^>]+>/g, "")
        .trim();

      const bio = $el.find(".accordion-block p").first().text().trim();

      people.push({
        fullName,
        roleTitle: roleTitle.split(" — ")[0] || roleTitle,
        isExecutive: looksExecutive(roleTitle),
        bio: bio.length > 20 ? bio : null,
      });
    });

    return people;
  },
};
