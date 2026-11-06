import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { HelocCalculator } from "@/components/tools/HelocCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/heloc-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "HELOC Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a HELOC calculator?",
    answer:
      "A HELOC calculator estimates payments on a home equity line of credit across both phases: an interest-only draw period on the balance you have drawn, then a fully amortizing repayment period on that balance. It also shows loan-to-value (LTV), combined LTV (CLTV), available credit, and how much the payment jumps when repayment starts.",
  },
  {
    question: "How is the HELOC draw-period payment calculated?",
    answer:
      "During the draw period you typically pay interest only on the amount drawn, not on the full credit limit. Monthly interest-only payment ≈ drawn balance × (APR ÷ 12). Example: $50,000 drawn at 8.5% APR is about $354.17 per month. Principal usually stays the same unless you make principal payments.",
  },
  {
    question: "How is the HELOC repayment payment calculated?",
    answer:
      "When the repayment period begins, the remaining drawn balance is amortized like a fixed installment loan over the repayment term. The formula is the same as a standard amortization payment: P × r ÷ (1 − (1 + r)^−n), where r is the monthly rate and n is repayment months. That payment is usually higher than interest-only, which is the payment jump.",
  },
  {
    question: "What are LTV and CLTV on a HELOC?",
    answer:
      "LTV (loan-to-value) is your first mortgage balance divided by home value. CLTV (combined LTV) adds the HELOC — either the credit limit or the amount drawn — to the first mortgage, then divides by home value. Lenders often cap CLTV (commonly around 80–85%) when sizing a HELOC. This calculator also estimates a max HELOC line from a max CLTV percent you enter.",
  },
  {
    question: "Why does my payment jump after the draw period?",
    answer:
      "Draw payments cover interest only. Repayment payments must cover interest plus principal so the balance reaches zero by the end of the repayment term. The difference (repayment payment minus draw payment) is the payment jump. Making the jump obvious helps you plan cash flow before the repayment phase starts.",
  },
  {
    question: "Do extra payments apply during the draw period?",
    answer:
      "This calculator applies optional extra monthly principal during the repayment phase only, similar to an amortization calculator. Extra principal shortens payoff and cuts interest after amortization begins. During a typical interest-only draw period, any extra you pay would reduce principal; check your lender’s rules for how extras are applied.",
  },
  {
    question: "Is this HELOC calculator financial or lending advice?",
    answer:
      "No. Results are an educational estimate from the numbers you enter. HELOC rates are often variable, draw and repayment lengths differ by product, and lenders set CLTV caps, fees, and payment rules. Check your loan documents or a qualified advisor for your situation.",
  },
  {
    question: "Does this HELOC calculator upload my numbers?",
    answer:
      "No. Home value, mortgage, HELOC amounts, and rates are calculated in your browser. Nothing is sent to a server or stored on our side, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "HELOC Calculator — Draw & Repayment Payments, LTV & CLTV",
  description:
    "Free HELOC calculator. Estimate interest-only draw payments, fully amortizing repayment payments, the payment jump, LTV/CLTV, max HELOC from equity, and total interest — with optional extra payments. Runs in your browser.",
  alternates: { canonical: href },
};

export default function HelocCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        HELOC Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Estimate home equity line of credit payments for both phases: interest-only
        during the draw period on the balance you have drawn, then a fully
        amortizing repayment payment — with the payment jump called out. See LTV,
        combined LTV, max HELOC from a CLTV cap, and optional extra principal in
        repayment. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Draw + repayment phases</li>
        <li className="chip inline-flex">Payment jump highlighted</li>
        <li className="chip inline-flex">LTV &amp; CLTV</li>
        <li className="chip inline-flex">Extra payments</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <HelocCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A HELOC (home equity line of credit) usually has two phases. In the
          draw period you can borrow against the line and often pay interest
          only on what you have drawn. In the repayment period the remaining
          balance is paid down with fully amortizing principal-and-interest
          payments, so the monthly bill typically rises — that rise is the
          payment jump.
        </p>
        <p>
          Example: a $400,000 home with a $200,000 first mortgage and an $80,000
          HELOC, $50,000 drawn at 8.5% APR, 10-year draw and 20-year repayment.
          Interest-only is about $354 per month; the amortizing repayment payment
          is about $434, a jump of roughly $80. LTV is 50%; CLTV on the full
          line is 70%. Add extra monthly principal in repayment to see earlier
          payoff and lower interest.
        </p>
        <p>
          Results are educational estimates, not a lender quote. Many HELOCs use
          variable rates, and product terms vary. Numbers never leave the device,
          and there is no account.
        </p>
        <p>
          Compare a fixed amortizing schedule with the{" "}
          <Link className="text-mint underline" href="/finance/amortization-calculator">
            amortization calculator
          </Link>
          , or turn fees and rate into an APR-style estimate with the{" "}
          <Link className="text-mint underline" href="/finance/apr-calculator">
            APR calculator
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
          How to use the HELOC calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter home value and first mortgage balance.</li>
          <li>Enter the HELOC credit limit and the amount currently drawn.</li>
          <li>Enter the HELOC APR, draw years, and repayment years.</li>
          <li>Optional: add extra monthly principal for the repayment phase, and adjust max CLTV %.</li>
          <li>Read the interest-only draw payment, amortizing repayment payment, payment jump, LTV/CLTV, and schedule.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
