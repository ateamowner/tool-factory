import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { SimpleInterestCalculator } from "@/components/tools/SimpleInterestCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/simple-interest-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Simple Interest Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does a simple interest calculator work?",
    answer:
      "Enter the principal, the annual interest rate, and the term in days, months, or years. The calculator converts the term to years, applies I = P × r × t, and shows the interest plus the total amount (principal + interest).",
  },
  {
    question: "What is the simple interest formula?",
    answer:
      "Simple interest I = P × r × t, where P is the principal, r is the annual rate as a decimal, and t is the time in years. The total amount is A = P + I = P × (1 + r × t). Example: $10,000 at 5% for 3 years is $10,000 × 0.05 × 3 = $1,500 interest and $11,500 total.",
  },
  {
    question: "What is the difference between simple and compound interest?",
    answer:
      "Simple interest is charged only on the original principal, so it grows by the same dollar amount each year. Compound interest is charged on the principal plus interest already added, so it grows faster over time. $10,000 at 5% for 10 years is $5,000 of simple interest, but about $6,288.95 compounded yearly.",
  },
  {
    question: "How do I calculate simple interest for months?",
    answer:
      "Divide the months by 12 to get years, then use I = P × r × t. For $10,000 at 5% for 6 months, t = 6 / 12 = 0.5, so interest is $10,000 × 0.05 × 0.5 = $250.",
  },
  {
    question: "How do I calculate simple interest for days?",
    answer:
      "Divide the days by the days in a year, then use I = P × r × t. Most consumer math uses 365 days. Some banks and commercial notes use a 360-day year, which gives slightly more interest. You can pick 365 or 360 when the term is in days.",
  },
  {
    question: "How do I find the total amount owed or earned?",
    answer:
      "Add the interest to the principal: A = P + I. If you borrow $5,000 at 8% simple interest for 2 years, interest is $800 and the total to repay is $5,800.",
  },
  {
    question: "Where is simple interest used?",
    answer:
      "Simple interest is common on short-term personal loans, some auto loans, certificates of deposit that pay out interest, Treasury bills, and many classroom math problems. Most savings accounts and credit cards compound instead.",
  },
  {
    question: "Does this simple interest calculator upload my numbers?",
    answer:
      "No. Principal, rate, and term are calculated in your browser. Nothing is sent to a server or stored on our side. Results are an educational estimate, not financial advice.",
  },
];

export const metadata: Metadata = {
  title: "Simple Interest Calculator — I = P × r × t in Days, Months, Years",
  description:
    "Free simple interest calculator. Enter principal, annual rate, and a term in days, months, or years to get interest and the total amount. Runs in your browser.",
  alternates: { canonical: href },
};

export default function SimpleInterestCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Simple Interest Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Enter the principal, annual interest rate, and a term in days, months,
        or years to see the simple interest and the total amount. Uses I = P ×
        r × t.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Interest + total amount</li>
        <li className="chip inline-flex">Days, months, or years</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <SimpleInterestCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          Simple interest is interest paid only on the original principal. It
          does not earn interest on interest, so the dollar amount added each
          year stays the same. That makes it easy to estimate the cost of a
          short-term loan or the payout on a note, CD, or T-bill.
        </p>
        <p>
          The formula is I = P × r × t. P is the principal, r is the annual rate
          as a decimal (5% = 0.05), and t is time in years. Months are divided
          by 12, and days by 365 (or 360 on a banker&apos;s year). The total
          amount is A = P + I.
        </p>
        <p>
          Results are educational estimates, not financial advice. Everything
          runs in your browser. Numbers never leave the device, and there is no
          account.
        </p>
        <p>
          Thinking about a lower rate on a car loan? Try the{" "}
          <Link className="text-mint underline" href="/finance/auto-loan-refinance-calculator">
            auto loan refinance calculator
          </Link>
          . For student debt, use the{" "}
          <Link className="text-mint underline" href="/finance/student-loan-refinance-calculator">
            student loan refinance calculator
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
          How to use the simple interest calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter the principal — the amount borrowed or invested.</li>
          <li>Enter the annual interest rate as a percent.</li>
          <li>Enter the term and choose days, months, or years.</li>
          <li>For days, pick a 365-day or 360-day year.</li>
          <li>Read the simple interest and the total amount (principal + interest).</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
