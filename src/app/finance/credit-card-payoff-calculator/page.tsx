import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { CreditCardPayoffCalculator } from "@/components/tools/CreditCardPayoffCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/credit-card-payoff-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Credit Card Payoff Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How long will it take to pay off my credit card?",
    answer:
      "It depends on your balance, APR, and monthly payment. Each month, interest is added (balance × APR ÷ 12) and your payment is subtracted. A $5,000 balance at 22% APR with $200 a month takes 34 months and costs about $1,750 in interest. Enter your own numbers in the Months to pay off mode.",
  },
  {
    question: "How much do I need to pay each month to be debt-free by a certain date?",
    answer:
      "Use the Payment for a goal mode and enter the number of months until your target date. The calculator uses the loan payment formula: payment = balance × r ÷ (1 − (1 + r)^−n), where r is the monthly rate and n is the number of months. Paying off $5,000 at 22% in 24 months takes about $259.39 a month.",
  },
  {
    question: "What happens if my payment doesn't cover the interest?",
    answer:
      "If your payment is less than or equal to the monthly interest, the balance never goes down, and it can grow if fees are added. The calculator shows a warning and the interest charged in the first month, so you know the minimum it takes to start making progress.",
  },
  {
    question: "How is credit card interest calculated?",
    answer:
      "Most cards charge interest daily on the average daily balance, but a monthly estimate is close: divide the APR by 12 and multiply by the balance. At 24% APR, that is 2% a month, or $100 on a $5,000 balance.",
  },
  {
    question: "Does paying more than the minimum really help?",
    answer:
      "Yes. Every extra dollar goes straight to principal, which lowers next month's interest. Raising a $5,000 payoff at 22% APR from $150 to $250 a month cuts the time from 4 years and 4 months to 2 years and 2 months and saves over $1,500 in interest.",
  },
  {
    question: "Should I pay off the highest APR card first?",
    answer:
      "Paying the highest APR first (the avalanche method) saves the most interest. Paying the smallest balance first (the snowball method) gives quicker wins. Run each card through this calculator to compare, and make at least the minimum payment on every card.",
  },
  {
    question: "Would a balance transfer help me pay off my card faster?",
    answer:
      "It can. A 0% intro APR lets the whole payment go to principal, but most transfers charge a 3% to 5% fee and the rate jumps when the promo ends. Compare both options with the balance transfer calculator before you move a balance.",
  },
  {
    question: "Does this credit card payoff calculator upload my numbers?",
    answer:
      "No. Your balance, APR, and payment are calculated in your browser. Nothing is sent to a server or stored on our side, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "Credit Card Payoff Calculator — Months & Payment to Be Debt-Free",
  description:
    "Free credit card payoff calculator. See how many months it takes to pay off a card with a fixed payment, or the payment needed to be debt-free by a target date, with total interest and total paid.",
  alternates: { canonical: href },
};

export default function CreditCardPayoffCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Credit Card Payoff Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Find out how long it will take to pay off a credit card with a fixed
        monthly payment, or how much you need to pay each month to be debt-free
        by a target date. See total interest and total paid, and get a clear
        warning if your payment doesn&apos;t cover the monthly interest.
        Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Months to payoff</li>
        <li className="chip inline-flex">Payment for a target date</li>
        <li className="chip inline-flex">Total interest</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <CreditCardPayoffCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          Each month, your card adds interest of about balance × APR ÷ 12, and
          your payment comes off the top. Only the part of the payment above
          the interest lowers the balance. That is why small payments on a
          high-APR card can take years: at 22% APR, a $5,000 balance builds
          about $92 of interest in the first month.
        </p>
        <p>
          To hit a debt-free date, the calculator solves for the fixed payment
          that brings the balance to zero in the number of months you choose.
          Paying $5,000 at 22% APR over 24 months takes about $259.39 a month
          and about $1,225 in total interest.
        </p>
        <p>
          Results assume no new purchases, no fees, and a rate that stays the
          same. They are estimates, not financial advice. Numbers never leave
          the device, and there is no account.
        </p>
        <p>
          Thinking about moving the balance to a 0% card? Compare the fee and
          promo period with the{" "}
          <Link className="text-mint underline" href="/finance/balance-transfer-calculator">
            balance transfer calculator
          </Link>
          . See how paying down the card lowers your utilization ratio with the{" "}
          <Link className="text-mint underline" href="/finance/credit-utilization-calculator">
            credit utilization calculator
          </Link>
          , and plan the monthly payment with the{" "}
          <Link className="text-mint underline" href="/finance/monthly-budget-template">
            monthly budget template
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
          How to use the credit card payoff calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose Months to pay off or Payment for a goal.</li>
          <li>Enter your card balance and APR.</li>
          <li>Enter your monthly payment, or the number of months until you want to be debt-free.</li>
          <li>Read the payoff time or payment, the debt-free date, total interest, and total paid.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
