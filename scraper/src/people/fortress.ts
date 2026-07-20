import { withStealthPage } from "../browser.js";
import { PeopleAdapter, ScrapedPerson, looksExecutive } from "./types.js";

const URL = "https://fortressfund.co.za/about/meet-the-team";

async function readSlides(page: import("playwright").Page) {
  return page.$$eval(".slick-slide .content-container", (containers) => {
    const seen = new Set<string>();
    const out: { name: string; role: string }[] = [];
    for (const c of containers) {
      const name = c.querySelector(".name")?.textContent?.trim() ?? "";
      const role = c.querySelector(".position")?.textContent?.trim() ?? "";
      if (name && !seen.has(name)) {
        seen.add(name);
        out.push({ name, role });
      }
    }
    return out;
  });
}

export const fortress: PeopleAdapter = {
  jseCode: "FFB",
  async scrape() {
    return withStealthPage(async (page) => {
      await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
      // Slick clones slides for infinite-loop scrolling; some clones stay
      // hidden (display:none), so waiting for the default "visible" state
      // can pick a hidden clone and time out. We only need the text, so
      // "attached" (present in the DOM) is enough.
      await page.waitForSelector(".slick-slide .content-container", {
        timeout: 30000,
        state: "attached",
      });

      // "Management team" tab content is shown by default.
      const managementSlides = await readSlides(page);

      // Click through to "Board of Directors" for the rest.
      await page.getByText("Board of Directors", { exact: true }).click();
      await page.waitForTimeout(1000);
      const boardSlides = await readSlides(page);

      const seen = new Map<string, ScrapedPerson>();
      for (const s of [...managementSlides, ...boardSlides]) {
        if (!s.name || !s.role) continue;
        seen.set(s.name.toLowerCase(), {
          fullName: s.name,
          roleTitle: s.role,
          isExecutive: looksExecutive(s.role),
          bio: null,
        });
      }
      return [...seen.values()];
    });
  },
};
