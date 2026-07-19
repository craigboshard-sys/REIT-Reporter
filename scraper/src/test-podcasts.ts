import { scrapePropertyPod } from "./podcasts/property-pod.js";

const episodes = await scrapePropertyPod();
console.log(`Scraped ${episodes.length} episodes\n`);
for (const e of episodes.slice(0, 3)) {
  console.log(`${e.publishedAt}  ${e.title} (${e.duration})`);
  console.log(`  ${e.link}`);
  console.log(`  audio: ${e.audioUrl}\n`);
}
