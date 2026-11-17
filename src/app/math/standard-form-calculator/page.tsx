import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { StandardFormCalculator } from "@/components/tools/StandardFormCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/standard-form-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "Standard Form Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is standard form of a linear equation?",
    answer:
      "Standard form writes a line as Ax + By = C, where A, B and C are integers, A is not negative, and A and B are not both zero. For example, y = 2x + 3 becomes 2x − y = −3.",
  },
  {
    question: "How do I use this standard form calculator?",
    answer:
      "Pick From y = mx + b or From point-slope, enter the slope and either the y-intercept or a point, and the calculator returns Ax + By = C with the steps. Fractions like 2/3 and decimals are accepted.",
  },
  {
    question: "How do I convert slope-intercept form to standard form?",
    answer:
      "Start with y = mx + b and move the x term to the left: −mx + y = b. If m or b is a fraction, multiply every term by the common denominator. Then divide by any common factor and make A positive. For y = (2/3)x + 4 this gives 2x − 3y = −12.",
  },
  {
    question: "How do I convert point-slope form to standard form?",
    answer:
      "Expand y − y₁ = m(x − x₁) to get y = mx − mx₁ + y₁, then collect terms: −mx + y = y₁ − mx₁. Clear fractions and make A positive. For y − 2 = 2(x − 1), the standard form is 2x − y = 0.",
  },
  {
    question: "Why must A be positive and the coefficients be integers?",
    answer:
      "It is a convention that gives every line one agreed form. Without it, 2x − y = −3 and −2x + y = 3 describe the same line. Clearing fractions and removing common factors makes the answer unique.",
  },
  {
    question: "How do I find the slope and intercepts from Ax + By = C?",
    answer:
      "The slope is −A/B (when B is not zero), the y-intercept is C/B and the x-intercept is C/A. For 2x − 3y = −12, the slope is 2/3, the y-intercept is 4 and the x-intercept is −6. The slope calculator can check a line from two points.",
  },
  {
    question: "What does standard form mean for a number like 4.5 × 10⁴?",
    answer:
      "In UK-style math, standard form means scientific notation: a × 10ⁿ with 1 ≤ a < 10. So 45,000 is 4.5 × 10⁴ and 0.00032 is 3.2 × 10⁻⁴. The third tab converts an ordinary number. For math with E notation, use the scientific notation calculator.",
  },
  {
    question: "Is my data saved or uploaded?",
    answer:
      "No. The standard form calculator runs entirely in your browser. Your numbers are not sent to a server or stored, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "Standard Form Calculator — Ax + By = C and a × 10ⁿ",
  description:
    "Free standard form calculator. Convert slope-intercept or point-slope form to Ax + By = C with steps, or write a number in standard form a × 10ⁿ. Runs in your browser.",
  alternates: { canonical: href },
};

export default function StandardFormCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Standard Form Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Write a line in standard form, Ax + By = C. Enter a slope and
        y-intercept or a slope and a point, and this standard form calculator
        clears fractions, removes common factors and shows the steps. A third
        tab writes an ordinary number in standard form, a × 10ⁿ. Everything runs
        in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Slope-intercept to Ax + By = C</li>
        <li className="chip inline-flex">Point-slope to Ax + By = C</li>
        <li className="chip inline-flex">Fractions and decimals</li>
        <li className="chip inline-flex">Number to a × 10ⁿ</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <StandardFormCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <h2 className="text-2xl font-semibold tracking-tight text-text">How to convert to standard form</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Start from y = mx + b, or expand y − y₁ = m(x − x₁) first.</li>
          <li>Move the x term to the left side so the equation reads −mx + y = b.</li>
          <li>Multiply every term by the common denominator to clear fractions.</li>
          <li>Divide by any common factor, then multiply by −1 if A is negative.</li>
        </ol>
        <h2 className="text-2xl font-semibold tracking-tight text-text">Worked example</h2>
        <p>
          Take y = (2/3)x + 4. Moving the x term gives −(2/3)x + y = 4.
          Multiplying by 3 gives −2x + 3y = 12, and multiplying by −1 makes A
          positive: 2x − 3y = −12. From point-slope form, y − 5 = (2/3)(x − 3)
          expands to −(2/3)x + y = 3, which is 2x − 3y = −9.
          To check a line from two points, use the{" "}
          <Link className="text-mint underline" href="/math/slope-calculator">
            slope calculator
          </Link>
          , and to solve two lines together use the{" "}
          <Link className="text-mint underline" href="/math/system-of-equations-calculator">
            system of equations calculator
          </Link>
          .
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-text">Standard form as a number</h2>
        <p>
          In UK-style math, standard form means scientific notation: a × 10ⁿ
          with a between 1 and 10. The number 45,000 is 4.5 × 10⁴, and 0.00032
          is 3.2 × 10⁻⁴. The third tab here converts one ordinary number. To
          add, multiply or divide numbers in this form, or to use E notation,
          open the{" "}
          <Link className="text-mint underline" href="/math/scientific-notation-calculator">
            scientific notation calculator
          </Link>
          .
        </p>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
