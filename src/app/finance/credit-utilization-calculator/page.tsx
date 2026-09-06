import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { CreditUtilizationCalculator } from "@/components/tools/CreditUtilizationCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/credit-utilization-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Credit Utilization Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does a credit utilization calculator work?",
    answer:
      "A credit utilization calculator divides your current credit card balances by your credit limits, then multiplies by 100 to get utilization percent. It also shows remaining available credit and, if you set a target ratio, how many dollars to pay down to reach that target.",
  },
  {
    question: "What is a good credit utilization ratio?",
    answer:
      "Lower is generally better for FICO-style scores. Many people aim to keep overall utilization under 30%, and some aim for under 10%. This calculator defaults to a 30% target so you can see the paydown, then change the target to any percent from 0 to 100.",
  },
  {
    question: "How do you calculate credit utilization?",
    answer:
      "Overall utilization is total balances divided by total credit limits. Per-card utilization is that card’s balance divided by that card’s limit. A $4,000 balance on a $10,000 limit is 40%. Available credit is the unused part of the limit, floored at $0 if you are over the limit.",
  },
  {
    question: "How much should I pay down to reach 30% utilization?",
    answer:
      "Subtract the target balance from what you owe now. Target balance is your total limits times the target percent. On a $10,000 limit with a $4,000 balance, a 30% target is $3,000, so you would pay $1,000. If you are already at or below the target, the paydown is $0.",
  },
  {
    question: "Should I look at overall utilization or per-card utilization?",
    answer:
      "Scoring models typically use overall utilization across revolving accounts and can also look at individual cards. A low overall ratio can still hide one maxed-out card. Use totals mode for the combined ratio, or per-card mode to see each card and how much to pay on that card.",
  },
  {
    question: "Does paying down one card help overall credit utilization?",
    answer:
      "Yes. Overall utilization uses the sum of balances and the sum of limits, so paying any card reduces the combined ratio. Paying the highest-utilization card usually helps both the overall number and that card’s individual ratio.",
  },
  {
    question: "Does this credit utilization calculator upload my balances?",
    answer:
      "No. Limits, balances, and the target percent are calculated in your browser. Nothing is sent to a server or stored on our side.",
  },
];

export const metadata: Metadata = {
  title: "Credit Utilization Calculator — Ratio, Available Credit & Paydown",
  description:
    "Free credit utilization calculator. See overall and per-card utilization, remaining available credit, and how much to pay to reach a target like 30%. Runs in your browser.",
  alternates: { canonical: href },
};

export default function CreditUtilizationCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Credit Utilization Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        See overall credit utilization, remaining available credit, optional
        per-card ratios, and how much to pay down to reach a target like 30%.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Overall + per-card</li>
        <li className="chip inline-flex">Paydown to target</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <CreditUtilizationCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A credit utilization calculator answers a practical question: what
          percent of your revolving credit is in use, and how much would you
          need to pay to get that ratio down? Enter total credit limits and
          current balances, or switch to per-card mode and add each card.
        </p>
        <p>
          Overall utilization is balances divided by limits. Remaining available
          credit is the unused part of those limits. An optional target — 30% is
          the default because it is a common FICO-style guideline — shows the
          target balance and the dollars to pay. Per-card mode also lists each
          card’s ratio and the paydown on that card.
        </p>
        <p>
          Results are estimates for revolving credit cards, not a credit score.
          Charge cards without a limit, installment loans, and issuer reporting
          dates are not modeled. Everything runs in your browser. Totals never
          leave the device, and there is no account.
        </p>
        <p>
          Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/finance/emergency-fund-calculator">
            emergency fund calculator
          </Link>{" "}
          and{" "}
          <Link className="text-mint underline" href="/finance/paycheck-calculator-hourly">
            paycheck calculator hourly
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
          How to use the credit utilization calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose totals for combined limits and balances, or per card to enter each account.</li>
          <li>Enter credit limits above 0 and current balances of 0 or more.</li>
          <li>Optionally set a target utilization (default 30%), or pick 10% or 50%.</li>
          <li>Read overall utilization, available credit, and dollars to pay to hit the target.</li>
          <li>In per-card mode, check each card’s ratio and that card’s paydown amount.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
