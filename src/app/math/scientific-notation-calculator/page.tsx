import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { ScientificNotationCalculator } from "@/components/tools/ScientificNotationCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/scientific-notation-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "Scientific Notation Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is scientific notation?",
    answer:
      "Scientific notation writes a number as a coefficient between 1 and 10 times a power of 10. For example, 123,000 = 1.23 × 10⁵ and 0.00045 = 4.5 × 10⁻⁴. It keeps very large and very small numbers short and easy to compare.",
  },
  {
    question: "How do I convert a number to scientific notation?",
    answer:
      "Move the decimal point until exactly one nonzero digit is to its left. Count how many places you moved it: that count is the exponent. Moving left gives a positive exponent and moving right gives a negative one. 52,000 becomes 5.2 × 10⁴, and 0.0071 becomes 7.1 × 10⁻³.",
  },
  {
    question: "How do I convert scientific notation back to standard form?",
    answer:
      "Move the decimal point by the exponent: right for a positive exponent, left for a negative one, filling in zeros as needed. 3.4 × 10⁶ = 3,400,000 and 2.5 × 10⁻³ = 0.0025. Type either form into the calculator and it shows both.",
  },
  {
    question: "What is E notation?",
    answer:
      "E notation is how calculators, spreadsheets and code show scientific notation. The E stands for “times ten to the power of,” so 1.23E+5 means 1.23 × 10⁵ and 4.5E−4 means 4.5 × 10⁻⁴. You can type E notation like 1.23e5 straight into the calculator.",
  },
  {
    question: "How do I multiply or divide numbers in scientific notation?",
    answer:
      "To multiply, multiply the coefficients and add the exponents: (6 × 10⁵)(4 × 10⁵) = 24 × 10¹⁰ = 2.4 × 10¹¹. To divide, divide the coefficients and subtract the exponents: (8 × 10⁶) ÷ (2 × 10²) = 4 × 10⁴. Then adjust so the coefficient is between 1 and 10.",
  },
  {
    question: "How do I add or subtract numbers in scientific notation?",
    answer:
      "Rewrite both numbers with the same power of 10, then add or subtract the coefficients. For 3.2 × 10⁴ + 1.5 × 10³, rewrite 1.5 × 10³ as 0.15 × 10⁴, so the sum is 3.35 × 10⁴. The calculator shows each step.",
  },
  {
    question: "What is the difference between scientific and engineering notation?",
    answer:
      "Engineering notation is like scientific notation, but the exponent is always a multiple of 3 so it lines up with units like kilo (10³), mega (10⁶) and micro (10⁻⁶). 45,000 is 4.5 × 10⁴ in scientific notation and 45 × 10³ in engineering notation.",
  },
  {
    question: "Is my information saved or uploaded?",
    answer:
      "No. The scientific notation calculator runs entirely in your browser. Numbers are not sent to a server or stored, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "Scientific Notation Calculator — Convert, E Notation & Math",
  description:
    "Free scientific notation calculator. Convert numbers to scientific notation and back to standard form, see E notation and engineering notation, and add, subtract, multiply or divide with steps. Runs in your browser.",
  alternates: { canonical: href },
};

export default function ScientificNotationCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Scientific Notation Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Convert any number to scientific notation, like 123,000 = 1.23 × 10⁵,
        or turn scientific notation back into standard form. See the E notation
        and engineering notation, round to significant figures, and add,
        subtract, multiply or divide numbers in scientific notation with steps.
        Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Standard ↔ scientific</li>
        <li className="chip inline-flex">E notation</li>
        <li className="chip inline-flex">+ − × ÷ with steps</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <ScientificNotationCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          Scientific notation writes a number as a × 10ⁿ, where the coefficient
          a is at least 1 and less than 10 and n is a whole number. Big numbers
          get positive exponents and small numbers get negative ones, so the
          distance to the Sun, about 150,000,000 km, is 1.5 × 10⁸ km, and a
          hydrogen atom, about 0.000000000106 m across, is 1.06 × 10⁻¹⁰ m.
        </p>
        <p>
          Example: (6 × 10⁵) × (4 × 10⁵) = 24 × 10¹⁰. Because 24 is not between
          1 and 10, shift the decimal one place and add one to the exponent to
          get 2.4 × 10¹¹, or 2.4E+11 in E notation.
        </p>
        <p>
          Raising numbers to a power? Use the{" "}
          <Link className="text-mint underline" href="/math/exponent-calculator">
            exponent calculator
          </Link>{" "}
          for negative and fractional exponents. Working with roots? Find square and cube roots with the{" "}
          <Link className="text-mint underline" href="/math/square-root-calculator">
            square root calculator
          </Link>
          . Turn a fraction of a whole into a percent with the{" "}
          <Link className="text-mint underline" href="/math/percentage-calculator">
            percentage calculator
          </Link>
          , divide step by step with the{" "}
          <Link className="text-mint underline" href="/math/long-division-calculator">
            long division calculator
          </Link>
          , or browse more tools in the{" "}
          <Link className="text-mint underline" href="/math">
            Math
          </Link>{" "}
          hub.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the scientific notation calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Pick “Convert a number” or “Add, subtract, multiply, divide.”</li>
          <li>Type numbers in any form: 123000, 0.00045, 1.23e5, or 1.23 x 10^5.</li>
          <li>Optionally choose how many significant figures to round to.</li>
          <li>Read scientific, E, standard and engineering notation in the result panel, and follow the steps.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
