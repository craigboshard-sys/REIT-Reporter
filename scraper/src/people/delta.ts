import * as cheerio from "cheerio";
import { fetchHtml } from "../http.js";
import { PeopleAdapter, ScrapedPerson, looksExecutive } from "./types.js";

const URL = "https://www.deltafund.co.za/board-of-directors/";

export const delta: PeopleAdapter = {
  jseCode: "DLT",
  async scrape() {
    const res = await fetchHtml(URL);
    if (!res.ok) throw new Error(`Delta board page returned ${res.status}`);
    const $ = cheerio.load(await res.text());

    const people: ScrapedPerson[] = [];
    $(".elementor-flip-box").each((_, el) => {
      const $el = $(el);
      const fullName = $el.find(".elementor-flip-box__front h3").first().text().trim();
      const roleTitle = $el.find(".elementor-flip-box__back h3").first().text().trim();
      const bio = $el
        .find(".elementor-flip-box__layer__description")
        .first()
        .text()
        .trim();

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
