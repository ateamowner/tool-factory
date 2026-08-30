import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { MortgageRecastCalculator } from "@/components/tools/MortgageRecastCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/mortgage-recast-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Mortgage Recast Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does a mortgage recast calculator work?",
    answer:
      "A mortgage recast calculator subtracts your lump-sum principal payment from the remaining loan balance, then re-amortizes that new balance over the same remaining term at the same interest rate. The result is a lower monthly payment — not a shorter loan and not a new rate.",
  },
  {
    question: "What is the difference between a recast and a refinance?",
    answer:
      "A recast keeps your existing loan, interest rate, and remaining term, then lowers the payment after a principal reduction. A refinance replaces the loan, can change the rate and term, and usually adds closing costs. This page is a recast mortgage calculator only — it does not model a refinance.",
  },
  {
    question: "Does a mortgage recast shorten the remaining term?",
    answer:
      "No. A lump-sum recast keeps the original remaining term and recalculates the payment so the new, lower balance is paid off on the same schedule. Extra principal without a recast would instead shorten the term while the payment stayed the same.",
  },
  {
    question: "How do you calculate interest savings after a recast?",
    answer:
      "Interest left without a recast is the current payment times remaining months, minus today’s balance. Interest left after recast is the new payment times the same months, minus the reduced balance. The difference is interest you avoid by paying principal up front.",
  },
  {
    question: "What lump sum do I need for a recast?",
    answer:
      "Lenders set their own minimums — often several thousand dollars — and may charge a recast fee. Enter the principal amount you would actually apply. This calculator does not include lender fees or approval rules.",
  },
  {
    question: "Does this mortgage recast calculator upload my loan numbers?",
    answer:
      "No. Balance, rate, remaining term, and the lump sum are calculated in your browser. Nothing is sent to a server or stored on our side.",
  },
];

export const metadata: Metadata = {
  title: "Mortgage Recast Calculator — New Payment & Interest Savings",
  description:
    "Free mortgage recast calculator for a lump-sum principal payment. See the new monthly payment, payment drop, and interest savings with the same remaining term — not a refinance. Runs in your browser.",
  alternates: { canonical: href },
};

export default function MortgageRecastCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Mortgage Recast Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Apply a lump-sum principal payment, keep the remaining term, and see the
        new monthly payment, payment drop, and interest savings.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Lump-sum recast</li>
        <li className="chip inline-flex">Same remaining term</li>
        <li className="chip inline-flex">Not a refinance</li>
      </ul>

      <div className="mt-8">
        <MortgageRecastCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A mortgage recast calculator answers a practical question: if you put
          a lump sum toward principal, how much does the monthly payment fall
          when the lender re-amortizes the loan? Recast — sometimes searched as
          a recast mortgage calculator — keeps the same remaining term and the
          same rate. Only the balance and the payment change.
        </p>
        <p>
          That is different from sending extra principal without asking for a
          recast, which pays the loan off sooner while the payment stays put.
          It is also different from a refinance, which replaces the loan and
          can change the rate, term, and closing costs. This tool models the
          lump-sum recast only.
        </p>
        <p>
          Enter remaining balance, annual interest rate, remaining years and
          months, and the principal payment. The page shows the current payment,
          the new payment after recast, the drop, and interest you avoid versus
          continuing on the original schedule. Everything runs in your browser.
          Totals never leave the device, and there is no account.
        </p>
        <p>
          Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub, or open the{" "}
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
          How to use the mortgage recast calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter the remaining loan balance (current principal, not the original amount).</li>
          <li>Enter the annual interest rate on the existing loan.</li>
          <li>Set the remaining term in years and extra months.</li>
          <li>Enter the lump-sum amount you would apply to principal.</li>
          <li>Read the new monthly payment, payment drop, and interest savings.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
