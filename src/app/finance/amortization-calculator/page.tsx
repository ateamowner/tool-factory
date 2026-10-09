import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { AmortizationCalculator } from "@/components/tools/AmortizationCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/amortization-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Amortization Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is an amortization calculator?",
    answer:
      "An amortization calculator works out the fixed monthly payment on a loan and splits every payment into interest and principal. The amortization schedule shows how the balance falls month by month until the loan is paid off.",
  },
  {
    question: "How is the monthly payment calculated?",
    answer:
      "The standard formula is P × r ÷ (1 − (1 + r)^−n), where P is the loan amount, r is the annual rate divided by 12, and n is the number of monthly payments. For example, $300,000 at 6.5% for 30 years is about $1,896.20 per month.",
  },
  {
    question: "Why is so much of my early payment interest?",
    answer:
      "Interest is charged on the remaining balance, which is highest at the start. In the first month of a $300,000 loan at 6.5%, about $1,625 of the $1,896.20 payment is interest. As the balance drops, more of each payment goes to principal.",
  },
  {
    question: "How do extra payments change the schedule?",
    answer:
      "Extra principal lowers the balance faster, so later interest charges shrink and the loan ends early. Enter an extra monthly amount to see the new payoff time and total interest. Check with your lender that extra payments go to principal.",
  },
  {
    question: "Does the payment include taxes and insurance?",
    answer:
      "No. The result is principal and interest only. Mortgage payments often also include property tax, homeowners insurance, PMI, or HOA dues held in escrow, so your actual bill may be higher.",
  },
  {
    question: "Can I use it for car loans, personal loans, or student loans?",
    answer:
      "Yes. Any fixed-rate loan with equal monthly payments amortizes the same way. Enter the loan amount, APR, and term in years (for example 5 for a 60-month car loan).",
  },
  {
    question: "What happens at 0% interest?",
    answer:
      "With no interest, the payment is simply the loan amount divided by the number of months, and every dollar goes to principal. A $12,000 loan over 1 year is $1,000 per month.",
  },
  {
    question: "Is my loan information saved or uploaded?",
    answer:
      "No. The amortization calculator runs entirely in your browser. Loan amounts and rates are not sent to a server or stored on our side, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "Amortization Calculator — Monthly Payment & Loan Schedule",
  description:
    "Free amortization calculator. Enter loan amount, interest rate, and term to see the monthly payment, total interest, and a full monthly or yearly amortization schedule, with optional extra payments. Runs in your browser.",
  alternates: { canonical: href },
};

export default function AmortizationCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Amortization Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Find the monthly payment on any fixed-rate loan and see exactly how
        each payment splits between principal and interest. Add extra monthly
        principal to see how much sooner you pay off and how much interest you
        save. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Monthly &amp; yearly schedule</li>
        <li className="chip inline-flex">Extra payments</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <AmortizationCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          Amortization is paying off a loan with equal monthly payments. Each
          month, interest is charged on the remaining balance and the rest of
          the payment reduces principal, so early payments are mostly interest
          and later payments are mostly principal.
        </p>
        <p>
          Example: a $300,000 mortgage at 6.5% for 30 years has a monthly
          principal and interest payment of $1,896.20. Over 360 payments you
          pay about $382,600 in interest. Adding $200 a month of extra
          principal pays the loan off years early and cuts that interest
          substantially.
        </p>
        <p>
          Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/finance/mortgage-recast-calculator">
            mortgage recast calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/apr-calculator">
            APR calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/auto-loan-refinance-calculator">
            auto loan refinance calculator
          </Link>
          , and{" "}
          <Link className="text-mint underline" href="/finance/student-loan-refinance-calculator">
            student loan refinance calculator
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the amortization calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter the loan amount.</li>
          <li>Enter the annual interest rate (APR).</li>
          <li>Enter the loan term in years.</li>
          <li>Optional: add an extra monthly principal payment.</li>
          <li>Read the monthly payment, total interest, and the yearly or monthly schedule.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
