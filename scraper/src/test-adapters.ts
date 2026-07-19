import { adapters } from "./companies.js";

for (const adapter of adapters) {
  try {
    const results = await adapter.scrape();
    console.log(`\n=== ${adapter.jseCode}: ${results.length} announcements ===`);
    for (const r of results.slice(0, 3)) {
      console.log(`  ${r.announcedAt}  ${r.title}`);
      console.log(`    -> ${r.sourceUrl}`);
    }
  } catch (err) {
    console.error(`${adapter.jseCode}: FAILED -`, (err as Error).message);
  }
}
