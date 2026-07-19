# SENS scraper

Scrapes SENS announcements directly from each JSE REIT's own investor-relations
page (or the third-party IR vendor it embeds) and writes them into the
`sens_announcements` Supabase table. Runs on a schedule via
`.github/workflows/scrape-sens.yml` (3x/day, GitHub-hosted runner, no paid
hosting needed) using the Supabase `service_role` key, which bypasses RLS.

This is a separate Node project from the Next.js app (not deployed to
Vercel) because it needs to run on a schedule independent of web traffic.

## Working adapters (`src/adapters/`)

| Company | Source | Notes |
|---|---|---|
| Vukile (VKE) | `irhosted.profiledata.co.za/vukile/...` | ProfileData vendor, "card" template |
| Hyprop (HYP) | `irhosted.profiledata.co.za/hyprop/...` | ProfileData vendor, "sens_row" template, exposes direct PDF links |
| Emira (EMI) | `irhosted.profiledata.co.za/emira2/...` | ProfileData vendor, table/popup template |
| Resilient (RES) | `resilient.co.za/announcements` | Company's own site, static HTML |

All four are plain static HTML — no headless browser needed, just `fetch` +
`cheerio`. Verify anytime with `npx tsx src/test-adapters.ts`.

Note: despite Vukile, Hyprop, and Emira all using the same underlying vendor
(ProfileData), each uses a different HTML template, so each needed its own
parser — there was no single generic adapter that covered all three.

## Not yet implemented

| Company | Why |
|---|---|
| Growthpoint (GRT) | IR page blocked non-browser requests (bot protection). Needs a headless browser (e.g. Playwright) to render, which this plain-fetch scraper doesn't have. |
| Redefine (RDF) | Same — blocked (403) on direct fetch. |
| Fortress (FFB) | Own Next.js/Contentful site; PDFs are directly linked but the full listing page's structure wasn't fully mapped yet. |
| Attacq (ATT) | Nuxt.js site; no SENS data found in the page's JSON payloads during investigation. Needs more digging. |
| SA Corporate (SAC) | Uses an IRESS market-data iframe with a token-gated feed URL that returned empty outside its iframe context. Needs more investigation (may require the referrer/parent-frame context, i.e. a headless browser). |
| NEPI Rockcastle (NRP) | Has a static "Investor News" list on its own site, but it's a curated selection, not the full SENS archive. Not implemented as it wouldn't be a reliable/complete source. |

Adding one of these later: write a new file in `src/adapters/`, add it to
`src/companies.ts`, and verify it with `test-adapters.ts` before relying on
it — don't add an adapter that hasn't been checked against live output.

## Setup

Add two repository secrets (Settings → Secrets and variables → Actions):

- `SUPABASE_URL` — same value as `NEXT_PUBLIC_SUPABASE_URL` in the app's `.env.local`
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase's API settings page, the
  **secret** key (not the publishable one). This bypasses Row Level Security,
  so it must only live in GitHub Actions secrets, never in the Next.js app.

## Local testing

```bash
cd scraper
npm install
npx tsx src/test-adapters.ts   # prints scraped data, no Supabase writes
npm run scrape                 # full run, requires SUPABASE_URL and
                                # SUPABASE_SERVICE_ROLE_KEY env vars set
```
