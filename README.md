# Steam Spending Replay

Turns pages saved from your Steam account into a breakdown of everything you've spent, gifted, activated and played.
Live at **https://steam.codeman.club**.

## How it works

- Visitors save their Steam **purchase history**, and optionally their **licenses** and **games** pages, and drop the
  `.html` files onto the page.
- Everything is read in the browser. Files are never uploaded; only the parsed data is kept in the visitor's own
  browser storage so the report is there next time.
- Purchases from other key stores can be added by hand or imported from a CSV/Excel sheet.
- **Download report** saves a single self-contained HTML file with the data embedded, which opens without the site.
  A downloaded report, anyone's, can also be dropped back onto the upload screen to import it.
- Several reports can be kept in one browser. The upload screen lists them; the one picked there is the one that opens,
  or that newly dropped pages are added to.

## Files

Plain HTML, CSS and JavaScript with no build step. The scripts are loaded in order by `index.html` and share one
global scope, so a script can use anything defined in the ones before it.

| File | What's in it |
|---|---|
| `index.html` | The page markup |
| `css/style.css` | All styles |
| `data/steam-sales.js` | Dates of Steam's seasonal sales (see below) |
| `data/known-packages.js` | Built-in copy of the known packs, bundles and free-to-play games |
| `js/util.js` | Shared helpers: DOM, dates, money, name matching, colours |
| `js/parse.js` | Reading the saved Steam pages into rows |
| `js/analyze-history.js` | Purchase history → totals, per-year spending, savings, gifts, hardware, sale timing |
| `js/analyze-licenses.js` | Licenses → where each license came from, per-year counts |
| `js/analyze-playtime.js` | Games page → playtime, cost per hour, backlog |
| `js/prices.js` | Per-item prices inside multi-item checkouts, and prices typed in by the visitor |
| `js/purchases.js` | Keys bought from other stores and how they match key activations |
| `js/example.js` | The made-up example account |
| `js/charts.js` | Chart.js charts |
| `js/render.js` | Drawing the report sections |
| `js/render-licenses.js` | The licenses section and 3rd-party purchases table |
| `js/forms.js` | Add/edit purchase, edit price, spreadsheet import |
| `js/storage.js` | Saving to and loading from browser storage, one entry per report |
| `js/export.js` | Share card image and the downloadable report |
| `admin.html` | Admin page for the known packs, bundles and free-to-play games |
| `functions/` | Cloudflare Pages Functions: `/api/known-data` (public), `/api/admin/*` and the D1 schema |
| `js/app.js` | Upload screen and saved-report list, building a report, section navigation, startup |

The row shapes produced by `js/parse.js` are also what gets saved in browsers and inside downloaded reports, so
changing their field names breaks reports people already have.

## Updating the sale dates

`data/steam-sales.js` lists every store-wide seasonal sale. Valve announces dates months ahead on the
[Steamworks upcoming events page](https://partner.steamgames.com/doc/marketing/upcoming_events). To add one, append a
line in date order and move `coveredUntil` to its last day. Purchases after `coveredUntil` are left out of the sale
timing figures, and the page says so.

## Bundle suggestions

Unlinked key activations are compared with the known bundles (`KNOWN_BUNDLES`, and the admin page's Bundles tab). A
bundle is suggested when two or more of its games were activated as keys on or after its sale date and within 30 days
of each other (`BUNDLE_SPREAD_DAYS` in `js/purchases.js`), since a bundle's keys are usually redeemed together.

## Free key giveaways

Known bundles (`KNOWN_BUNDLES`, and the admin page's Bundles tab) can also be free key giveaways: kind `giveaway`, with
`date` the first day and `ends` the last. A single unlinked key of the game activated from the day before to the day
after is suggested as a free giveaway, so it isn't left looking like a missing purchase. The live database needs
`functions/migrate-2026-09-giveaways.sql` run once to allow the new kind and column.

## Running it locally

Open `index.html` directly, or serve the folder (for example `python -m http.server`). Download report needs the page
served over HTTP, because it reads the CSS and script files to inline them.

External requests: Chart.js (jsDelivr), the Albert Sans font (Google Fonts), SheetJS (cdnjs) only when an Excel
file is imported, and `/api/known-data` on the live site. The admin page and its API need `wrangler pages dev` with a
D1 binding locally.

Not affiliated with Valve.
