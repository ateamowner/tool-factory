import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { AprCalculator } from "@/components/tools/AprCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/apr-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "APR Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is an APR calculator?",
    answer:
      "An APR calculator estimates the annual percentage rate on a fixed installment loan. You enter the loan amount, nominal interest rate, term, and optional upfront fees. The page shows the monthly payment, an APR-style estimate, total payments, total interest, and total cost including fees.",
  },
  {
    question: "How is APR different from the nominal interest rate?",
    answer:
      "The nominal rate is the stated annual interest used to set the payment schedule. APR annualizes the cost of borrowing when upfront fees reduce what you effectively receive. With no fees, estimated APR matches the nominal rate. With fees, APR is usually higher.",
  },
  {
    question: "How does this loan APR calculator treat fees?",
    answer:
      "Upfront fees, points, or closing costs reduce net proceeds (loan amount minus fees). The monthly payment is still amortized from the full loan amount at the nominal rate. APR is the internal rate that equates those net proceeds to the payment stream — a common educational Truth-in-Lending-style model.",
  },
  {
    question: "How do you calculate monthly payment from the nominal rate?",
    answer:
      "The payment uses standard amortization: for principal P, monthly rate r = nominal%/12/100, and n months, payment = P × r × (1+r)^n / ((1+r)^n − 1). At 0% interest, payment is simply P / n.",
  },
  {
    question: "What is annual percentage rate on an installment loan?",
    answer:
      "Annual percentage rate (APR) expresses the yearly cost of credit. For a fixed installment loan, it is often found by solving for the interest rate that makes the present value of scheduled payments equal the amount financed after certain fees, then annualizing that rate.",
  },
  {
    question: "Does this APR calculator upload my loan numbers?",
    answer:
      "No. Loan amount, rate, term, and fees are calculated in your browser. Nothing is sent to a server or stored on our side.",
  },
  {
    question: "Is this APR calculator legal or lending advice?",
    answer:
      "No. Results are an educational estimate from the numbers you enter. Lender disclosures, compounding conventions, which fees enter APR, and product rules can differ. Check official loan documents or a qualified advisor for your situation.",
  },
  {
    question: "Can I enter term in years and months?",
    answer:
      "Yes. Use years plus extra months, or set years to 0 and enter months only — the same pattern as other finance tools on this site. Term must be at least 1 month.",
  },
];

export const metadata: Metadata = {
  title: "APR Calculator — Loan APR & Monthly Payment",
  description:
    "Free APR calculator for fixed installment loans. Enter loan amount, nominal rate, term, and optional fees to see monthly payment, estimated APR, total interest, and total cost. Runs in your browser.",
  alternates: { canonical: href },
};

export default function AprCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        APR Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Estimate installment-loan APR from loan amount, nominal annual rate,
        term, and optional upfront fees — plus monthly payment, interest, and
        total cost. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Payment + APR</li>
        <li className="chip inline-flex">Fees → net proceeds</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <AprCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          An APR calculator (also searched as a loan APR calculator or annual
          percentage rate calculator) answers a practical question: after fees,
          what yearly rate makes the payment stream match what you actually
          receive? Enter the principal, the stated nominal rate, and the term
          in years and months.
        </p>
        <p>
          The monthly payment is amortized from the full loan amount at the
          nominal rate. Optional points or closing costs reduce net proceeds.
          APR is solved as the internal rate that equates those proceeds to the
          payments, then multiplied by 12. With zero fees, estimated APR matches
          the nominal rate.
        </p>
        <p>
          Results are educational estimates, not a lender disclosure or credit
          offer. Which fees enter official APR, and how lenders round, can
          differ. Totals never leave the device, and there is no account.
        </p>
        <p>
          Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub, or open the{" "}
          <Link
            className="text-mint underline"
            href="/finance/auto-loan-refinance-calculator"
          >
            refinance calculator auto loan
          </Link>
          ,{" "}
          <Link
            className="text-mint underline"
            href="/finance/student-loan-refinance-calculator"
          >
            student loan refinance calculator
          </Link>
          ,{" "}
          <Link
            className="text-mint underline"
            href="/finance/balance-transfer-calculator"
          >
            balance transfer calculator
          </Link>
          ,{" "}
          <Link
            className="text-mint underline"
            href="/finance/mortgage-recast-calculator"
          >
            mortgage recast calculator
          </Link>
          ,{" "}
          <Link
            className="text-mint underline"
            href="/finance/cd-rate-calculator"
          >
            CD rate calculator
          </Link>
          , and{" "}
          <Link
            className="text-mint underline"
            href="/finance/overtime-calculator"
          >
            overtime calculator
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the APR calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter the loan amount (principal before upfront fees).</li>
          <li>Enter the nominal annual interest rate as a percent.</li>
          <li>Enter the term in years and months (or months only).</li>
          <li>Optionally add upfront fees, points, or closing costs.</li>
          <li>
            Read the monthly payment, estimated APR, total payments, interest,
            and total cost including fees.
          </li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
