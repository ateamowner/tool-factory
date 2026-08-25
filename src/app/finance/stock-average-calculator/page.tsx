import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { StockAverageCalculator } from "@/components/tools/StockAverageCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/stock-average-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Stock Average Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does a stock average calculator compute weighted average cost?",
    answer:
      "It multiplies shares by price for each lot, adds optional fees, then divides total invested by total shares. Larger lots pull the average more than smaller ones, which is why a simple average of the prices is usually wrong.",
  },
  {
    question: "Are fees included in the break-even price?",
    answer:
      "Yes. Break-even is total invested — share cost plus every lot fee — divided by total shares. That is the per-share sale price that recovers what you actually spent.",
  },
  {
    question: "Can I add or remove lots after I start?",
    answer:
      "Yes. Use Add lot for each extra purchase and Remove to drop a row. Keep at least one lot. Fractional shares are allowed.",
  },
  {
    question: "What is unrealized profit or loss in this tool?",
    answer:
      "If you enter a current price, unrealized P/L is market value minus total invested. A positive number means the position is above your all-in cost; a negative number means it is below.",
  },
  {
    question: "Does this stock average calculator upload my trades?",
    answer:
      "No. Lots, fees, and the current price are calculated in your browser. Nothing is sent to a server or stored on our side.",
  },
  {
    question: "Should I use average price without fees or weighted average cost?",
    answer:
      "Weighted average cost includes fees and is the figure to use for break-even. Average price without fees is useful if you want to see the fill prices alone.",
  },
];

export const metadata: Metadata = {
  title: "Stock Average Calculator — Weighted Average Cost & Break-Even",
  description:
    "Free stock average calculator for multiple lots. Add shares, price, and optional fees to get weighted average cost, total invested, break-even, and unrealized P/L. Runs in your browser.",
  alternates: { canonical: href },
};

export default function StockAverageCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto max-w-5xl px-4 py-8">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        Stock Average Calculator
      </h1>
      <p className="mt-3 max-w-3xl text-muted">
        Find your weighted average cost after buying the same stock more than once.
      </p>

      <div className="mt-8">
        <StockAverageCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-ink/90">
        <p>
          A stock average calculator shows the real cost basis you carry after a
          series of buys. Enter each purchase as a lot with shares and price per
          share. Optional fees — a flat commission or other cash cost on that
          lot — are added to total invested so the average is not just a pretty
          fill price.
        </p>
        <p>
          When lot sizes differ, averaging the prices themselves is misleading.
          Weighted average cost multiplies each price by the shares in that lot,
          adds fees, and divides by total shares. That is the number your
          brokerage cost basis should move toward, and it is the same math this
          page uses for break-even.
        </p>
        <p>
          Add a current market price to see unrealized profit or loss versus
          your all-in spend. Market value is current price times total shares.
          Unrealized P/L is that value minus total invested, with a percentage
          against money actually put in. Use it before averaging down, after a
          drip of buys, or to check whether a target sale price gets you out
          whole.
        </p>
        <p>
          Everything on this page runs in your browser. Lots never leave the
          device, and there is no account. Pair it with the{" "}
          <Link className="text-accent underline" href="/seo/utm-builder">
            UTM builder
          </Link>{" "}
          if you are tracking a finance campaign, or the{" "}
          <Link className="text-accent underline" href="/dev/uuid-generator">
            UUID generator
          </Link>{" "}
          when you need local identifiers.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight">
          How to use the stock average calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Add a lot for each purchase. Include fractional shares if you bought them.</li>
          <li>Enter shares and price per share. Add an optional fee for that lot.</li>
          <li>Use Add lot for more fills, or Remove to drop a row.</li>
          <li>Optionally enter the current price to see market value and unrealized P/L.</li>
          <li>Read weighted average cost, total shares, total invested, and break-even price.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
