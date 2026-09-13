import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { BalanceTransferCalculator } from "@/components/tools/BalanceTransferCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/balance-transfer-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Balance Transfer Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does a balance transfer calculator work?",
    answer:
      "A balance transfer calculator compares two paths with the same monthly payment: keep paying your current card APR, or move the balance to a promo APR card and add the transfer fee to the new starting balance. You see the fee, months to pay off, whether you finish during the promo, total interest, total cost (interest plus fee), and estimated savings versus staying put.",
  },
  {
    question: "What numbers do I need for this balance transfer calculator?",
    answer:
      "Enter the current balance, current APR, and the monthly payment you can keep making. Then add the transfer fee (percent of the transferred amount and/or a flat dollar amount), the promo APR, promo length in months, and the regular or go-to APR after the intro window. A credit card balance transfer calculator uses the same inputs.",
  },
  {
    question: "How is the balance transfer fee calculated?",
    answer:
      "The transfer fee is a percent of the amount you move, a flat dollar amount, or both. A 3% fee on a $5,000 balance is $150; 5% plus a $10 flat fee is $260. That fee is added to the new card, so the starting balance after the transfer is higher than what you owed before. A balance transfer fee calculator is the same comparison — there is no second page for that phrasing.",
  },
  {
    question: "What happens if I do not pay off the transfer during the promo?",
    answer:
      "Any leftover principal starts accruing the regular or go-to APR when the promo ends. Interest after that date can erase most of the savings from a 0% intro. The results panel flags when the transferred balance will not finish in the promo window so you can raise the payment or shorten the comparison.",
  },
  {
    question: "When does a balance transfer save money versus staying put?",
    answer:
      "A transfer usually saves money when the promo APR is much lower than your current APR, you can pay the new balance (including the fee) before or soon after the promo ends, and the fee is smaller than the interest you would have paid on the old card. If the payment is too low to cover interest, or the leftover after promo is large, staying put can cost less.",
  },
  {
    question: "Why does this calculator say my monthly payment will never pay off the balance?",
    answer:
      "If the payment is at or below that month’s interest, the principal does not shrink. On a $5,000 balance at 24% APR, interest is about $100 a month, so a $50 payment never pays the card off. Raise the payment until it covers interest plus some principal on each path you care about.",
  },
  {
    question: "Does this balance transfer calculator upload my card numbers?",
    answer:
      "No. Balance, APRs, payment, and fees are calculated in your browser. Nothing is sent to a server or stored on our side.",
  },
  {
    question: "Is this balance transfer calculator financial advice?",
    answer:
      "No. Results are an educational estimate of payoff time, interest, and transfer-fee cost. Credit limits, issuer rules, remaining promo terms, and your other bills vary. Check the offer documents or a qualified advisor before you transfer a balance.",
  },
];

export const metadata: Metadata = {
  title: "Balance Transfer Calculator — Promo APR, Fee & Savings",
  description:
    "Free balance transfer calculator. Compare staying on your current card APR versus a promo APR transfer, including the transfer fee, months to pay off, interest, and estimated savings. Runs in your browser.",
  alternates: { canonical: href },
};

export default function BalanceTransferCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Balance Transfer Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Compare keeping your current card APR with transferring the balance to a
        promo APR card — including the transfer fee, months to pay off, and
        estimated savings — in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Promo vs stay put</li>
        <li className="chip inline-flex">Transfer fee included</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <BalanceTransferCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A balance transfer calculator answers a practical question: if you
          move a credit card balance to a promo APR offer, do you pay less
          interest than staying put — after the transfer fee? Enter what you
          owe now, the APR you pay today, and the monthly payment you can keep
          making on either path.
        </p>
        <p>
          Then add the offer: a transfer fee as a percent of the amount moved
          (3–5% is common) and/or a flat dollar fee, the promo APR, how many
          months the promo lasts, and the regular or go-to APR after that
          window. People also search this as a credit card balance transfer
          calculator or a balance transfer fee calculator — the comparison is
          the same. There is no second URL for those aliases.
        </p>
        <p>
          The results panel shows the fee and the new starting balance, months
          to pay off on the transfer path (and whether that happens during the
          promo), transfer interest and total cost, then the same payoff and
          interest if you keep the current card. Estimated savings is stay-put
          interest minus transfer cost (interest plus fee). If the payment is
          too low to cover interest, or the promo ends with a leftover
          balance, the page says so. Everything runs in your browser. Totals
          never leave the device, and there is no account.
        </p>
        <p>
          Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/finance/credit-utilization-calculator">
            credit utilization calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/student-loan-refinance-calculator">
            student loan refinance calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/monthly-budget-template">
            monthly budget template
          </Link>
          , and{" "}
          <Link className="text-mint underline" href="/finance/emergency-fund-calculator">
            emergency fund calculator
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
          How to use the balance transfer calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter the current card balance and the APR you pay now.</li>
          <li>Enter the monthly payment you can keep making on either path.</li>
          <li>Enter the transfer fee as a percent, a flat dollar amount, or both.</li>
          <li>Enter the promo APR, promo length in months, and the regular APR after the promo.</li>
          <li>Read the fee, new starting balance, payoff months, interest, total cost, and estimated savings versus staying put.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
