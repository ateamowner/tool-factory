import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { RuleOf72Calculator } from "@/components/tools/RuleOf72Calculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/rule-of-72-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Rule of 72 Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is the Rule of 72?",
    answer:
      "The Rule of 72 is a quick way to estimate how long an investment takes to double at a given annual rate, or what rate you need to double in a set number of years. Divide 72 by the rate percent to get years (72 ÷ 8 = 9 years), or divide 72 by the years to get the rate (72 ÷ 10 = 7.2%). It is an approximation of compound interest, not a bank quote.",
  },
  {
    question: "How do I calculate years to double with the Rule of 72?",
    answer:
      "Divide 72 by the annual interest rate as a percent. At 6%, years ≈ 72 ÷ 6 = 12. At 8%, years ≈ 72 ÷ 8 = 9. The exact compound answer is ln(2) ÷ ln(1 + r), which at 8% is about 9.006 years — very close to the rule’s estimate.",
  },
  {
    question: "How do I find the rate needed to double in N years?",
    answer:
      "Divide 72 by the number of years. To double in 10 years, rate ≈ 72 ÷ 10 = 7.2%. The exact compound rate is 2^(1/t) − 1, which for 10 years is about 7.177%. This calculator shows both the Rule of 72 estimate and the exact rate side by side.",
  },
  {
    question: "What are the Rules of 70 and 69.3?",
    answer:
      "They are the same idea with different constants. The Rule of 70 (years ≈ 70 ÷ rate) is often a bit closer for mid-single-digit rates. The Rule of 69.3 comes from continuous compounding, since ln(2) ≈ 0.693. This page shows 72, 70, and 69.3 estimates together so you can compare them to the exact compound answer.",
  },
  {
    question: "When is the Rule of 72 accurate?",
    answer:
      "It is most accurate for annual rates roughly between 6% and 10%. At very low or very high rates the gap vs exact compound interest grows. Example: at 2%, the Rule of 72 says 36 years, while exact compounding is about 35.003 years. At 20%, the rule says 3.6 years vs about 3.802 exact. Use the exact figure when precision matters.",
  },
  {
    question: "Does the Rule of 72 assume annual compounding?",
    answer:
      "Yes — the classic rule and the exact formulas on this page assume annual compounding (or continuous compounding for the 69.3 variant). More frequent compounding (monthly, daily) shortens the true doubling time a little for the same nominal annual rate. For full growth with contributions and compounding frequency, use the future value calculator.",
  },
  {
    question: "Is this Rule of 72 calculator financial advice?",
    answer:
      "No. Results are an educational estimate of doubling time or required rate from the numbers you enter. Fees, taxes, inflation, and sequence of returns can change real-world outcomes. Check account terms or a qualified advisor before you invest.",
  },
  {
    question: "Does this calculator upload my numbers?",
    answer:
      "No. Rate and years are calculated in your browser. Nothing is sent to a server or stored on our side. There is no account.",
  },
];

export const metadata: Metadata = {
  title: "Rule of 72 Calculator — Years to Double Your Money",
  description:
    "Free rule of 72 calculator. Estimate years to double an investment from a rate, or the rate to double in N years. Shows exact compound answers plus rules of 69.3 and 70. Runs in your browser.",
  alternates: { canonical: href },
};

export default function RuleOf72CalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Rule of 72 Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Estimate how many years an investment takes to double from an annual
        rate, or the rate you need to double in a set number of years. See the
        Rule of 72 estimate next to the exact compound answer, plus Rules of 70
        and 69.3. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Years ↔ rate both ways</li>
        <li className="chip inline-flex">Exact compound beside 72</li>
        <li className="chip inline-flex">Rules of 70 &amp; 69.3</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <RuleOf72Calculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          The Rule of 72 is a mental shortcut for compound interest. Divide 72
          by the annual rate percent to estimate years to double, or divide 72
          by years to estimate the rate you need. At 8%, 72 ÷ 8 = 9 years. The
          exact formula years = ln(2) ÷ ln(1 + r) gives about 9.006 years at
          8% — close enough for a quick check.
        </p>
        <p>
          Working the other way, to double in 10 years the rule says 72 ÷ 10 =
          7.2%. Exact compounding needs 2^(1/10) − 1 ≈ 7.177%. This calculator
          also shows the Rules of 70 and 69.3, which track continuous and
          mid-range compounding a bit more closely for some rates.
        </p>
        <p>
          Results are educational estimates, not financial advice. Fees, taxes,
          and inflation can change real outcomes. Everything runs in your
          browser. Numbers never leave the device, and there is no account.
        </p>
        <p>
          Project a full balance with contributions using the{" "}
          <Link className="text-mint underline" href="/finance/future-value-calculator">
            future value calculator
          </Link>
          , or compare non-compounding growth with the{" "}
          <Link className="text-mint underline" href="/finance/simple-interest-calculator">
            simple interest calculator
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
          How to use the rule of 72 calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose years to double (from a rate) or rate to double (from years).</li>
          <li>Enter the annual rate percent, or the number of years until money doubles.</li>
          <li>Read the Rule of 72 estimate next to the exact compound answer.</li>
          <li>Compare the Rules of 70 and 69.3 for the same inputs.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
