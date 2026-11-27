import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { DebtPayoffCalculator } from "@/components/tools/DebtPayoffCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/debt-payoff-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Debt Payoff Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What does a debt payoff calculator do?",
    answer:
      "It takes your debts, each with a balance, an APR, and a minimum payment, plus any extra money you can add each month. It then simulates paying them off and shows the payoff date, the total interest, and a month-by-month schedule.",
  },
  {
    question: "What is the debt avalanche method?",
    answer:
      "With the avalanche method you pay the minimum on every debt and send all extra money to the debt with the highest APR. When it is paid off, its payment rolls to the next-highest APR. It usually costs the least interest.",
  },
  {
    question: "What is the debt snowball method?",
    answer:
      "With the snowball method you pay the minimum on every debt and send all extra money to the smallest balance first. When it is gone, its payment rolls to the next-smallest balance. Paying off whole debts early can help some people stay motivated.",
  },
  {
    question: "Which is better, avalanche or snowball?",
    answer:
      "Avalanche never costs more interest than snowball, because it targets the highest rates first. Snowball can clear individual debts sooner. This calculator runs both with your numbers so you can compare the interest and the payoff date side by side.",
  },
  {
    question: "What is the extra monthly payment?",
    answer:
      "It is money you add on top of all your minimum payments each month. It goes to the target debt of the chosen method. When a debt is paid off, its old minimum payment is added to the target as well, so the total monthly budget stays the same.",
  },
  {
    question: "How is the interest calculated?",
    answer:
      "Each month the calculator divides the APR by 12 and applies it to the current balance of each debt, then subtracts that month's payments. Real lenders may compute interest daily or add fees, so your statements can differ slightly.",
  },
  {
    question: "Why does the calculator say my debts never pay off?",
    answer:
      "If a payment is smaller than the interest charged, the balance never shrinks. Raise a minimum payment or the extra monthly payment until the payments cover the interest, and the schedule will appear.",
  },
  {
    question: "Is my financial information stored or uploaded?",
    answer:
      "No. Every number is calculated in this browser tab. Nothing is sent to a server, saved, or logged, and there is no account to create.",
  },
];

export const metadata: Metadata = {
  title: "Debt Payoff Calculator — Avalanche vs Snowball, In Your Browser",
  description:
    "Free debt payoff calculator. Enter several debts with balance, APR, and minimum payment plus an extra payment to compare avalanche vs snowball payoff dates, interest, and schedule.",
  alternates: { canonical: href },
};

export default function DebtPayoffCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Debt Payoff Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Add each debt, set an extra monthly payment, and compare the avalanche
        and snowball methods by payoff date, total interest, and a full monthly
        schedule. It runs in your browser, so nothing is uploaded.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Avalanche vs snowball</li>
        <li className="chip inline-flex">Monthly schedule</li>
        <li className="chip inline-flex">Nothing uploaded</li>
      </ul>

      <div className="mt-8">
        <DebtPayoffCalculator />
      </div>

      <section className="mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A debt payoff calculator turns a pile of balances into a plan. You
          list each debt, add the minimum payment, and decide how much extra you
          can pay each month. The calculator then pays minimums on everything
          and sends the extra to one target debt at a time, following the
          avalanche order (highest APR first) or the snowball order (smallest
          balance first).
        </p>
        <p>
          Results assume fixed rates, no new charges, and no fees. They are
          estimates, not financial advice. Use your own balances and rates; this
          page makes no claim about what your result should be.
        </p>
        <p>
          Have just one card? Use the{" "}
          <Link className="text-mint underline" href="/finance/credit-card-payoff-calculator">
            credit card payoff calculator
          </Link>
          . For a single fixed-rate loan, see every payment on the{" "}
          <Link className="text-mint underline" href="/finance/amortization-calculator">
            amortization calculator
          </Link>
          . To see how paying down debt changes your total picture, try the{" "}
          <Link className="text-mint underline" href="/finance/net-worth-calculator">
            net worth calculator
          </Link>
          . More tools live on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the debt payoff calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter a name, balance, APR, and minimum payment for each debt. Add or remove rows as needed.</li>
          <li>Enter the extra amount you can pay each month on top of the minimums.</li>
          <li>Compare the payoff date and total interest for avalanche and snowball.</li>
          <li>Switch the schedule between the two methods to see each month.</li>
          <li>Raise the extra payment to see how much sooner you could be debt-free.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
