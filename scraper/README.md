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
| Growthpoint (GRT) | `irhosted.profiledata.co.za/Growthpoint/...` | ProfileData vendor, yet another distinct template (note: its own CSS class is misspelled `desription`) — plain fetch, no Cloudflare in front of this vendor subdomain |
| Redefine (RDF) | `redefine.co.za/investors/investor-information/sens-announcements` | Company's own Angular site, behind Cloudflare — needs a headless browser (see below) |

Vukile, Hyprop, Emira, Resilient, and Growthpoint are all plain static
HTML — no headless browser needed, just `fetch` + `cheerio`. Verify anytime
with `npx tsx src/test-adapters.ts`.

Note: despite Vukile, Hyprop, Emira, and Growthpoint all using the same
underlying vendor (ProfileData), each uses a different HTML template, so
each needed its own parser — there was no single generic adapter that
covered all four.

Redefine uses `src/browser.ts` (the same stealth-Chromium helper as the
people scraper) because the listing page is Cloudflare-protected. It's also
the one adapter that isn't a simple parse: each row's title and date are
visible in the list, but there's no `<a href>` — the row click is bound to
Angular's in-app router with no id exposed in the list DOM. So the adapter
clicks each row, reads the resulting detail-page URL as the announcement's
permalink, scrapes the full SENS text from `pre.text-align-announcement`,
then clicks back and repeats. This only covers the ~6 most recent
announcements (page 1) per run, which is fine since the scraper runs 3x/day
and the DB upsert dedupes on `(company_id, title, announced_at)`.

## Not yet implemented

| Company | Why |
|---|---|
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

## Key Individuals scraper (`src/people/`)

Scrapes each company's own leadership/board page (executives + non-exec
directors) into `company_people`. Runs weekly via
`.github/workflows/scrape-people.yml` — board composition doesn't change
often. Each site has its own HTML structure, so each has its own adapter
(`src/people/index.ts` is the registry). Full replace per company on each
run (delete + insert), since this represents *current* leadership, not a
history.

**All 21 active companies now have an adapter.** Most use plain `fetch` +
`cheerio` (fast, no browser needed). Five use a real headless browser via
`src/browser.ts` because their bot protection (Cloudflare) blocks or
challenges plain HTTP requests and/or the page only renders via JS:

| Company | Why headless |
|---|---|
| Growthpoint (GRT) | Cloudflare challenge page blocks plain fetch; renders fine in a real browser |
| Redefine (RDF) | Same |
| Burstone (BTN) | JS-rendered React site; bios are behind a click-to-reveal tab (names/roles captured, bios skipped — would need per-person clicking) |
| Fortress (FFB) | JS-rendered Angular site using a Slick carousel; board tab requires a click to load, scraper clicks it |
| Delta (DLT) | Plain fetch worked fine locally but was blocked (403) specifically from GitHub Actions' shared runner IPs; converted to headless on the chance it's a fingerprint issue rather than pure IP reputation — **check scraper output after the next scheduled run to see if this actually fixed it in CI**, since a headless browser running from the same GitHub Actions IP might still get blocked if the block is truly IP-reputation-based rather than fingerprint-based |

`src/browser.ts` (`withStealthPage`) launches Chromium with
`--disable-blink-features=AutomationControlled` and patches
`navigator.webdriver` — standard, publicly documented evasions for
Cloudflare's headless-browser detection, not identity spoofing. The GitHub
Actions workflow installs Chromium via `npx playwright install --with-deps
chromium` before running the scraper.

Octodec has occasionally failed with a plain network error (DNS/connectivity
blip, not a code issue) — the scraper's delete-then-insert is per-company
and only runs if the scrape succeeds, so a transient failure leaves that
company's previous data untouched rather than wiping it.

Note on `src/http.ts`: the plain-fetch adapters (Fairvest, Vukile, and
originally Delta) initially failed only in GitHub Actions CI, not locally —
their bot protection was flagging Node's default `fetch()` headers (generic
User-Agent, no Accept), not the CI IP itself. All plain-fetch people-scraper
requests go through a shared `fetchHtml()` helper that sends realistic
browser headers.

Oasis Crescent caveat: that page lists directors of the parent **Oasis
Group Holdings**, not confirmed to be identical to Oasis Crescent Property
Fund's own board (likely overlapping — it's a small family-run group — but
unverified). Roles are labeled `"... (Oasis Group)"` to make this explicit
rather than presenting it as the fund's own board composition.

## Local testing

```bash
cd scraper
npm install
npx tsx src/test-adapters.ts   # prints scraped data, no Supabase writes
npm run scrape                 # full run, requires SUPABASE_URL and
                                # SUPABASE_SERVICE_ROLE_KEY env vars set
```
