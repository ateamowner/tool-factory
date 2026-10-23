import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { SquareFootageCalculator } from "@/components/tools/SquareFootageCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/home/square-footage-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Household", href: "/home" },
  { name: "Square Footage Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How do I calculate square footage?",
    answer:
      "For a rectangle or square, multiply the length by the width, both in feet. A room that is 12 ft by 10 ft is 12 × 10 = 120 square feet. For other shapes, use the matching formula, or split the space into rectangles and add them together.",
  },
  {
    question: "How do I calculate square footage with feet and inches?",
    answer:
      "Turn the inches into a fraction of a foot by dividing by 12, then add it to the feet. 12 ft 6 in is 12 + 6 ÷ 12 = 12.5 ft. A 12 ft 6 in by 10 ft room is 12.5 × 10 = 125 square feet. This calculator has separate feet and inches boxes and does the conversion for you.",
  },
  {
    question: "How do I find the square footage of an L-shaped room?",
    answer:
      "Split the L into two rectangles that do not overlap, find the area of each, and add them. For example, a 20 × 10 ft section plus a 10 × 8 ft section is 200 + 80 = 280 square feet. Choose the L-shape option and enter section A and section B.",
  },
  {
    question: "How do I calculate the square footage of a triangle or a circle?",
    answer:
      "A triangle is base × height ÷ 2, so a 10 ft base and a 6 ft height is 30 square feet. A circle is π × radius², where the radius is half the diameter. A 10 ft circle has a 5 ft radius and covers about 78.54 square feet.",
  },
  {
    question: "How do I add up the square footage of several rooms?",
    answer:
      "Measure each room, find its area, and add the results. Use \"Add another room or area\" to list each space with its own shape, and the calculator shows the combined total. The quantity box handles identical rooms, such as three 10 × 10 bedrooms.",
  },
  {
    question: "How do I convert square feet to square yards or square meters?",
    answer:
      "Divide square feet by 9 to get square yards, because one square yard is 3 ft × 3 ft. Multiply square feet by 0.09290304 to get square meters. One square foot is also 144 square inches. The calculator shows all of these next to the total.",
  },
  {
    question: "How much extra should I add for waste?",
    answer:
      "Flooring, tile, and sod are usually bought with extra to cover cuts and mistakes. Around 5% to 10% is common for simple rooms, and 10% to 15% for diagonal layouts or rooms with many corners. Check the product's instructions, then enter that percent in the waste box.",
  },
  {
    question: "Is this the same as the house sq-ft estimator?",
    answer:
      "No. This page measures the floor area of rooms and flat shapes. The house sq-ft estimator approximates exterior wall or roof area for soft washing from a house footprint and stories. Use this calculator for flooring, paint planning by floor area, or listing a room's size.",
  },
];

export const metadata: Metadata = {
  title: "Square Footage Calculator — Area of Rooms & Shapes in Feet",
  description:
    "Free square footage calculator. Enter feet and inches for rectangles, L-shaped rooms, triangles, and circles, add several rooms, and get sq ft, sq yd, and sq m. Runs in your browser.",
  alternates: { canonical: href },
};

export default function SquareFootageCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Square Footage Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Find the area of a room or space in square feet. Enter lengths in feet
        and inches for a rectangle, an L-shaped room, a triangle, or a circle,
        add as many rooms as you need, and see the total in square feet, square
        yards, and square meters. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Feet and inches</li>
        <li className="chip inline-flex">4 shapes</li>
        <li className="chip inline-flex">Multiple rooms</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <SquareFootageCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          Square footage is the area of a flat space measured in square feet.
          For a rectangle, it is length × width. A triangle is base × height ÷
          2, a circle is π × radius², and an L-shaped room is two rectangles
          added together. When a measurement has inches, divide the inches by 12
          and add them to the feet before you multiply.
        </p>
        <p>
          Examples: a 12 ft × 10 ft bedroom is 120 sq ft. A 12 ft 6 in × 10 ft
          room is 125 sq ft. An L-shaped living area made of a 20 × 10 ft section
          and a 10 × 8 ft section is 280 sq ft. Divide by 9 for square yards,
          which is how carpet is often priced.
        </p>
        <p>
          Measuring the outside of a house for washing instead? The{" "}
          <Link className="text-mint underline" href="/home/house-sq-ft-estimator">
            house sq-ft estimator
          </Link>{" "}
          approximates wall or roof area from a footprint and stories. For roof
          squares and waste, use the{" "}
          <Link className="text-mint underline" href="/home/roofing-calculator">
            roofing calculator
          </Link>
          . To turn a slab area into cubic yards and bags, use the{" "}
          <Link className="text-mint underline" href="/home/concrete-calculator">
            concrete calculator
          </Link>{" "}
          or the{" "}
          <Link className="text-mint underline" href="/convert/cubic-yard-calculator">
            cubic yard calculator
          </Link>
          . Hanging walls or a ceiling? The{" "}
          <Link className="text-mint underline" href="/home/drywall-calculator">
            drywall calculator
          </Link>{" "}
          turns room size into sheets and joint compound. Laying a new lawn? The{" "}
          <Link className="text-mint underline" href="/home/sod-calculator">
            sod calculator
          </Link>{" "}
          turns lawn area into rolls and pallets of sod. Browse more tools on the{" "}
          <Link className="text-mint underline" href="/home">
            Household
          </Link>{" "}
          hub.
        </p>
        <p>
          Results are estimates for planning. Measure carefully, and check with
          your supplier before ordering materials.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the square footage calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Pick the shape of the room or area: rectangle, L-shape, triangle, or circle.</li>
          <li>Enter each measurement in feet and inches. Leave a box blank if it is 0.</li>
          <li>Set a quantity if you have several identical rooms.</li>
          <li>Add another room or area to include more spaces in the total.</li>
          <li>Optionally add a waste percent for flooring, tile, or sod.</li>
          <li>Read the total in square feet, square yards, square meters, and square inches.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
