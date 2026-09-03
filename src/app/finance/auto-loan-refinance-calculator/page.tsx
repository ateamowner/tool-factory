import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { AutoLoanRefinanceCalculator } from "@/components/tools/AutoLoanRefinanceCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/auto-loan-refinance-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Refinance Calculator Auto Loan", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does a refinance calculator auto loan work?",
    answer:
      "A refinance calculator auto loan re-amortizes your current balance at the new rate and term, then compares that offer with the loan you have now. You see the current monthly payment, the new payment, monthly savings, total interest on both paths, and total cost after optional fees.",
  },
  {
    question: "What numbers do I need for this refinance calculator auto loan?",
    answer:
      "Enter the current loan balance, current interest rate, remaining term (years plus months, or months only), the new refinance rate, and the new term in months. Fees and an extra monthly payment are optional. An auto refinance calculator or car loan refinance calculator uses the same inputs.",
  },
  {
    question: "How do you calculate break-even months on refinance fees?",
    answer:
      "Break-even months is fees divided by monthly savings (current payment minus the new scheduled payment). If fees are $399 and you save $21.44 a month, break-even is about 18.6 months. If the new payment is not lower, fees never break even.",
  },
  {
    question: "Does a lower rate always save money on an auto refinance?",
    answer:
      "Not always. A lower rate with a much longer term can raise total interest even when the monthly payment drops. Compare total interest and total cost — including fees — not just the new payment.",
  },
  {
    question: "How does an extra monthly payment change the refinance comparison?",
    answer:
      "Extra principal is added on top of the new scheduled payment. That shortens months to pay off and cuts interest on the new loan. Monthly savings still compares the scheduled payments so you can see the refinance itself, separate from extra principal.",
  },
  {
    question: "Does this refinance calculator auto loan upload my loan numbers?",
    answer:
      "No. Balance, rates, remaining term, fees, and extra payments are calculated in your browser. Nothing is sent to a server or stored on our side.",
  },
  {
    question: "What is the difference between refinancing and recasting a loan?",
    answer:
      "Refinancing replaces the loan with a new rate, term, and usually fees. A recast keeps the same loan and rate, then lowers the payment after a lump-sum principal payment. This page models an auto refinance only.",
  },
];

export const metadata: Metadata = {
  title: "Refinance Calculator Auto Loan — Payment, Savings & Break-Even",
  description:
    "Free refinance calculator auto loan. Compare current vs new monthly payment, total interest, fees break-even, and total cost. Optional extra payment. Runs in your browser.",
  alternates: { canonical: href },
};

export default function AutoLoanRefinanceCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Refinance Calculator Auto Loan
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Compare your current car loan with a refinance offer — new payment,
        monthly savings, interest, fee break-even, and total cost — in the
        browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Payment vs current</li>
        <li className="chip inline-flex">Fee break-even</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <AutoLoanRefinanceCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A refinance calculator auto loan answers a practical question: if you
          replace the current car loan with a new rate and term, does the monthly
          payment fall enough to justify the fees? Enter the balance you still
          owe, the rate you pay now, and how much term is left — years plus
          months, or months only.
        </p>
        <p>
          Then add the refinance rate and new term. Optional closing costs show
          break-even months: how long the monthly savings take to cover those
          fees. An optional extra monthly payment is added on top of the new
          scheduled payment so you can see a faster payoff and lower interest.
          People also search this as an auto refinance calculator or a car loan
          refinance calculator — the comparison is the same.
        </p>
        <p>
          A lower payment is not the whole story. Stretching the term can raise
          total interest even when the monthly bill shrinks. The results panel
          shows current vs new interest and a total cost comparison that includes
          fees paid at closing. Everything runs in your browser. Totals never
          leave the device, and there is no account.
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
          <Link className="text-mint underline" href="/finance/emergency-fund-calculator">
            emergency fund calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/stock-average-calculator">
            stock average calculator
          </Link>
          , and{" "}
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
          How to use the refinance calculator auto loan
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter the current loan balance (remaining principal, not the original amount).</li>
          <li>Enter the current annual interest rate and remaining term in years and months.</li>
          <li>Enter the new refinance rate and the new term in months.</li>
          <li>Optionally add fees or closing costs, and an extra monthly payment.</li>
          <li>Read the new payment, monthly savings, interest, break-even, and total cost.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
