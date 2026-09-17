import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { MarkupCalculator } from "@/components/tools/MarkupCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/markup-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Markup Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does a markup calculator work?",
    answer:
      "A markup calculator starts from cost and either a markup percent or a selling price. Markup % = ((selling price − cost) / cost) × 100. From cost and markup % it returns selling price, profit dollars, and the implied margin %. From cost and selling price it returns markup % and margin %. An optional third mode uses a desired margin % to solve selling price and the equivalent markup %.",
  },
  {
    question: "What is the markup formula?",
    answer:
      "Markup percent = ((selling price − cost) / cost) × 100. Selling price = cost × (1 + markup % / 100). Profit = selling price − cost. Example: $80 cost and 25% markup is a $100 selling price, $20 profit, and a 20% margin.",
  },
  {
    question: "What is the difference between markup and margin?",
    answer:
      "Markup is on cost. Margin is on selling price. The same $20 profit on an $80 cost is a 25% markup ((100 − 80) / 80) and a 20% margin ((100 − 80) / 100). A 50% margin is a 100% markup: you double the cost so half of the selling price is profit. They are related but never the same number except at 0%.",
  },
  {
    question: "How do I find selling price from a desired margin?",
    answer:
      "Selling price = cost / (1 − margin % / 100). The equivalent markup is ((selling price − cost) / cost) × 100, which is also margin / (1 − margin / 100). A 20% margin on $80 cost is a $100 price and a 25% markup. Desired margin must be less than 100% — a 100% margin would need an infinite price.",
  },
  {
    question: "Is this the same as a markup percentage calculator?",
    answer:
      "Yes. People also search for a markup percentage calculator. That name points at this same markup calculator page. There is no second URL for that alias.",
  },
  {
    question: "What numbers can I enter?",
    answer:
      "Cost, markup %, selling price, and desired margin must be finite and non-negative. Cost must be greater than 0 because markup divides by cost. Selling price can be 0 or more; below cost the markup and margin are negative. Margin is blank when selling price is 0 because that percent divides by price.",
  },
  {
    question: "Does this markup calculator upload my numbers?",
    answer:
      "No. Cost, markup percent, selling price, and desired margin are calculated in your browser. Nothing is sent to a server or stored on our side.",
  },
  {
    question: "Is this tax or accounting advice?",
    answer:
      "No. Results are an educational estimate of markup and margin from the numbers you enter. Taxes, discounts, freight, and how your books treat cost of goods can differ. Check a qualified advisor before you set prices or file.",
  },
];

export const metadata: Metadata = {
  title: "Markup Calculator — Cost, Markup %, Selling Price",
  description:
    "Free markup calculator. Enter cost and markup percent (or selling price) to see profit, selling price, and margin. Runs in your browser.",
  alternates: { canonical: href },
};

export default function MarkupCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Markup Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Turn cost and a markup percent into selling price, profit, and implied
        margin — or start from cost and price to see both percents. Markup is on
        cost; margin is on selling price.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Price + profit</li>
        <li className="chip inline-flex">Markup vs margin</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <MarkupCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A markup calculator answers a pricing question: if this item costs a
          known amount, what selling price matches the markup you want, and
          what margin does that imply? Enter cost plus markup %, or cost plus
          selling price. A third mode starts from a desired margin % and
          returns the matching price and equivalent markup.
        </p>
        <p>
          The formula is markup % = ((selling price − cost) / cost) × 100.
          Selling price = cost × (1 + markup % / 100). Profit is the dollar
          difference. Margin % uses the same profit over selling price, not
          cost — so a 25% markup is a 20% margin, not the same number. People
          also search this as a markup percentage calculator; there is no
          second URL for that alias.
        </p>
        <p>
          Results are educational estimates, not tax or accounting advice.
          Everything runs in your browser. Totals never leave the device, and
          there is no account.
        </p>
        <p>
          Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub, or open the{" "}
          <Link
            className="text-mint underline"
            href="/finance/straight-line-depreciation-calculator"
          >
            straight line depreciation calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/break-even-sales-calculator">
            break even sales calculator
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
          How to use the markup calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose a mode: cost + markup %, cost + selling price, or cost + desired margin %.</li>
          <li>Enter a cost greater than 0.</li>
          <li>Enter the matching second number for that mode (markup %, price, or margin %).</li>
          <li>Read selling price, profit dollars, markup %, and margin %.</li>
          <li>Remember markup is on cost and margin is on selling price — they will not match.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
