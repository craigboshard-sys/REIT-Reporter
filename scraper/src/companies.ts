import { CompanyAdapter } from "./types.js";
import { vukile } from "./adapters/vukile.js";
import { hyprop } from "./adapters/hyprop.js";
import { emira } from "./adapters/emira.js";
import { resilient } from "./adapters/resilient.js";
import { growthpoint } from "./adapters/growthpoint.js";
import { redefine } from "./adapters/redefine.js";

// Only companies with a verified, working adapter are listed here.
// Not yet implemented (see scraper/README.md for why):
//   FFB (Fortress), ATT (Attacq), SAC (SA Corporate) - custom sites, structure not yet mapped
//   NRP (NEPI Rockcastle) - partial curated list only, not full SENS archive
export const adapters: CompanyAdapter[] = [
  vukile,
  hyprop,
  emira,
  resilient,
  growthpoint,
  redefine,
];
