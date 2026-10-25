import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { MarginCalculator } from "@/components/tools/MarginCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/margin-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Margin Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does a margin calculator work?",
    answer:
      "A margin calculator compares cost with selling price. Enter cost and selling price to get gross margin %, profit dollars, and markup %. Or enter cost and a target margin % to get the selling price that hits that margin, plus the profit and matching markup.",
  },
  {
    question: "What is the gross margin formula?",
    answer:
      "Gross margin % = ((selling price − cost) / selling price) × 100. Profit = selling price − cost. Example: an $80 cost sold for $100 leaves $20 profit, and $20 / $100 is a 20% margin.",
  },
  {
    question: "How do I find the selling price from a target margin?",
    answer:
      "Selling price = cost / (1 − margin % / 100). For a 30% margin on an $80 cost, divide $80 by 0.70 to get about $114.29. Do not multiply cost by 1.30 — that adds a 30% markup, which is only about a 23% margin.",
  },
  {
    question: "What is the difference between margin and markup?",
    answer:
      "Margin is profit as a percent of selling price. Markup is profit as a percent of cost. The same $20 profit on an $80 cost and $100 price is a 20% margin and a 25% markup. A 50% margin is a 100% markup. Margin can never reach 100%, but markup can go above 100%.",
  },
  {
    question: "How do I convert margin to markup?",
    answer:
      "Markup % = margin / (1 − margin / 100). A 20% margin is a 25% markup, a 25% margin is a 33.33% markup, and a 50% margin is a 100% markup. Going the other way, margin % = markup / (1 + markup / 100).",
  },
  {
    question: "Why can't margin be 100% or more?",
    answer:
      "Margin divides profit by selling price, and profit is always price minus cost. Margin only reaches 100% when cost is 0. Any positive cost keeps margin below 100%, so the target margin mode needs a number under 100%.",
  },
  {
    question: "Can margin be negative?",
    answer:
      "Yes. If the selling price is below cost, profit is negative and so is the margin. An $80 cost sold for $50 is a $30 loss and a −60% margin. The calculator shows that so you can see how far under cost a price is.",
  },
  {
    question: "Does this margin calculator upload my numbers?",
    answer:
      "No. Cost, selling price, and target margin are calculated in your browser. Nothing is sent to a server or stored on our side. Results are an educational estimate, not tax or accounting advice.",
  },
];

export const metadata: Metadata = {
  title: "Margin Calculator — Gross Margin %, Profit, Selling Price",
  description:
    "Free margin calculator. Enter cost and selling price to get gross margin %, profit, and markup, or find the price for a target margin. Runs in your browser.",
  alternates: { canonical: href },
};

export default function MarginCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Margin Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Enter cost and selling price to see gross margin %, profit, and markup
        % — or enter cost and a target margin % to get the selling price you
        need. Margin is on selling price; markup is on cost.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Margin + profit</li>
        <li className="chip inline-flex">Price from target margin</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <MarginCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A margin calculator answers two pricing questions. First: at this
          cost and this price, what share of each sale is profit? Second: if I
          want a set margin, what do I need to charge? Pick a mode, enter cost,
          then enter either the selling price or the target margin %.
        </p>
        <p>
          The formula is gross margin % = ((selling price − cost) / selling
          price) × 100. To solve price from a target margin, use selling price
          = cost / (1 − margin % / 100). Profit is the dollar difference
          between price and cost. Markup uses the same profit over cost instead
          of price, so a 20% margin is a 25% markup — not the same number.
        </p>
        <p>
          Results are educational estimates, not tax or accounting advice.
          Everything runs in your browser. Numbers never leave the device, and
          there is no account.
        </p>
        <p>
          If you price by adding a percent on top of cost, use the{" "}
          <Link className="text-mint underline" href="/finance/markup-calculator">
            markup calculator
          </Link>
          . To see how many sales cover fixed costs, open the{" "}
          <Link className="text-mint underline" href="/finance/break-even-sales-calculator">
            break even sales calculator
          </Link>
          . For discounts, try the{" "}
          <Link className="text-mint underline" href="/finance/percent-off-calculator">
            percent off calculator
          </Link>
          . Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the margin calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose a mode: cost + selling price, or cost + target margin %.</li>
          <li>Enter your cost for the item or job.</li>
          <li>Enter the selling price, or the margin % you want (under 100%).</li>
          <li>Read gross margin %, selling price, profit dollars, and markup %.</li>
          <li>Remember margin is on price and markup is on cost — they will not match.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
