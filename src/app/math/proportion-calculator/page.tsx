import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { ProportionCalculator } from "@/components/tools/ProportionCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/proportion-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "Proportion Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a proportion calculator?",
    answer:
      "A proportion calculator works with two equal ratios written as A / B = C / D. It solves for one missing value when you know the other three, or checks whether four numbers form a true proportion.",
  },
  {
    question: "How do I solve a proportion?",
    answer:
      "Cross-multiply, then divide. In A / B = C / D, the cross products are equal: A × D = B × C. For 3 / 4 = 15 / x, 3 × x = 4 × 15, so x = 60 ÷ 3 = 20.",
  },
  {
    question: "How do I know if two ratios are proportional?",
    answer:
      "Multiply diagonally. If A × D equals B × C, the ratios are proportional. 2 / 3 and 10 / 15 are proportional because 2 × 15 = 30 and 3 × 10 = 30. 2 / 3 and 10 / 14 are not, because 28 does not equal 30.",
  },
  {
    question: "What is the cross multiplication formula?",
    answer:
      "For A / B = C / D, the formula is A × D = B × C. Rearranged: A = (B × C) ÷ D, B = (A × D) ÷ C, C = (A × D) ÷ B, and D = (B × C) ÷ A.",
  },
  {
    question: "What is the scale factor in a proportion?",
    answer:
      "The scale factor is how much the first ratio is multiplied to get the second. In 3 / 4 = 15 / 20 both parts are multiplied by 5, so the scale factor is 5. It equals C ÷ A (or D ÷ B).",
  },
  {
    question: "What is the difference between a proportion and a ratio?",
    answer:
      "A ratio compares two numbers, like 3 : 4. A proportion is an equation stating that two ratios are equal, like 3 : 4 = 15 : 20. Use the ratio calculator to simplify a single ratio, and the proportion calculator to solve or check an equation of two ratios.",
  },
  {
    question: "Can a proportion have decimals, fractions, or zero?",
    answer:
      "Decimals work, such as 1.5 / 4 = x / 12, which gives x = 4.5. Convert fractions to decimals first. B and D are denominators, so they cannot be zero, and the value you divide by when solving cannot be zero either.",
  },
  {
    question: "Is my information saved or uploaded?",
    answer:
      "No. The proportion calculator runs entirely in your browser. Numbers are not sent to a server or stored, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "Proportion Calculator — Solve x & Check if Ratios Are Proportional",
  description:
    "Free proportion calculator. Solve A / B = C / D for a missing value by cross-multiplying, or check if two ratios are proportional with cross products and the scale factor. Runs in your browser.",
  alternates: { canonical: href },
};

export default function ProportionCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Proportion Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Solve a proportion A / B = C / D for the missing value, or check
        whether two ratios are proportional. See the cross products and the
        scale factor. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Solve for x</li>
        <li className="chip inline-flex">Check proportions</li>
        <li className="chip inline-flex">Cross products &amp; scale factor</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <ProportionCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A proportion says two ratios are equal: A / B = C / D. Because the
          cross products of a true proportion match (A × D = B × C), you can
          find any one missing term by multiplying the diagonal pair you know
          and dividing by the remaining number.
        </p>
        <p>
          Example: a map scale of 3 cm to 4 km means 15 cm on the map covers
          (4 × 15) ÷ 3 = 20 km. To check a pair of ratios, compare the cross
          products: 2 / 3 and 10 / 15 are proportional because 2 × 15 and
          3 × 10 both equal 30.
        </p>
        <p>
          Need to reduce a single ratio to lowest terms instead? Use the{" "}
          <Link className="text-mint underline" href="/math/ratio-calculator">
            ratio calculator
          </Link>
          . Browse more tools in the{" "}
          <Link className="text-mint underline" href="/math">
            Math
          </Link>{" "}
          hub, find the greatest common factor with the{" "}
          <Link className="text-mint underline" href="/math/gcf-calculator">
            GCF calculator
          </Link>
          , factor one number with the{" "}
          <Link className="text-mint underline" href="/math/factoring-calculator">
            factoring calculator
          </Link>
          , or work out a share of a total with the{" "}
          <Link className="text-mint underline" href="/finance/percent-off-calculator">
            percent off calculator
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the proportion calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Pick Solve for the missing value or Check if ratios are proportional.</li>
          <li>To solve, fill in three of A, B, C, and D and leave the unknown blank.</li>
          <li>To check, enter all four numbers.</li>
          <li>Read the answer, the cross products A × D and B × C, and the scale factor.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
