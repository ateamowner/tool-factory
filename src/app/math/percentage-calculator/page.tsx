import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { PercentageCalculator } from "@/components/tools/PercentageCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/percentage-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "Percentage Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How do I calculate a percentage of a number?",
    answer:
      "Divide the percent by 100 to turn it into a decimal, then multiply by the number. For example, 20% of 150 is 0.20 × 150 = 30. Pick the \"What is X% of Y?\" mode, enter 20 and 150, and the calculator shows the answer and each step.",
  },
  {
    question: "How do I find what percent one number is of another?",
    answer:
      "Divide the part by the whole and multiply by 100. For example, 30 out of 150 is 30 ÷ 150 = 0.2, and 0.2 × 100 = 20%. Use the \"X is what % of Y?\" mode for this.",
  },
  {
    question: "How do I calculate percent change?",
    answer:
      "Subtract the starting value from the new value, divide by the starting value, and multiply by 100. Going from 50 to 75 is (75 − 50) ÷ 50 × 100 = a 50% increase. Going from 80 to 60 is (60 − 80) ÷ 80 × 100 = −25%, a 25% decrease.",
  },
  {
    question: "What is the percentage formula?",
    answer:
      "The core formula is Part = Percent ÷ 100 × Whole. Rearrange it to find any missing piece: Percent = Part ÷ Whole × 100, and Whole = Part ÷ (Percent ÷ 100). Percent change uses (New − Old) ÷ |Old| × 100.",
  },
  {
    question: "What is the difference between percent change and percentage points?",
    answer:
      "Percent change is relative to the starting value, while percentage points are a simple subtraction of two percentages. A rate that goes from 10% to 15% rose 5 percentage points, but that is a 50% increase in the rate itself.",
  },
  {
    question: "Why isn't a 50% increase followed by a 50% decrease back to the start?",
    answer:
      "Each percent is applied to a different base. 100 increased by 50% is 150, but 50% of 150 is 75, so a 50% decrease lands at 75. To undo a 50% increase you need a 33.33% decrease.",
  },
  {
    question: "Can a percentage be more than 100% or negative?",
    answer:
      "Yes. A part bigger than the whole gives more than 100% (150 is 150% of 100), and a value that more than doubles shows a percent increase over 100%. A negative percent change means the value went down. Percent change from a starting value of 0 is undefined.",
  },
  {
    question: "Is this the same as a percent off or discount calculator?",
    answer:
      "No. This is a general percentage calculator for percents of numbers, part-to-whole percentages, and percent change. To find a sale price after a discount, use the percent off calculator, which handles original price, percent off, and dollars off.",
  },
];

export const metadata: Metadata = {
  title: "Percentage Calculator — % of a Number, Percent & Change",
  description:
    "Free percentage calculator. Find X% of Y, what percent X is of Y, and the percent increase or decrease from X to Y, with step-by-step work. Runs in your browser.",
  alternates: { canonical: href },
};

export default function PercentageCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Percentage Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Work out any everyday percentage: what X% of a number is, what percent
        one number is of another, and the percent increase or decrease between
        two values, with every step shown. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">X% of Y</li>
        <li className="chip inline-flex">X is what % of Y</li>
        <li className="chip inline-flex">Percent change</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <PercentageCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A percentage is a number out of 100. To find X% of Y, multiply Y by X
          ÷ 100. To find what percent X is of Y, divide X by Y and multiply by
          100. To find the percent change from X to Y, divide the difference
          (Y − X) by the starting value X and multiply by 100. A positive result
          is an increase and a negative result is a decrease.
        </p>
        <p>
          Examples: 20% of 150 is 30. 30 is 20% of 150. Going from 50 to 75 is a
          50% increase, and going from 80 to 60 is a 25% decrease. People also
          search this as a percent calculator, a percentage increase calculator,
          or a percent change calculator; they all live on this one page.
        </p>
        <p>
          Shopping for a sale price instead? The{" "}
          <Link className="text-mint underline" href="/finance/percent-off-calculator">
            percent off calculator
          </Link>{" "}
          finds the discount and final price from an original price. Simplify a
          ratio or see it as a percentage with the{" "}
          <Link className="text-mint underline" href="/math/ratio-calculator">
            ratio calculator
          </Link>
          , solve A / B = C / D with the{" "}
          <Link className="text-mint underline" href="/math/proportion-calculator">
            proportion calculator
          </Link>
          , find the greatest common factor with the{" "}
          <Link className="text-mint underline" href="/math/gcf-calculator">
            GCF calculator
          </Link>
          , break a number into primes with the{" "}
          <Link className="text-mint underline" href="/math/factoring-calculator">
            factoring calculator
          </Link>
          , find the slope between two points with the{" "}
          <Link className="text-mint underline" href="/math/slope-calculator">
            slope calculator
          </Link>
          , or measure the spread of a data set with the{" "}
          <Link className="text-mint underline" href="/math/standard-deviation-calculator">
            standard deviation calculator
          </Link>
          . Browse more tools in the{" "}
          <Link className="text-mint underline" href="/math">
            Math
          </Link>{" "}
          hub.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the percentage calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Pick a calculation: X% of Y, X is what percent of Y, or percent change from X to Y.</li>
          <li>Enter the two numbers. Decimals, negatives, commas, and a trailing % sign are fine.</li>
          <li>Read the answer in the result panel; it updates as you type.</li>
          <li>Follow the step-by-step work to see how the answer was found.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
