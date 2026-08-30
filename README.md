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
| UUID generator (also online GUID generator) | `/dev/uuid-generator` |
| HEIC to PNG converter | `/convert/heic-to-png` |
| HEIC to PDF converter | `/convert/heic-to-pdf` |

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
Canonical URLs, `sitemap.xml`, and `robots.txt` use `https://ateamkit.com` (the Vercel host can keep serving the same build until cutover).
Add a tool the same way as today: register it in `src/lib/tools.ts`, then add `src/app/<category>/<slug>/page.tsx` with FAQ + `FAQPage` JSON-LD (client-side only).
Ads stay placeholders. Do not invent AdSense IDs.

## Rules

- Every tool page ships visible FAQ plus `FAQPage` JSON-LD.
- Do not publish a second page for a keyword that already has its own URL.
- Tools are 100% client-side.
