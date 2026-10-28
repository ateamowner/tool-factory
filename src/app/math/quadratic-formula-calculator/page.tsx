import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { QuadraticFormulaCalculator } from "@/components/tools/QuadraticFormulaCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/quadratic-formula-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "Quadratic Formula Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is the quadratic formula?",
    answer:
      "For any equation ax² + bx + c = 0 with a not equal to 0, the solutions are x = (−b ± √(b² − 4ac)) / 2a. The ± gives the two roots: one using plus and one using minus.",
  },
  {
    question: "What is the discriminant?",
    answer:
      "The discriminant is D = b² − 4ac, the part under the square root. If D is positive there are two different real roots, if D is 0 there is one repeated real root, and if D is negative there are two complex roots that are conjugates of each other.",
  },
  {
    question: "How do complex roots work?",
    answer:
      "When D is negative, √D is imaginary: √D = i√|D|. The roots become −b/2a ± (√|D| / 2a)i. For x² + 2x + 5 = 0, D = 4 − 20 = −16, so x = (−2 ± 4i) / 2 = −1 ± 2i.",
  },
  {
    question: "How do I find the vertex of a parabola?",
    answer:
      "The vertex of y = ax² + bx + c sits at x = −b / 2a. Plug that x back in to get y, which simplifies to c − b² / 4a. The vertical line x = −b / 2a is the axis of symmetry, and the parabola opens up when a > 0 and down when a < 0.",
  },
  {
    question: "Why can't a be 0?",
    answer:
      "If a = 0 the x² term disappears and the equation becomes bx + c = 0, which is linear. A linear equation has at most one solution, x = −c / b, and the quadratic formula would divide by zero.",
  },
  {
    question: "Should I use the quadratic formula or factoring?",
    answer:
      "Factoring is quicker when the roots are whole numbers or simple fractions, like x² − 3x + 2 = (x − 1)(x − 2). The quadratic formula always works, including irrational and complex roots. To factor a whole number into primes instead, use the factoring calculator.",
  },
  {
    question: "Can you walk through an example?",
    answer:
      "Solve 2x² + 4x − 6 = 0. Here a = 2, b = 4, c = −6. D = 16 − 4 × 2 × (−6) = 16 + 48 = 64, and √64 = 8. So x = (−4 ± 8) / 4, giving x = 1 and x = −3. The vertex is at x = −4 / 4 = −1, y = −6 − 16 / 8 = −8.",
  },
  {
    question: "Is my information saved or uploaded?",
    answer:
      "No. The quadratic formula calculator runs entirely in your browser. Numbers are not sent to a server or stored, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "Quadratic Formula Calculator — Roots, Discriminant & Vertex",
  description:
    "Free quadratic formula calculator. Enter a, b, and c to solve ax² + bx + c = 0 with the discriminant shown step by step, real or complex roots, and the parabola's vertex. Runs in your browser.",
  alternates: { canonical: href },
};

export default function QuadraticFormulaCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Quadratic Formula Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Solve ax² + bx + c = 0 with the quadratic formula. See the discriminant
        worked out step by step, get real or complex roots, and find the vertex
        of the parabola. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Discriminant steps</li>
        <li className="chip inline-flex">Real and complex roots</li>
        <li className="chip inline-flex">Vertex and axis</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <QuadraticFormulaCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          The quadratic formula, x = (−b ± √(b² − 4ac)) / 2a, solves every
          quadratic equation. The discriminant b² − 4ac tells you what kind of
          answer to expect before you finish: two real roots, one repeated root,
          or a pair of complex roots.
        </p>
        <p>
          Example: x² − 3x + 2 = 0 has a = 1, b = −3, c = 2. The discriminant is
          9 − 8 = 1, so x = (3 ± 1) / 2, which gives x = 1 and x = 2. The vertex
          is at (1.5, −0.25), halfway between the roots.
        </p>
        <p>
          To break a whole number into primes, use the{" "}
          <Link className="text-mint underline" href="/math/factoring-calculator">
            factoring calculator
          </Link>
          . Simplify the radical in your answer with the{" "}
          <Link className="text-mint underline" href="/math/square-root-calculator">
            square root calculator
          </Link>
          . Find the slope of a line between two points with the{" "}
          <Link className="text-mint underline" href="/math/slope-calculator">
            slope calculator
          </Link>
          , find the greatest common factor with the{" "}
          <Link className="text-mint underline" href="/math/gcf-calculator">
            GCF calculator
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
          How to use the quadratic formula calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Write your equation as ax² + bx + c = 0.</li>
          <li>Enter a, b, and c. Negative numbers and decimals are fine; a cannot be 0.</li>
          <li>Follow the steps to see the discriminant and the formula worked out.</li>
          <li>Read the roots, the root type, and the vertex in the result panel.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
