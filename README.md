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
| `data/known-packages.js` | Built-in copy of the known packs, bundles and free-to-play games (see Admin below) |
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

## Admin

`/admin.html` edits what the site matches against, stored in a Cloudflare D1 database:

- **Packs**: license names and the games they give (The Orange Box → Half-Life 2, Portal…), renamed games and
  remasters. Used to work out where each game on the games page came from.
- **Bundles**: Humble Choice months and other bundles with their games. Unlinked key activations that are games from
  one are suggested as that purchase, with the name, store and price filled in.
- **Free to play**: games counted as free when they have no license of their own.
- **History**: every change, with Undo.

The site loads the lists from `/api/known-data` when it starts and falls back to `data/known-packages.js` if that
fails. A downloaded report keeps the lists it was saved with. "Download as known-packages.js" on the admin page writes
the current lists in that file's format, to commit as the new built-in copy.

### Setting it up

1. Create the database: Cloudflare dashboard → Storage & Databases → D1 → Create, named `steam-purchase-replay`.
2. Create the tables: open the database's Console, paste `functions/schema.sql` and run it.
3. Bind it: Workers & Pages → the steam-purchase-replay project → Settings → Bindings → Add → D1 database,
   variable name `DB`, database `steam-purchase-replay`. Redeploy so the binding takes effect.
4. Lock it with Cloudflare Access, as on the headphones site: Zero Trust → Access → Applications → Add →
   Self-hosted, domain `steam.codeman.club` with paths `admin`, `admin.html` and `api/admin/*`, and an Allow policy
   with an Emails selector listing who may use the admin. The site itself doesn't check who's signed in, so these
   paths must all be covered. Pages serves `admin.html` at `/admin`, which is why both are listed.

   The admin page stays blank behind a Sign in button until `/api/admin/whoami` (behind Access) says who's signed
   in; the button opens that URL so Access can show its login, then sends you back to `/admin`. If whoami says the
   request didn't come through Access, `api/admin/*` isn't covered by the application.
5. Open `https://steam.codeman.club/admin.html` and click "Load the built-in list".


## Updating the sale dates

`data/steam-sales.js` lists every store-wide seasonal sale. Valve announces dates months ahead on the
[Steamworks upcoming events page](https://partner.steamgames.com/doc/marketing/upcoming_events). To add one, append a
line in date order and move `coveredUntil` to its last day. Purchases after `coveredUntil` are left out of the sale
timing figures, and the page says so.

## Running it locally

Open `index.html` directly, or serve the folder (for example `python -m http.server`). Download report needs the page
served over HTTP, because it reads the CSS and script files to inline them.

External requests: Chart.js (jsDelivr), the Albert Sans font (Google Fonts), SheetJS (cdnjs) only when an Excel
file is imported, and `/api/known-data` on the live site. The admin page and its API need `wrangler pages dev` with a
D1 binding locally.

Not affiliated with Valve.
