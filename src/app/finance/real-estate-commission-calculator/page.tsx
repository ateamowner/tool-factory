import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { RealEstateCommissionCalculator } from "@/components/tools/RealEstateCommissionCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/real-estate-commission-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Real Estate Commission Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does a real estate commission calculator work?",
    answer:
      "A real estate commission calculator multiplies the home sale price by the total commission rate to get the commission in dollars. It can then split that total between the listing agent and the buyer’s agent, subtract optional extra fees or concessions, and show seller net proceeds.",
  },
  {
    question: "What is a typical real estate commission rate?",
    answer:
      "Total commission is often about 5–6% of the sale price, though the rate is negotiable and varies by market, brokerage, and the 2024 industry rule changes. This calculator defaults to 5.5% so you can start from a common midpoint and change it.",
  },
  {
    question: "How is commission split between listing and buyer agents?",
    answer:
      "The listing (seller’s) agent and the buyer’s agent usually share the total commission. A 50/50 split is common — for example, 5.5% total becomes 2.75% of the sale price on each side. You can enter any two shares that add to 100%.",
  },
  {
    question: "How do you calculate seller net proceeds?",
    answer:
      "Seller net proceeds here are the sale price minus total commission minus optional additional fees or concessions. A $400,000 sale at 5.5% with no extra fees leaves $378,000. Closing costs, taxes, and loan payoff are not modeled unless you add them as fees.",
  },
  {
    question: "Who pays the real estate commission?",
    answer:
      "The seller typically pays the total commission from sale proceeds at closing. How much of that goes to the listing side versus the buyer’s agent is a negotiated split. This page shows both sides in dollars and as a percent of the sale price.",
  },
  {
    question: "Does this include closing costs or seller concessions?",
    answer:
      "Only if you enter them in additional fees / concessions. Use that field for credits, extra seller fees, or other cash you want deducted from net proceeds. The commission itself is calculated from the rate you enter.",
  },
  {
    question: "Does this real estate commission calculator upload my sale numbers?",
    answer:
      "No. Sale price, commission rate, agent split, and fees are calculated in your browser. Nothing is sent to a server or stored on our side.",
  },
];

export const metadata: Metadata = {
  title: "Real Estate Commission Calculator — Seller Net, Split & Fees",
  description:
    "Free real estate commission calculator. See total commission, listing-side and buyer-side dollars, and seller net proceeds after optional fees. Runs in your browser.",
  alternates: { canonical: href },
};

export default function RealEstateCommissionCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Real Estate Commission Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Estimate total commission, listing- and buyer-side dollars, and seller
        net proceeds from the sale price, rate, optional split, and extra fees.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Seller net proceeds</li>
        <li className="chip inline-flex">Listing / buyer split</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <RealEstateCommissionCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A real estate commission calculator answers a practical question: if
          the home sells at this price and this rate, how much commission comes
          out, how is it split, and what is left for the seller? Enter the
          expected sale price and a total commission rate — often about 5–6%,
          and always negotiable.
        </p>
        <p>
          The optional listing and buyer shares split that total. A 50/50 split
          on a 5.5% rate is 2.75% of the sale price on each side. Additional
          fees or concessions — closing credits, extra seller costs — reduce
          seller net proceeds after commission.
        </p>
        <p>
          Results are estimates, not a closing statement. Loan payoff, title
          fees, taxes, and brokerage-specific rules are not included unless you
          add them as fees. Everything runs in your browser. Totals never leave
          the device, and there is no account.
        </p>
        <p>
          Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/finance/mortgage-recast-calculator">
            mortgage recast calculator
          </Link>{" "}
          and{" "}
          <Link className="text-mint underline" href="/finance/auto-loan-refinance-calculator">
            refinance calculator auto loan
          </Link>
          . For campaign URLs, use the{" "}
          <Link className="text-mint underline" href="/seo/utm-builder">
            UTM builder
          </Link>
          . Need a photo converted locally? Try the{" "}
          <Link className="text-mint underline" href="/convert/heic-to-png">
            HEIC to PNG converter
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the real estate commission calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter the expected home sale price.</li>
          <li>Enter the total commission rate as a percent of the sale price (default 5.5%).</li>
          <li>Optionally change the listing and buyer shares of that commission (they should add to 100).</li>
          <li>Optionally add extra seller fees or concessions.</li>
          <li>Read total commission, each side in dollars, and seller net proceeds.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
