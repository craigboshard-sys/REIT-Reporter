import { PeopleAdapter } from "./types.js";
import { accelerate } from "./accelerate.js";
import { attacq } from "./attacq.js";
import { delta } from "./delta.js";
import { dipula } from "./dipula.js";
import { emira } from "./emira.js";
import { equites } from "./equites.js";
import { fairvest } from "./fairvest.js";
import { heriot } from "./heriot.js";
import { hyprop } from "./hyprop.js";
import { nepiRockcastle } from "./nepi-rockcastle.js";
import { oasisCrescent } from "./oasis-crescent.js";
import { octodec } from "./octodec.js";
import { resilient } from "./resilient.js";
import { saCorporate } from "./sa-corporate.js";
import { spear } from "./spear.js";
import { storAge } from "./stor-age.js";
import { vukile } from "./vukile.js";

// Not included -- documented gaps, see scraper/README.md:
//   GRT (Growthpoint), RDF (Redefine) - blocked by bot protection even with
//     browser-like headers; would need a real headless browser
//   BTN (Burstone), FFB (Fortress) - JS-rendered, no static content at all
export const peopleAdapters: PeopleAdapter[] = [
  accelerate,
  attacq,
  delta,
  dipula,
  emira,
  equites,
  fairvest,
  heriot,
  hyprop,
  nepiRockcastle,
  oasisCrescent,
  octodec,
  resilient,
  saCorporate,
  spear,
  storAge,
  vukile,
];
