# Steam Spending Replay

A single-page tool that turns pages saved from your Steam account into a breakdown of everything you've spent,
gifted, activated and played. Live at **https://steam.codeman.club**.

## How it works

- Visitors save their Steam **purchase history**, and optionally their **licenses** and **games** pages, and drop the
  `.html` files onto the page.
- Everything is read in the browser. Files are never uploaded; only the parsed data is kept in the visitor's own
  browser storage so the report is there next time.
- Purchases from other key stores can be added by hand or imported from a CSV/Excel sheet.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app: markup, styles and script in one file |
| `CNAME` | Tells GitHub Pages to serve the site at `steam.codeman.club` |
| `.nojekyll` | Serves the files as-is, without Jekyll processing |

External requests: Chart.js (jsDelivr), the Albert Sans font (Google Fonts), and SheetJS (cdnjs) only when an
Excel file is imported.

Not affiliated with Valve.
