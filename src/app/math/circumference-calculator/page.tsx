import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { CircumferenceCalculator } from "@/components/tools/CircumferenceCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/circumference-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "Circumference Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is the formula for circumference?",
    answer:
      "The circumference of a circle is C = 2πr, where r is the radius, or C = πd, where d is the diameter. Both say the same thing, because the diameter is twice the radius. A circle with a radius of 5 inches has a circumference of 2 × π × 5 = 10π, or about 31.42 inches.",
  },
  {
    question: "How do I find the circumference from the diameter?",
    answer:
      "Multiply the diameter by π. A 12-inch pizza has a circumference of 12π, which is about 37.70 inches. If you only know the radius, double it first to get the diameter, or use C = 2πr directly.",
  },
  {
    question: "How do I find the radius from the circumference?",
    answer:
      "Divide the circumference by 2π. A circle with a circumference of 50 cm has a radius of 50 ÷ (2π) ≈ 7.958 cm and a diameter of 50 ÷ π ≈ 15.915 cm. This is handy when you can wrap a tape measure around something round, like a tree, post or pipe, but cannot measure straight across it.",
  },
  {
    question: "How do I find the area of a circle?",
    answer:
      "Use A = πr². Square the radius, then multiply by π. A circle with a radius of 3 feet has an area of 9π, or about 28.27 square feet. Area is always in square units, so if the radius is in feet, the area is in square feet.",
  },
  {
    question: "How do I find the circumference from the area?",
    answer:
      "First find the radius with r = √(A ÷ π), then use C = 2πr. For an area of 100 square meters, r = √(100 ÷ π) ≈ 5.642 m, so the circumference is about 35.45 m. A shortcut is C = 2√(πA), which gives the same answer in one step.",
  },
  {
    question: "What does it mean to give the answer in terms of π?",
    answer:
      "An answer in terms of π leaves π as a symbol instead of turning it into a decimal, such as 10π instead of 31.4159. It is exact, which is why math classes often ask for it. This calculator shows both the exact π form and the rounded decimal so you can use whichever your homework or project needs.",
  },
  {
    question: "What is the difference between circumference and perimeter?",
    answer:
      "Circumference is the perimeter of a circle: the distance all the way around its edge. Perimeter is the general word for the distance around any flat shape, like a rectangle or triangle. For circles, circumference is the standard term, and it is measured in regular length units like inches, feet or meters.",
  },
  {
    question: "What value of π does the calculator use?",
    answer:
      "It uses JavaScript's built-in value of π, about 3.141592653589793, and rounds the decimal answers to 4 places. Using 3.14 instead gives slightly different results, so if your class says to use 3.14, expect small differences in the last digits. Everything runs in your browser, and nothing is uploaded.",
  },
];

export const metadata: Metadata = {
  title: "Circumference Calculator — Radius, Diameter, Circumference & Area",
  description:
    "Free circumference calculator. Enter the radius, diameter, circumference or area of a circle and get the other three, in terms of π and as decimals, with units and formulas.",
  alternates: { canonical: href },
};

export default function CircumferenceCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Circumference Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Find the circumference of a circle from its radius, diameter or area, or
        work backward from the circumference to the radius, diameter and area.
        Answers are shown in terms of π and as decimals, with units. Everything
        runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Solve from any one value</li>
        <li className="chip inline-flex">Exact π form & decimals</li>
        <li className="chip inline-flex">Inches, feet, meters & more</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <CircumferenceCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>Four formulas connect every measurement of a circle:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Diameter</strong>: d = 2r
          </li>
          <li>
            <strong>Circumference</strong>: C = 2πr = πd
          </li>
          <li>
            <strong>Area</strong>: A = πr²
          </li>
          <li>
            <strong>Radius from circumference or area</strong>: r = C ÷ 2π, or r = √(A ÷ π)
          </li>
        </ul>
        <p>
          Example: a round table is 48 inches across. The radius is 24 inches, the
          circumference is 48π ≈ 150.80 inches, and the area is 576π ≈ 1,809.56
          square inches, or about 12.57 square feet.
        </p>
        <p>
          Measuring a room or patio with a round section? The{" "}
          <Link className="text-mint underline" href="/home/square-footage-calculator">
            square footage calculator
          </Link>{" "}
          adds circles, rectangles and L-shapes together in feet and inches. Find
          the steepness of a line from two points with the{" "}
          <Link className="text-mint underline" href="/math/slope-calculator">
            slope calculator
          </Link>
          , simplify square roots with the{" "}
          <Link className="text-mint underline" href="/math/square-root-calculator">
            square root calculator
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
          How to use the circumference calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Pick the measurement you know: radius, diameter, circumference or area.</li>
          <li>Type the value and choose a unit such as inches, feet, centimeters or meters.</li>
          <li>Read the other three measurements, each shown in terms of π and as a decimal.</li>
          <li>Copy the answer you need. Area is in square units of the unit you picked.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
