# Tool Factory

Free, mobile-first utility tools that run entirely in the browser. No signup. No uploads.

## Launch tools

| Tool | Path |
| --- | --- |
| Stock average calculator | `/finance/stock-average-calculator` |
| Paycheck calculator hourly | `/finance/paycheck-calculator-hourly` |
| UTM builder (also UTM generator / maker / link builder) | `/seo/utm-builder` |
| Robots.txt builder (also robot.txt generator) | `/seo/robots-txt-builder` |
| UUID generator (also online GUID generator) | `/dev/uuid-generator` |
| HEIC to PNG converter | `/convert/heic-to-png` |

Hubs: `/` · `/finance` · `/seo` · `/dev` · `/convert`

## Local development

```bash
npm install
npm test
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Deploy

Next.js App Router. Ready for Vercel. Set `NEXT_PUBLIC_SITE_URL` to the public origin so `sitemap.xml` and `robots.txt` use absolute URLs.

Ad slots are placeholders only. Do not invent AdSense or publisher IDs.

## Rules

- Every tool page ships visible FAQ plus `FAQPage` JSON-LD.
- Do not publish a second page for a keyword that already has its own URL.
- Tools are 100% client-side.
