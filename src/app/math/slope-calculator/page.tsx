import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { SlopeCalculator } from "@/components/tools/SlopeCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/slope-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "Slope Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is slope?",
    answer:
      "Slope measures how steep a line is. Between two points (x1, y1) and (x2, y2), the slope m is the change in y divided by the change in x: m = (y2 − y1) / (x2 − x1). A larger absolute value means a steeper line.",
  },
  {
    question: "How do I find the slope from two points?",
    answer:
      "Subtract the y-coordinates to get the rise, subtract the x-coordinates to get the run, then divide: m = rise / run. For (1, 2) and (3, 6), rise = 4 and run = 2, so m = 2.",
  },
  {
    question: "What does a negative slope mean?",
    answer:
      "A negative slope means the line goes down as you move from left to right. For example, (0, 4) and (2, 0) give m = −2. A positive slope goes up from left to right.",
  },
  {
    question: "What is the slope of a horizontal or vertical line?",
    answer:
      "A horizontal line has slope 0 because the rise is 0. A vertical line has undefined slope because the run is 0 and you cannot divide by zero. This calculator labels vertical lines clearly instead of returning a number.",
  },
  {
    question: "How is slope related to the angle of a line?",
    answer:
      "The angle θ that a non-vertical line makes with the positive x-axis satisfies tan(θ) = m, so θ = arctan(m). This calculator shows that angle in degrees. A slope of 1 is 45°, and a slope of 0 is 0°.",
  },
  {
    question: "What is point-slope form?",
    answer:
      "Point-slope form writes the line through a known point (x1, y1) with slope m as y − y1 = m(x − x1). From there you can expand to slope-intercept form y = mx + b, where b is the y-intercept.",
  },
  {
    question: "Can I use decimals in the slope calculator?",
    answer:
      "Yes. Enter any finite decimals for the four coordinates. The calculator validates that each value is a real number and rejects empty or non-numeric input.",
  },
  {
    question: "Is my information saved or uploaded?",
    answer:
      "No. The slope calculator runs entirely in your browser. Numbers are not sent to a server or stored, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "Slope Calculator — Find Slope From Two Points",
  description:
    "Free slope calculator. Find the slope from two points with rise over run, angle in degrees, y-intercept, and point-slope form. Handles vertical and horizontal lines. Runs in your browser.",
  alternates: { canonical: href },
};

export default function SlopeCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Slope Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Find the slope between two points, plus rise, run, angle, y-intercept,
        and the line equation. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Two points → slope</li>
        <li className="chip inline-flex">Rise / run &amp; angle</li>
        <li className="chip inline-flex">Vertical &amp; horizontal</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <SlopeCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          Slope is rise over run. Given points (x₁, y₁) and (x₂, y₂), compute
          m = (y₂ − y₁) / (x₂ − x₁). The same formula gives the angle of the
          line via arctan(m) and the y-intercept from rearranging into
          y = mx + b.
        </p>
        <p>
          Example: from (1, 2) to (3, 6), rise = 4 and run = 2, so m = 2. The
          angle is arctan(2) ≈ 63.43°, the y-intercept is 0, and point-slope
          form is y − 2 = 2(x − 1). A vertical line such as x = 4 has undefined
          slope; a horizontal line such as y = 5 has slope 0.
        </p>
        <p>
          Break a number into primes with the{" "}
          <Link className="text-mint underline" href="/math/factoring-calculator">
            factoring calculator
          </Link>
          , find the greatest common factor with the{" "}
          <Link className="text-mint underline" href="/math/gcf-calculator">
            GCF calculator
          </Link>
          , simplify a ratio with the{" "}
          <Link className="text-mint underline" href="/math/ratio-calculator">
            ratio calculator
          </Link>
          , solve A / B = C / D with the{" "}
          <Link className="text-mint underline" href="/math/proportion-calculator">
            proportion calculator
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
          How to use the slope calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter the coordinates of the first point (x₁, y₁).</li>
          <li>Enter the coordinates of the second point (x₂, y₂).</li>
          <li>Read the slope, rise, run, angle, y-intercept, and equation.</li>
          <li>If the points share an x-value, the result shows an undefined (vertical) slope.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
