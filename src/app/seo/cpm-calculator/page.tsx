import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { CpmCalculator } from "@/components/tools/CpmCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/seo/cpm-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "SEO", href: "/seo" },
  { name: "CPM Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a CPM calculator?",
    answer:
      "A CPM calculator finds cost per mille, the price of 1,000 ad impressions. Enter what you spent and how many times the ad was shown. This page also solves the other direction: cost from CPM and impressions, or impressions from cost and CPM. An optional CPC and CTR mode uses the same identity. Everything runs in the browser.",
  },
  {
    question: "What is the CPM formula?",
    answer:
      "CPM = (cost / impressions) × 1,000. Example: $500 spent on 100,000 impressions is (500 / 100,000) × 1,000 = $5 CPM. Cost per mille and cost per thousand impressions are the same idea. The results panel shows that formula with your numbers.",
  },
  {
    question: "How do I calculate cost from CPM and impressions?",
    answer:
      "Cost = (CPM × impressions) / 1,000. Choose CPM + impressions and enter both numbers. A $5 CPM on 100,000 impressions costs $500. A $0 CPM or 0 impressions produces a $0 cost. This is the spend implied by a rate, not an invoice.",
  },
  {
    question: "How do I calculate impressions from cost and CPM?",
    answer:
      "Impressions = (cost / CPM) × 1,000. Choose Cost + CPM. $500 at a $5 CPM is 100,000 impressions. CPM must be greater than 0 because the formula divides by it. A $0 cost at a positive CPM is 0 impressions.",
  },
  {
    question: "How do CPC and CTR relate to CPM?",
    answer:
      "CTR = clicks / impressions, and CPC = cost / clicks. CPM = CPC × CTR × 1,000 when CTR is a decimal, so a 2% CTR is 0.02. The same line is CPM = CPC × CTR% × 10. A $1.00 CPC and a 2% CTR is a $20 CPM. On the cost and impressions mode, enter clicks to see CPC and CTR. Or switch to CPC + CTR and enter the rate directly. 2 in the CTR field means 2%, not 0.02.",
  },
  {
    question: "What numbers can I enter?",
    answer:
      "Cost, impressions, CPM, CPC, CTR, and clicks must be finite and 0 or more. Empty, infinite, and negative values are rejected. Commas in thousands (100,000) are accepted. Impressions must be greater than 0 when solving CPM, and CPM must be greater than 0 when solving impressions. Clicks are optional; if you type them, the count must be greater than 0. Leave clicks blank to skip CPC and CTR.",
  },
  {
    question: "Is this CPM calculator ad-platform billing advice?",
    answer:
      "No. Results are an educational estimate of cost per 1,000 impressions from the numbers you type. They are not ad-platform billing advice. Google Ads, Meta, and other platforms may bill viewable impressions, use auction prices, add fees, or round differently. Confirm spend in the ad account before you set a budget.",
  },
  {
    question: "Does this CPM calculator upload my campaign numbers?",
    answer:
      "No. Cost, impressions, CPM, clicks, CPC, and CTR are calculated in this tab. Nothing is uploaded, and there is no account. Refreshing the page clears the fields back to the sample numbers.",
  },
];

export const metadata: Metadata = {
  title: "CPM Calculator — Cost per 1,000 Impressions",
  description:
    "Free CPM calculator for cost per mille. Find CPM from cost and impressions, or solve cost, impressions, CPC, and CTR. Client-side only — not ad-platform billing advice.",
  alternates: { canonical: href },
};

export default function CpmCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">CPM Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Calculate cost per mille — the cost of 1,000 impressions — or solve for
        cost or impressions. Optional CPC and CTR use the same math. Everything
        runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Cost per 1,000</li>
        <li className="chip inline-flex">Solve CPM, cost, or impressions</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <CpmCalculator />
      </div>

      <section className="mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A CPM calculator answers a media question: what did 1,000 impressions
          cost? CPM means cost per mille. Enter total cost and impression count.
          The formula is CPM = (cost / impressions) × 1,000. Example: $500 on
          100,000 impressions is a $5 CPM.
        </p>
        <p>
          Switch modes when you already know the rate. Cost = (CPM × impressions)
          / 1,000, so a $5 CPM on 100,000 impressions is $500. Impressions =
          (cost / CPM) × 1,000, so $500 at $5 CPM is 100,000 impressions. If you
          also know clicks, CPC = cost / clicks and CTR = clicks / impressions.
          CPM, CPC, and CTR stay consistent: a $0.25 CPC at a 2% CTR is the same
          $5 CPM.
        </p>
        <p>
          You can also start from CPC and CTR percent. Enter 1 and 2 for a $1.00
          CPC and a 2% CTR, and the CPM is $20. The CTR field is a percent: 2
          means 2%, not the decimal 0.02. Commas in large counts are accepted.
          Empty, negative, and infinite values are rejected.
        </p>
        <p>
          Results are an educational estimate, not ad-platform billing advice.
          Auction prices, viewability rules, fees, and rounding live in the ad
          account. Numbers never leave this device, and there is no account.
        </p>
        <p>
          Pair it with the{" "}
          <Link className="text-mint underline" href="/seo/utm-builder">
            UTM builder
          </Link>
          , the{" "}
          <Link className="text-mint underline" href="/seo/robots-txt-builder">
            robots.txt builder
          </Link>
          , the{" "}
          <Link className="text-mint underline" href="/seo/schema-markup-validator">
            schema markup validator
          </Link>
          , and the{" "}
          <Link className="text-mint underline" href="/seo/domain-age-checker">
            domain age checker
          </Link>
          . For a pricing companion, use the{" "}
          <Link className="text-mint underline" href="/finance/markup-calculator">
            markup calculator
          </Link>
          . More campaign utilities live on the{" "}
          <Link className="text-mint underline" href="/seo">
            SEO
          </Link>{" "}
          hub.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the CPM calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose cost + impressions, CPM + impressions, cost + CPM, or CPC + CTR.</li>
          <li>Enter the known numbers. Commas are fine, and each value must be 0 or more.</li>
          <li>On cost + impressions, add clicks only if you want CPC and CTR. Leave clicks blank to skip them.</li>
          <li>Read CPM, cost, or impressions. CPM = (cost ÷ impressions) × 1,000.</li>
          <li>Treat the result as a planning estimate, not a platform invoice.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
