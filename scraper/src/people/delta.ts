import { withStealthPage } from "../browser.js";
import { PeopleAdapter, ScrapedPerson, looksExecutive } from "./types.js";

const URL = "https://www.deltafund.co.za/board-of-directors/";

export const delta: PeopleAdapter = {
  jseCode: "DLT",
  async scrape() {
    return withStealthPage(async (page) => {
      await page.goto(URL, { waitUntil: "networkidle" });

      const cards = await page.$$eval(".elementor-flip-box", (els) =>
        els.map((el) => ({
          name: el.querySelector(".elementor-flip-box__front h3")?.textContent?.trim() ?? "",
          role: el.querySelector(".elementor-flip-box__back h3")?.textContent?.trim() ?? "",
          bio: el.querySelector(".elementor-flip-box__layer__description")?.textContent?.trim() ?? "",
        })),
      );

      return cards
        .filter((c) => c.name && c.role)
        .map((c) => ({
          fullName: c.name,
          roleTitle: c.role,
          isExecutive: looksExecutive(c.role),
          bio: c.bio.length > 20 ? c.bio : null,
        }));
    });
  },
};
