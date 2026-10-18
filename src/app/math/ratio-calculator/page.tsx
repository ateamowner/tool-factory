import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { RatioCalculator } from "@/components/tools/RatioCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/ratio-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "Ratio Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a ratio calculator?",
    answer:
      "A ratio calculator compares two quantities. It can reduce a ratio like 1920 : 1080 to its simplest form (16 : 9), or solve a missing value in an equivalent ratio such as 2 : 3 = 10 : ?.",
  },
  {
    question: "How do I simplify a ratio?",
    answer:
      "Divide both numbers by their greatest common factor. For 12 : 18 the greatest common factor is 6, so the ratio simplifies to 2 : 3. If the ratio has decimals, multiply both sides by 10 or 100 first to make them whole numbers.",
  },
  {
    question: "How do I solve A : B = C : D for a missing value?",
    answer:
      "Cross-multiply. A × D = B × C. To find D, use D = (B × C) ÷ A. For 2 : 3 = 10 : D, D = (3 × 10) ÷ 2 = 15.",
  },
  {
    question: "What is the difference between a ratio and a proportion?",
    answer:
      "A ratio compares two numbers, like 2 : 3. A proportion says two ratios are equal, like 2 : 3 = 10 : 15. Solving for a missing term in a proportion is the same as scaling a ratio up or down.",
  },
  {
    question: "How do I convert a ratio to a percentage?",
    answer:
      "Add the two parts to get the total, then divide each part by the total and multiply by 100. A 3 : 5 ratio is 3 ÷ 8 = 37.5% and 5 ÷ 8 = 62.5% of the whole.",
  },
  {
    question: "How do I write a ratio as 1 : n?",
    answer:
      "Divide both sides by the first number. 4 : 10 becomes 1 : 2.5. This form is handy for scale drawings, mixing instructions, and gear ratios.",
  },
  {
    question: "Can I use decimals in the ratio calculator?",
    answer:
      "Yes. Enter decimals such as 1.5 : 2.5 and the calculator scales them to whole numbers before reducing, so 1.5 : 2.5 simplifies to 3 : 5.",
  },
  {
    question: "Is my information saved or uploaded?",
    answer:
      "No. The ratio calculator runs entirely in your browser. Numbers are not sent to a server or stored, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "Ratio Calculator — Simplify Ratios & Solve A:B = C:D",
  description:
    "Free ratio calculator. Simplify a ratio to lowest terms, solve for a missing value in A : B = C : D, and see the ratio as 1 : n, a decimal, and percentages. Runs in your browser.",
  alternates: { canonical: href },
};

export default function RatioCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Ratio Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Simplify a ratio to its lowest terms or solve for a missing value in
        A : B = C : D. See the result as 1 : n, a decimal, and a percentage
        split. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Simplify ratios</li>
        <li className="chip inline-flex">Solve A : B = C : D</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <RatioCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A ratio compares two quantities. To simplify one, divide both sides
          by their greatest common factor. To solve an equivalent ratio,
          cross-multiply: A × D = B × C, then divide to isolate the blank.
        </p>
        <p>
          Example: a 1920 × 1080 screen is 16 : 9 because both numbers divide
          by 120. If a recipe calls for 2 cups of flour to 3 cups of water and
          you use 10 cups of flour, you need (3 × 10) ÷ 2 = 15 cups of water.
        </p>
        <p>
          Browse the{" "}
          <Link className="text-mint underline" href="/math">
            Math
          </Link>{" "}
          hub, solve or check an equation of two ratios with the{" "}
          <Link className="text-mint underline" href="/math/proportion-calculator">
            proportion calculator
          </Link>
          , find the greatest common factor with the{" "}
          <Link className="text-mint underline" href="/math/gcf-calculator">
            GCF calculator
          </Link>
          , factor one number with the{" "}
          <Link className="text-mint underline" href="/math/factoring-calculator">
            factoring calculator
          </Link>
          , find the slope between two points with the{" "}
          <Link className="text-mint underline" href="/math/slope-calculator">
            slope calculator
          </Link>
          , measure the spread of a data set with the{" "}
          <Link className="text-mint underline" href="/math/standard-deviation-calculator">
            standard deviation calculator
          </Link>
          , find a percent of a number or percent change with the{" "}
          <Link className="text-mint underline" href="/math/percentage-calculator">
            percentage calculator
          </Link>
          , work out a share of a total with the{" "}
          <Link className="text-mint underline" href="/finance/percent-off-calculator">
            percent off calculator
          </Link>{" "}
          and convert units with the{" "}
          <Link className="text-mint underline" href="/convert/mm-to-inches-calculator">
            mm to inches calculator
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the ratio calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Pick Solve A : B = C : D or Simplify a ratio.</li>
          <li>To solve, fill in three boxes and leave the unknown one blank.</li>
          <li>To simplify, enter the two numbers in the ratio.</li>
          <li>Read the answer, plus the 1 : n form, decimal, and percentage split.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
