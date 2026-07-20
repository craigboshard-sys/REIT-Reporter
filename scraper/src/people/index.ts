import { PeopleAdapter } from "./types.js";
import { accelerate } from "./accelerate.js";
import { attacq } from "./attacq.js";
import { burstone } from "./burstone.js";
import { delta } from "./delta.js";
import { dipula } from "./dipula.js";
import { emira } from "./emira.js";
import { equites } from "./equites.js";
import { fairvest } from "./fairvest.js";
import { fortress } from "./fortress.js";
import { growthpoint } from "./growthpoint.js";
import { heriot } from "./heriot.js";
import { hyprop } from "./hyprop.js";
import { nepiRockcastle } from "./nepi-rockcastle.js";
import { oasisCrescent } from "./oasis-crescent.js";
import { octodec } from "./octodec.js";
import { redefine } from "./redefine.js";
import { resilient } from "./resilient.js";
import { saCorporate } from "./sa-corporate.js";
import { spear } from "./spear.js";
import { storAge } from "./stor-age.js";
import { vukile } from "./vukile.js";

// All 21 active companies now have an adapter. Growthpoint, Redefine,
// Burstone, Fortress, and Delta use a real headless browser (src/browser.ts)
// with stealth patches to get past Cloudflare's bot-detection challenge --
// plain fetch() couldn't render their JS or pass the challenge. Delta's
// plain-fetch version worked fine locally but was blocked specifically from
// GitHub Actions' shared runner IPs; converted to the headless-browser path
// too on the chance it's a fingerprint issue rather than pure IP reputation
// (see scraper/README.md for what actually happened when tested in CI).
export const peopleAdapters: PeopleAdapter[] = [
  accelerate,
  attacq,
  burstone,
  delta,
  dipula,
  emira,
  equites,
  fairvest,
  fortress,
  growthpoint,
  heriot,
  hyprop,
  nepiRockcastle,
  oasisCrescent,
  octodec,
  redefine,
  resilient,
  saCorporate,
  spear,
  storAge,
  vukile,
];
