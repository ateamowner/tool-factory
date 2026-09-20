import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { DiscountCalculator } from "@/components/tools/DiscountCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/discount-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Discount Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does a discount calculator work?",
    answer:
      "A discount calculator starts from a list (original) price and either a discount percent, discount dollars, or a sale price. Discount $ = original × (discount % / 100). Sale price = original − discount. From a sale price and discount % it reverses to the original. A stacked mode applies two sequential percent discounts and returns the combined effective discount %.",
  },
  {
    question: "What is the discount formula?",
    answer:
      "Discount percent = ((original price − sale price) / original price) × 100. Discount dollars = original × (discount % / 100). Sale price = original × (1 − discount % / 100). Example: $100 original and 20% off is $20 off and an $80 sale price.",
  },
  {
    question: "How do I find the original price from a sale price and discount percent?",
    answer:
      "Original = sale price / (1 − discount % / 100). An $80 sale at 20% off came from a $100 list price. Discount percent must be less than 100% — 100% off would imply an infinite original price.",
  },
  {
    question: "How do successive or stacked discounts work?",
    answer:
      "Each percent applies to the remaining price, not the original. Effective % = (1 − (1 − first/100) × (1 − second/100)) × 100. $100 with 20% then 10% is $80 after the first cut and $72 after the second — a 28% effective discount, not 30%.",
  },
  {
    question: "What is the difference between this discount calculator and the percent off calculator?",
    answer:
      "This page is a discount calculator for list price → sale price, reverse (sale + % → original), and stacked/successive percent discounts. The percent off calculator is a single-discount page for original + % off, original + sale, or original + dollars off. There is no second URL for percent-off aliases.",
  },
  {
    question: "What numbers can I enter?",
    answer:
      "List price, sale price, discount percent, discount dollars, and stacked percents must be finite and non-negative. List price must be greater than 0 on forward modes. Sale price must be greater than 0 to reverse to an original. Percents can be 0% through 100% (free) except when reversing — that path requires less than 100%. Sale price and dollars off cannot exceed the original.",
  },
  {
    question: "Does this discount calculator upload my numbers?",
    answer:
      "No. List price, discount percent, discount dollars, sale price, and stacked percents are calculated in your browser. Nothing is sent to a server or stored on our side.",
  },
  {
    question: "Is this tax or pricing advice?",
    answer:
      "No. Results are an educational estimate of a discount from the numbers you enter. Store rounding, BOGO, tax, shipping, and extra coupons can differ. Check the offer or a qualified advisor before you buy or set prices.",
  },
];

export const metadata: Metadata = {
  title: "Discount Calculator — Sale Price, $ Off & Stacked %",
  description:
    "Free discount calculator. Enter list price and discount % or dollars (or reverse from a sale price) to see the sale price. Stack two percent discounts for the combined effective %. Runs in your browser.",
  alternates: { canonical: href },
};

export default function DiscountCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Discount Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Turn a list price and a discount percent or dollars off into the sale
        price — or reverse from a sale price to the original. Stack two sequential
        percent discounts to see the combined effective %. Everything runs in the
        browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">List → sale price</li>
        <li className="chip inline-flex">Reverse + stacked %</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <DiscountCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A discount calculator answers a shopping or pricing question: if this
          item is listed at a known price, what do you pay after a percent or
          dollar discount, and how much comes off? Enter list price plus discount
          %, list plus dollars off, or list plus sale price. A reverse mode starts
          from sale price plus discount % and returns the original. Stacked mode
          applies two sequential percent discounts.
        </p>
        <p>
          The formula is discount % = ((original − sale price) / original) × 100.
          Discount dollars = original × (discount % / 100). Sale price = original
          − discount. Example: $100 and 20% off is $20 off and an $80 sale price.
          Two stacked cuts of 20% then 10% on $100 leave $72 — a 28% effective
          discount, because the second percent applies to the remaining $80.
        </p>
        <p>
          Results are educational estimates, not tax or pricing advice. Store
          rounding, tax, and shipping can differ. Everything runs in your
          browser. Totals never leave the device, and there is no account.
        </p>
        <p>
          Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/finance/percent-off-calculator">
            percent off calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/markup-calculator">
            markup calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/break-even-sales-calculator">
            break even sales calculator
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
          How to use the discount calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose a mode: list + % off, list + $ off, sale + % off, list + sale, or stacked % off.</li>
          <li>Enter a list price greater than 0 — or a sale price greater than 0 in reverse mode.</li>
          <li>Enter the matching discount percent, dollars off, sale price, or two stacked percents.</li>
          <li>Read sale price (or original), discount dollars, and discount percent.</li>
          <li>In stacked mode, remember the second percent applies to the remaining price, not the original.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
