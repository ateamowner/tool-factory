import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { PercentOffCalculator } from "@/components/tools/PercentOffCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/percent-off-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Percent Off Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does a percent off calculator work?",
    answer:
      "A percent off calculator starts from the original (list) price and either a percent off, a sale price, or dollars off. Discount $ = original × (percent off / 100). Sale price = original − discount. From original and sale price it returns percent off and discount dollars. From original and dollars off it returns percent off and the sale price.",
  },
  {
    question: "What is the percent off formula?",
    answer:
      "Percent off = ((original price − sale price) / original price) × 100. Discount dollars = original × (percent off / 100). Sale price = original × (1 − percent off / 100). Example: $80 original and 25% off is $20 off and a $60 sale price.",
  },
  {
    question: "How do I find the sale price from a percent off?",
    answer:
      "Sale price = original price × (1 − percent off / 100). A 20% off sale on $100 is $80. A 100% off sale is $0. Percent off must be 100% or less — more than 100% would make a negative price.",
  },
  {
    question: "How do I find percent off from the original and sale price?",
    answer:
      "Subtract the sale price from the original, divide by the original, and multiply by 100. $80 down to $60 is ($20 / $80) × 100 = 25% off. The sale price cannot be higher than the original — that is a markup, not a discount.",
  },
  {
    question: "Is this the same as a percentage off calculator or percent discount calculator?",
    answer:
      "Yes. People also search for a percentage off calculator or a percent discount calculator. Those names point at this same percent off calculator page. There is no second URL for those aliases.",
  },
  {
    question: "What numbers can I enter?",
    answer:
      "Original price, percent off, sale price, and discount dollars must be finite and non-negative. Original price must be greater than 0 because percent off divides by that price. Percent off can be 0% (pay full price) through 100% (free). Sale price and dollars off cannot exceed the original.",
  },
  {
    question: "Does this percent off calculator upload my numbers?",
    answer:
      "No. Original price, percent off, sale price, and discount dollars are calculated in your browser. Nothing is sent to a server or stored on our side.",
  },
  {
    question: "Is this tax or pricing advice?",
    answer:
      "No. Results are an educational estimate of a single percent-off discount from the numbers you enter. Stacked coupons, BOGO, tax, shipping, and how a store rounds can differ. Check the offer or a qualified advisor before you buy or set prices.",
  },
];

export const metadata: Metadata = {
  title: "Percent Off Calculator — Discount Amount & Sale Price",
  description:
    "Free percent off calculator. Enter original price and percent off (or sale price or dollars off) to see the discount amount and final price. Runs in your browser.",
  alternates: { canonical: href },
};

export default function PercentOffCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Percent Off Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Turn an original price and a percent off into the discount amount and
        sale price — or start from the sale price or dollars off to see the
        matching percent. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Discount + sale price</li>
        <li className="chip inline-flex">Price, %, or $ off</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <PercentOffCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A percent off calculator answers a shopping or pricing question: if
          this item is listed at a known price, what do you pay after a percent
          discount, and how many dollars come off? Enter original price plus
          percent off, or original plus sale price. A third mode starts from
          dollars off and returns the matching percent and sale price.
        </p>
        <p>
          The formula is percent off = ((original − sale price) / original) ×
          100. Discount dollars = original × (percent off / 100). Sale price =
          original − discount. Example: $80 and 25% off is $20 off and a $60
          sale price. People also search this as a percentage off calculator or
          percent discount calculator; there is no second URL for those aliases.
        </p>
        <p>
          Results are educational estimates, not tax or pricing advice.
          Stacked coupons, tax, and shipping can differ. Everything runs in
          your browser. Totals never leave the device, and there is no account.
        </p>
        <p>
          Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/finance/markup-calculator">
            markup calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/break-even-sales-calculator">
            break even sales calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/straight-line-depreciation-calculator">
            straight line depreciation calculator
          </Link>
          , and{" "}
          <Link className="text-mint underline" href="/finance/monthly-budget-template">
            monthly budget template
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
          How to use the percent off calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose a mode: original + % off, original + sale price, or original + $ off.</li>
          <li>Enter an original price greater than 0.</li>
          <li>Enter the matching second number for that mode (percent off, sale price, or dollars off).</li>
          <li>Read sale price, discount dollars, and percent off.</li>
          <li>Remember percent off is on the original price — stacked coupons and tax are not included.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
