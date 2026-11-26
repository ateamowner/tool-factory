import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { NetWorthCalculator } from "@/components/tools/NetWorthCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/net-worth-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Net Worth Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is net worth?",
    answer:
      "Net worth is the total value of what you own (assets) minus the total of what you owe (debts). A positive number means your assets are larger than your debts; a negative number means the reverse.",
  },
  {
    question: "How do I calculate my net worth?",
    answer:
      "Add up your assets: cash, investments, retirement accounts, home, vehicles, and anything else of value. Add up your debts: mortgage, loans, credit cards, and other balances. Subtract total debts from total assets. This calculator does the math as you type.",
  },
  {
    question: "What counts as an asset?",
    answer:
      "Anything you own that has monetary value: bank balances, brokerage accounts, retirement accounts such as a 401(k) or IRA, the market value of your home and vehicles, and other items you could reasonably sell. Use current balances or realistic market values.",
  },
  {
    question: "What counts as a debt?",
    answer:
      "Any balance you owe: your mortgage, auto, student, and personal loans, credit card balances, and other bills or loans. Use the current payoff balance, not the original amount borrowed.",
  },
  {
    question: "What is the asset-to-debt ratio?",
    answer:
      "It is total assets divided by total debts. A ratio of 2 : 1 means you own twice as much as you owe. If you have no debts the ratio is undefined, so the calculator shows “No debts”. The page also shows debts as a percentage of assets.",
  },
  {
    question: "Can my net worth be negative?",
    answer:
      "Yes. If your debts are larger than your assets, your net worth is below zero. That is common with student loans or a new mortgage, and it can change as you pay down balances or your assets grow.",
  },
  {
    question: "Should I include my home and retirement accounts?",
    answer:
      "Most people do, since both are real assets. Some also look at a version that leaves out the home or retirement money to see what is easy to access. Run the calculator both ways by setting those fields to 0 and compare.",
  },
  {
    question: "Is my financial information stored or uploaded?",
    answer:
      "No. Every number is calculated in this browser tab. Nothing is sent to a server, saved, or logged, and there is no account to create.",
  },
];

export const metadata: Metadata = {
  title: "Net Worth Calculator — Assets Minus Debts, In Your Browser",
  description:
    "Free net worth calculator. Enter cash, investments, retirement, home, and vehicles plus mortgage, loans, and credit cards to see net worth and your asset-to-debt ratio.",
  alternates: { canonical: href },
};

export default function NetWorthCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Net Worth Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Add what you own and what you owe to see your net worth and your
        asset-to-debt ratio. It runs in your browser, so nothing is uploaded.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Assets and debts</li>
        <li className="chip inline-flex">Asset-to-debt ratio</li>
        <li className="chip inline-flex">Nothing uploaded</li>
      </ul>

      <div className="mt-8">
        <NetWorthCalculator />
      </div>

      <section className="mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A net worth calculator gives you a single snapshot of your finances:
          everything you own minus everything you owe. Tracking it over time
          shows whether paying down debt and building savings is moving your
          total in the right direction.
        </p>
        <p>
          Enter current balances for cash, investments, retirement accounts,
          your home, and vehicles, then your mortgage, loans, and credit cards.
          The asset-to-debt ratio shows how many dollars of assets you hold for
          each dollar of debt. Use your own numbers only; this page makes no
          claim about what your result should be.
        </p>
        <p>
          Building a cushion? Size it with the{" "}
          <Link className="text-mint underline" href="/finance/emergency-fund-calculator">
            emergency fund calculator
          </Link>
          . Carrying card balances? See how long they take to clear with the{" "}
          <Link className="text-mint underline" href="/finance/credit-card-payoff-calculator">
            credit card payoff calculator
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
          How to use the net worth calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter current balances or values for each asset. Leave unused fields blank.</li>
          <li>Enter what you still owe on your mortgage, loans, and credit cards.</li>
          <li>Read your net worth, total assets, and total debts.</li>
          <li>Check the asset-to-debt ratio and debt as a percentage of assets.</li>
          <li>Come back with updated numbers to see how things change.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
