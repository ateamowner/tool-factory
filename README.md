# Tool Factory

Free, mobile-first utility tools that run entirely in the browser. No signup. No uploads.

## Launch tools

| Tool | Path |
| --- | --- |
| Stock average calculator | `/finance/stock-average-calculator` |
| Paycheck calculator hourly | `/finance/paycheck-calculator-hourly` |
| Emergency fund calculator | `/finance/emergency-fund-calculator` |
| Mortgage recast calculator (also recast mortgage calculator) | `/finance/mortgage-recast-calculator` |
| UTM builder (also UTM generator / maker / link builder) | `/seo/utm-builder` |
| Robots.txt builder (also robot.txt generator) | `/seo/robots-txt-builder` |
| Schema markup validator (also schema checker) | `/seo/schema-markup-validator` |
| UUID generator (also online GUID generator) | `/dev/uuid-generator` |
| JWT decoder (also JWT token decoder) | `/dev/jwt-decoder` |
| HEIC to PNG converter | `/convert/heic-to-png` |
| HEIC to PDF converter | `/convert/heic-to-pdf` |
| Excel to PDF converter | `/convert/excel-to-pdf` |
| PNG to JPG converter | `/convert/png-to-jpg` |

Hubs: `/` · `/finance` · `/seo` · `/dev` · `/convert`

## Local development

```bash
npm install
npm test
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## GitHub Pages

Pushes to `main` run `.github/workflows/pages.yml`, which builds a Next.js static export (`output: 'export'`) and deploys the `out/` folder with `actions/deploy-pages`.
Custom domain is `ateamkit.com` via `public/CNAME`; enable Pages once (Settings → Pages → GitHub Actions) after merge.
Enforce HTTPS must stay on so `http://ateamkit.com/*` 301s to the matching `https://ateamkit.com/` URL (www already 301s to apex). The Pages certificate is approved for `ateamkit.com` and `www.ateamkit.com`. GitHub Pages has no `_redirects` / `_headers`; do not add a second host. Enable with Settings → Pages → Enforce HTTPS, or `scripts/enforce-pages-https.sh` (official API is `PUT /repos/ateamowner/tool-factory/pages` with `{"https_enforced":true}`; needs `pages=write` and `administration=write`).
Canonical URLs, `sitemap.xml`, and `robots.txt` use `https://ateamkit.com` (the Vercel host can keep serving the same build until cutover). Homepage sitemap `<loc>` and canonical are `https://ateamkit.com/`; hubs and tools omit a trailing slash to match live URLs. `robots.txt` includes `Sitemap: https://ateamkit.com/sitemap.xml`.
IndexNow key file is `https://ateamkit.com/78d30441c01d40bff5f9c5bd2ec23255.txt` (text/plain). The Pages workflow pings Bing IndexNow with sitemap URLs after deploy. Add `ateamkit.com` in Bing Webmaster Tools; the IndexNow key file is the verify path — do not invent Bing or Google HTML verify codes.
Add a tool the same way as today: register it in `src/lib/tools.ts`, then add `src/app/<category>/<slug>/page.tsx` with FAQ + `FAQPage` JSON-LD (client-side only).
Ads stay placeholders. Do not invent AdSense IDs.

## Rules

- Every tool page ships visible FAQ plus `FAQPage` JSON-LD.
- Do not publish a second page for a keyword that already has its own URL.
- Tools are 100% client-side.
