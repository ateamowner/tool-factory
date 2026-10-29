import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { SquareRootCalculator } from "@/components/tools/SquareRootCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/square-root-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "Square Root Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a square root?",
    answer:
      "The square root of a number n is the value that, multiplied by itself, gives n. For example, √49 = 7 because 7 × 7 = 49. Every positive number has two square roots, one positive and one negative; the √ symbol means the positive one.",
  },
  {
    question: "How do I simplify a square root?",
    answer:
      "Find the largest perfect square that divides the number, then pull its root outside the radical. For 72, the largest square factor is 36, so √72 = √36 × √2 = 6√2. The calculator does this for any whole number and shows each step.",
  },
  {
    question: "What is a perfect square?",
    answer:
      "A perfect square is a whole number whose square root is also a whole number, like 1, 4, 9, 16, 25, 36, 49, 64, 81, and 100. The calculator flags perfect squares so you know the answer is exact, not a rounded decimal.",
  },
  {
    question: "What is the square root of a negative number?",
    answer:
      "No real number squared gives a negative, so the square root of a negative number is imaginary. Write it with i, where i = √−1. For example, √−72 = √72 × i = 6√2 i ≈ 8.485i, and √−36 = 6i.",
  },
  {
    question: "What is a cube root?",
    answer:
      "The cube root of n is the number that, multiplied by itself three times, gives n. ∛27 = 3 because 3 × 3 × 3 = 27. Switch the toggle to cube root to get the decimal, the simplified radical (∛54 = 3∛2), and a perfect cube check.",
  },
  {
    question: "Can you take the cube root of a negative number?",
    answer:
      "Yes. Unlike square roots, cube roots of negative numbers are real. A negative times a negative times a negative is negative, so ∛−27 = −3 and ∛−16 = −2∛2 ≈ −2.52.",
  },
  {
    question: "How do I find a square root without a calculator?",
    answer:
      "Bracket the number between two perfect squares, then refine. √50 sits between √49 = 7 and √64 = 8, close to 7. Try 7.07: 7.07² ≈ 49.98, so √50 ≈ 7.07. Simplifying first also helps: √50 = 5√2 ≈ 5 × 1.414 = 7.07.",
  },
  {
    question: "Is my information saved or uploaded?",
    answer:
      "No. The square root calculator runs entirely in your browser. Numbers are not sent to a server or stored, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "Square Root Calculator — Simplify Radicals & Cube Roots",
  description:
    "Free square root calculator. Get the decimal answer and the simplified radical (√72 = 6√2), see if a number is a perfect square, switch to cube roots, and handle negative numbers with i. Runs in your browser.",
  alternates: { canonical: href },
};

export default function SquareRootCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Square Root Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Find the square root of any number as a decimal and as a simplified
        radical, like √72 = 6√2. See whether it is a perfect square, switch to
        cube roots, and get imaginary answers for negative numbers. Everything
        runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Simplified radical</li>
        <li className="chip inline-flex">Perfect square check</li>
        <li className="chip inline-flex">Cube root toggle</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <SquareRootCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A square root undoes squaring: √n is the number that gives n when
          multiplied by itself. When n is not a perfect square, the exact answer
          is a radical. Simplifying it means pulling out the largest square
          factor, which is how √72 becomes 6√2 ≈ 8.485.
        </p>
        <p>
          Example: √200 = √(100 × 2) = 10√2 ≈ 14.142. For a negative input such
          as −200, the answer is imaginary: √−200 = 10√2 i. Cube roots work for
          negatives too, so ∛−8 = −2.
        </p>
        <p>
          Square roots show up in the discriminant of the{" "}
          <Link className="text-mint underline" href="/math/quadratic-formula-calculator">
            quadratic formula calculator
          </Link>
          . Break a number into primes with the{" "}
          <Link className="text-mint underline" href="/math/factoring-calculator">
            factoring calculator
          </Link>
          . Write very large or small answers with the{" "}
          <Link className="text-mint underline" href="/math/scientific-notation-calculator">
            scientific notation calculator
          </Link>
          , measure spread with the{" "}
          <Link className="text-mint underline" href="/math/standard-deviation-calculator">
            standard deviation calculator
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
          How to use the square root calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose square root or cube root with the toggle.</li>
          <li>Enter a number. Negatives and decimals are fine.</li>
          <li>Read the decimal answer and the simplified radical in the result panel.</li>
          <li>Follow the steps to see which square or cube factor was pulled out.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
