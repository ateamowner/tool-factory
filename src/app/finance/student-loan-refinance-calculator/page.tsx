import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { StudentLoanRefinanceCalculator } from "@/components/tools/StudentLoanRefinanceCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/student-loan-refinance-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Student Loan Refinance Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does a student loan refinance calculator work?",
    answer:
      "A student loan refinance calculator re-amortizes your current balance at the new refinance rate and term, then compares that offer with the loan you have now. You see the current monthly payment, the new payment, monthly savings, total interest on both paths, estimated savings vs the current loan, and break-even months if you enter fees.",
  },
  {
    question: "What numbers do I need for this student loan refinance calculator?",
    answer:
      "Enter the current loan balance, current interest rate, remaining term (years plus months, or months only), the new refinance rate, and the new term in months. Origination or closing fees are optional. A student loan refinancing calculator or refinance student loan calculator uses the same inputs.",
  },
  {
    question: "How do you calculate break-even months on refinance fees?",
    answer:
      "Break-even months is fees divided by monthly savings (current payment minus the new scheduled payment). If fees are $500 and you save $40.05 a month, break-even is about 12.5 months. If the new payment is not lower, fees never break even.",
  },
  {
    question: "Does a lower rate always save money on a student loan refinance?",
    answer:
      "Not always. A lower rate with a much longer term can raise total interest even when the monthly payment drops. Compare total interest and estimated savings vs the current loan — including fees — not just the new payment.",
  },
  {
    question: "What happens if I refinance federal student loans into a private loan?",
    answer:
      "Refinancing federal student loans with a private lender typically means you lose federal protections such as income-driven repayment, Public Service Loan Forgiveness, and certain deferment or forbearance options. This calculator only compares payment, interest, and fees. It does not value those benefits.",
  },
  {
    question: "Is refinancing the same as federal student loan consolidation?",
    answer:
      "No. A Direct Consolidation Loan combines federal loans into one federal loan and can change the payment plan, but it usually does not cut the interest rate. A private refinance replaces the loan with a new private rate, term, and often fees. This page models a refinance comparison only.",
  },
  {
    question: "Does this student loan refinance calculator upload my loan numbers?",
    answer:
      "No. Balance, rates, remaining term, new term, and fees are calculated in your browser. Nothing is sent to a server or stored on our side.",
  },
  {
    question: "Is this student loan refinance calculator financial advice?",
    answer:
      "No. Results are an educational estimate of payment, interest, and fee break-even. Credit, income, and lender offers vary, and refinancing federal loans has tradeoffs this page does not price. Check the offer documents or a qualified advisor before you sign.",
  },
];

export const metadata: Metadata = {
  title: "Student Loan Refinance Calculator — Payment, Savings & Break-Even",
  description:
    "Free student loan refinance calculator. Compare current vs new monthly payment, total interest, estimated savings, and fee break-even. Runs in your browser.",
  alternates: { canonical: href },
};

export default function StudentLoanRefinanceCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Student Loan Refinance Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Compare your current student loan with a refinance offer — new payment,
        total interest, estimated savings vs the current loan, and fee
        break-even — in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Payment vs current</li>
        <li className="chip inline-flex">Estimated savings</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <StudentLoanRefinanceCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A student loan refinance calculator answers a practical question: if
          you replace the current student loan with a new rate and term, does
          the monthly payment fall enough to justify any fees — and do you
          actually pay less interest? Enter the balance you still owe, the rate
          you pay now, and how much term is left — years plus months, or months
          only.
        </p>
        <p>
          Then add the refinance rate and new term in months (120 is 10 years).
          Optional origination or closing costs show break-even months: how long
          the monthly savings take to cover those fees. People also search this
          as a student loan refinancing calculator or a refinance student loan
          calculator — the comparison is the same. There is no second URL for
          those aliases.
        </p>
        <p>
          A lower payment is not the whole story. Stretching the term can raise
          total interest even when the monthly bill shrinks. The results panel
          shows current vs new interest and estimated savings vs the current
          loan, including fees paid at closing. Refinancing federal loans into a
          private loan can also cost income-driven repayment or Public Service
          Loan Forgiveness — this page does not price those benefits. Everything
          runs in your browser. Totals never leave the device, and there is no
          account.
        </p>
        <p>
          Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/finance/auto-loan-refinance-calculator">
            refinance calculator auto loan
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/credit-utilization-calculator">
            credit utilization calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/monthly-budget-template">
            monthly budget template
          </Link>
          , and{" "}
          <Link className="text-mint underline" href="/finance/break-even-sales-calculator">
            break even sales calculator
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
          How to use the student loan refinance calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter the current loan balance (remaining principal, not the original amount).</li>
          <li>Enter the current annual interest rate and remaining term in years and months.</li>
          <li>Enter the new refinance rate and the new term in months.</li>
          <li>Optionally add origination or closing fees.</li>
          <li>Read the new payment, total interest, estimated savings vs the current loan, and break-even if fees apply.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
