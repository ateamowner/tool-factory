import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { PurchasingPowerCalculator } from "@/components/tools/PurchasingPowerCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/purchasing-power-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Purchasing Power Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does a purchasing power calculator work?",
    answer:
      "A purchasing power calculator takes a dollar amount in one year and restates it in another year. In rate mode it compounds an average annual inflation rate over the years between those dates. In CPI mode it multiplies by the ratio of two price indexes. You see the equivalent amount, the percent change in purchasing power, and a short summary.",
  },
  {
    question: "What is purchasing power?",
    answer:
      "Purchasing power is how many goods and services a unit of money can buy. When prices rise, the same $100 buys less. This inflation purchasing power calculator shows that loss (or a gain if prices fall) so you can compare buying power across years.",
  },
  {
    question: "How do you calculate purchasing power with an inflation rate?",
    answer:
      "Equivalent later-year dollars = starting amount × (1 + inflation rate)^years. The purchasing power of the same nominal amount is the starting amount divided by that multiplier. At 3% for 24 years, $100 in 2000 is about $203.28 in 2024, and those same $100 bills buy about $49.19 of 2000 goods.",
  },
  {
    question: "How do I use CPI indexes in this buying power calculator?",
    answer:
      "Enter a start CPI and an end CPI from the same index (for example U.S. CPI-U). Equivalent amount = starting amount × (end CPI ÷ start CPI). People also search this as a buying power calculator or an inflation purchasing power calculator — the comparison is the same. There is no second URL for those aliases.",
  },
  {
    question: "Can I compare future buying power of today's dollars?",
    answer:
      "Yes. Set the start year to today and the end year in the future, or enter a positive number of years. To see what past dollars equal today, put the earlier year first. A negative year span goes backward from the start year.",
  },
  {
    question: "What inflation rate should I use?",
    answer:
      "Long-run U.S. consumer inflation is often rounded to about 2–3% a year, so this page defaults to 3%. Use a published average for the years you care about, or switch to CPI indexes if you have start and end index levels. The rate is an assumption, not a forecast.",
  },
  {
    question: "Does this purchasing power calculator upload my numbers?",
    answer:
      "No. Amount, years, inflation rate, and CPI indexes are calculated in your browser. Nothing is sent to a server or stored on our side.",
  },
  {
    question: "Is this purchasing power calculator financial advice?",
    answer:
      "No. Results are an educational estimate of buying power under a constant inflation rate or a CPI ratio you enter. Official indexes, taxes, and your own prices vary. Check a qualified advisor before you make money decisions.",
  },
];

export const metadata: Metadata = {
  title: "Purchasing Power Calculator — Inflation & Buying Power",
  description:
    "Free purchasing power calculator. Estimate what past or future dollars buy after inflation, using an average rate or CPI change. Runs in your browser.",
  alternates: { canonical: href },
};

export default function PurchasingPowerCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Purchasing Power Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        See what a dollar amount buys in another year — using an average
        inflation rate or CPI indexes — and how much purchasing power a
        fixed amount loses or gains. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Past or future dollars</li>
        <li className="chip inline-flex">Rate or CPI</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <PurchasingPowerCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A purchasing power calculator answers a practical inflation
          question: if $100 bought a basket of goods in one year, what does
          that same basket cost later — or what would today&apos;s $100 have
          bought earlier? Enter the amount, a start year, and either an end
          year or a number of years.
        </p>
        <p>
          Then pick how prices change. The default is an average annual
          inflation rate of about 3%. That compounds each year, so 24 years
          at 3% roughly doubles prices. If you have published CPI (or another
          price-index) levels, switch to CPI mode and enter the start and end
          indexes. People also search this as an inflation purchasing power
          calculator or a buying power calculator — the comparison is the
          same. There is no second URL for those aliases.
        </p>
        <p>
          The results panel shows equivalent purchasing power in the
          comparison year, the percent change in purchasing power for a
          fixed dollar amount, the percent change in the price level, and
          what the same nominal amount buys after inflation. A short sentence
          restates the example in plain language. Swap the years (or use a
          negative span) to go backward. Everything runs in your browser.
          Totals never leave the device, and there is no account.
        </p>
        <p>
          Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/finance/balance-transfer-calculator">
            balance transfer calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/emergency-fund-calculator">
            emergency fund calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/monthly-budget-template">
            monthly budget template
          </Link>
          , and{" "}
          <Link className="text-mint underline" href="/finance/403b-calculator">
            403b calculator
          </Link>
          . For campaign URLs, use the{" "}
          <Link className="text-mint underline" href="/seo/utm-builder">
            UTM builder
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the purchasing power calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter the starting amount in USD.</li>
          <li>Choose average inflation rate or CPI indexes.</li>
          <li>Enter a start year, then an end year or a number of years.</li>
          <li>Enter the annual inflation rate (default 3%) or the start and end CPI values.</li>
          <li>Read the equivalent buying power, percent change, and the plain-language summary.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
